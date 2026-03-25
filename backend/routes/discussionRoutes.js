const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/discussions');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `post-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images (jpeg, jpg, png, webp) are allowed!'));
  }
});

// Discussion Post Schema
const discussionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  title: { type: String, default: '' }, // Made optional for feed style
  content: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  type: { type: String, enum: ['text', 'image'], default: 'text' },
  authorName: { type: String, default: '' },
  authorAvatar: { type: String, default: '' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  replies: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    authorName: String,
    authorAvatar: String,
    content: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    createdAt: { type: Date, default: Date.now }
  }],
  isPinned: { type: Boolean, default: false },
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

const Discussion = mongoose.model('Discussion', discussionSchema);

// Static route for serving uploaded images
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Get discussions for a topic
router.get('/discussions', auth, asyncHandler(async (req, res) => {
  const { subject, topic, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (subject) filter.subject = subject;
  if (topic) filter.topic = topic;

  const discussions = await Discussion.find(filter)
    .sort({ isPinned: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Discussion.countDocuments(filter);
  res.json({ discussions, total, page: Number(page), totalPages: Math.ceil(total / limit) });
}));

// Create discussion post (Updated for Image Support)
router.post('/discussions', auth, upload.single('image'), asyncHandler(async (req, res) => {
  const { subject, topic, title, content, tags } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });

  const Student = require('../models/Student');
  const student = await Student.findById(req.studentId);

  const imageUrl = req.file ? `/api/uploads/discussions/${req.file.filename}` : '';

  const discussion = new Discussion({
    studentId: req.studentId, 
    subject: subject || 'General', 
    topic: topic || 'General', 
    title: title || '', 
    content,
    imageUrl,
    type: imageUrl ? 'image' : 'text',
    authorName: student.displayName || student.username,
    authorAvatar: student.profilePicture || '',
    tags: tags || []
  });
  await discussion.save();

  // Award XP for participation
  student.xp += 10; // Extra XP for community sharing
  student.level = Math.floor(student.xp / 100) + 1;
  await student.save();

  res.json({ discussion, xpEarned: 10 });
}));

// Add reply
router.post('/discussions/:id/reply', auth, asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Reply content is required' });

  const Student = require('../models/Student');
  const student = await Student.findById(req.studentId);

  const discussion = await Discussion.findById(req.params.id);
  if (!discussion) return res.status(404).json({ error: 'Discussion not found' });

  discussion.replies.push({
    studentId: req.studentId,
    authorName: student.displayName || student.username,
    authorAvatar: student.profilePicture || '',
    content
  });
  await discussion.save();

  // Award XP
  student.xp += 3;
  student.level = Math.floor(student.xp / 100) + 1;
  await student.save();

  res.json({ discussion, xpEarned: 3 });
}));

// Like a discussion
router.post('/discussions/:id/like', auth, asyncHandler(async (req, res) => {
  const discussion = await Discussion.findById(req.params.id);
  if (!discussion) return res.status(404).json({ error: 'Discussion not found' });

  const idx = discussion.likes.indexOf(req.studentId);
  if (idx > -1) discussion.likes.splice(idx, 1);
  else discussion.likes.push(req.studentId);
  await discussion.save();

  res.json({ likes: discussion.likes.length, liked: idx === -1 });
}));

module.exports = router;
