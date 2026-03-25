const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const { auth, JWT_SECRET } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const notificationService = require('../services/notificationService');

// Register
router.post('/register', authLimiter, validate({
  username: { required: true, type: 'string', minLength: 3, maxLength: 30 },
  email: { required: true, type: 'string' },
  password: { required: true, type: 'string', minLength: 6 }
}), asyncHandler(async (req, res) => {
  const { username, email, password, displayName } = req.body;
  const existing = await Student.findOne({ $or: [{ email }, { username }] });
  if (existing) return res.status(400).json({ error: 'Username or email already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const student = new Student({ username, email, password: hashedPassword, displayName: displayName || username, streak: 1, lastActive: new Date() });
  await student.save();

  // Send Welcome Email
  await notificationService.sendWelcomeEmail(student.email, student.displayName);

  const token = jwt.sign({ id: student._id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, student: { id: student._id, username: student.username, displayName: student.displayName, xp: student.xp, level: student.level, levelTitle: student.levelTitle } });
}));

// Login
router.post('/login', authLimiter, validate({
  email: { required: true, type: 'string' },
  password: { required: true, type: 'string' }
}), asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const student = await Student.findOne({ email });
  if (!student) return res.status(400).json({ error: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

  // Update streak
  const now = new Date();
  const lastActive = new Date(student.lastActive);
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfLast = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
  const dayDiff = Math.round((startOfNow - startOfLast) / 86400000);

  if (dayDiff === 1) {
    student.streak += 1;
  } else if (dayDiff > 1 || student.streak === 0) {
    student.streak = 1;
  }

  student.lastActive = now;
  await student.save();

  const token = jwt.sign({ id: student._id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, student: { id: student._id, username: student.username, displayName: student.displayName, bio: student.bio, xp: student.xp, level: student.level, levelTitle: student.getLevelTitle(), streak: student.streak, badges: student.badges, subjects: student.subjects, learningStyle: student.learningStyle, preferredLanguage: student.preferredLanguage, profilePicture: student.profilePicture, phone: student.phone, isPhoneVerified: student.isPhoneVerified } });
}));

// Google Auth
router.post('/google-auth', authLimiter, asyncHandler(async (req, res) => {
  const { email, displayName, uid } = req.body;
  let student = await Student.findOne({ email });

  if (!student) {
    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
    const hashedPassword = await bcrypt.hash(uid, 10);
    student = new Student({ username, email, password: hashedPassword, displayName: displayName || username, streak: 1, lastActive: new Date() });
    await student.save();
  } else {
    const now = new Date();
    const lastActive = new Date(student.lastActive);
    const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfLast = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
    const dayDiff = Math.round((startOfNow - startOfLast) / 86400000);
    if (dayDiff === 1) student.streak += 1;
    else if (dayDiff > 1 || student.streak === 0) student.streak = 1;
    student.lastActive = now;
    await student.save();
  }

  const token = jwt.sign({ id: student._id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, student: { id: student._id, username: student.username, displayName: student.displayName, bio: student.bio, xp: student.xp, level: student.level, levelTitle: student.getLevelTitle(), streak: student.streak, badges: student.badges, subjects: student.subjects, learningStyle: student.learningStyle, preferredLanguage: student.preferredLanguage, profilePicture: student.profilePicture, phone: student.phone, isPhoneVerified: student.isPhoneVerified } });
}));

// Get Profile
router.get('/profile', auth, asyncHandler(async (req, res) => {
  const student = await Student.findById(req.studentId).select('-password');
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json({ ...student.toObject(), levelTitle: student.getLevelTitle() });
}));

// Update Profile
router.post('/update-profile', auth, asyncHandler(async (req, res) => {
  const { username, profilePicture, displayName, bio } = req.body;
  const student = await Student.findById(req.studentId);

  if (username && username !== student.username) {
    const existing = await Student.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Username already taken' });
    student.username = username;
  }

  if (profilePicture !== undefined) student.profilePicture = profilePicture;
  if (displayName !== undefined) student.displayName = displayName;
  if (bio !== undefined) student.bio = bio;

  await student.save();

  if (student.displayName && student.bio && student.profilePicture && !student.badges.find(b => b.name === 'Profile Pro')) {
    student.badges.push({ name: 'Profile Pro', icon: '👤' });
    await student.save();
  }

  res.json({ ...student.toObject(), levelTitle: student.getLevelTitle() });
}));

// Send OTP
router.post('/send-otp', auth, asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });

  const existing = await Student.findOne({ phone, isPhoneVerified: true, _id: { $ne: req.studentId } });
  if (existing) return res.status(400).json({ error: 'Phone number already registered' });

  const student = await Student.findById(req.studentId);
  student.phone = phone;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  student.otp = otp;
  student.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await student.save();

  console.log(`[OTP] Sending OTP ${otp} to phone ${phone}`);
  res.json({ message: 'OTP sent successfully', _mockOtp: otp });
}));

// Verify OTP
router.post('/verify-otp', auth, asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const student = await Student.findById(req.studentId);

  if (!student.otp || student.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
  if (new Date() > new Date(student.otpExpiry)) return res.status(400).json({ error: 'OTP expired' });

  student.isPhoneVerified = true;
  student.streakNotificationsEnabled = true;
  student.otp = '';
  student.otpExpiry = null;
  await student.save();

  res.json({ message: 'Phone verified & Streak notifications enabled!', isPhoneVerified: true, phone: student.phone });
}));

module.exports = router;
