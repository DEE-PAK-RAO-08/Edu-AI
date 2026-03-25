const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { auth } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');
const { aiLimiter } = require('../middleware/rateLimiter');
const aiService = require('../services/aiService');

// AI Tutor Chat
router.post('/ai-chat', auth, aiLimiter, asyncHandler(async (req, res) => {
  const { message, subject } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const student = await Student.findById(req.studentId).select('-password');
  const subjectData = student.subjects?.find(s => s.name === subject);

  const context = {
    subject: subject || 'General',
    level: student.level,
    studentName: student.displayName || student.username || 'Student',
    learningStyle: student.learningStyle,
    weakAreas: subjectData?.weakAreas || []
  };

  const result = await aiService.chat(req.studentId, message, context, req.body.modelTier || 'auto');
  res.json(result);
}));

// AI Explain Answer
router.post('/ai-explain', auth, aiLimiter, asyncHandler(async (req, res) => {
  const { question, correctAnswer, userAnswer, subject, topic } = req.body;
  if (!question) return res.status(400).json({ error: 'Question is required' });

  const result = await aiService.explainAnswer(question, correctAnswer, userAnswer, subject, topic);
  res.json(result);
}));

// AI Generate Questions
router.post('/ai-generate-questions', auth, aiLimiter, asyncHandler(async (req, res) => {
  const { subject, topic, difficulty, count } = req.body;
  if (!subject || !topic) return res.status(400).json({ error: 'Subject and topic are required' });

  const result = await aiService.generateQuestions(subject, topic, difficulty || 1, count || 5);
  res.json(result);
}));

// AI Study Planner
router.get('/ai-study-plan', auth, aiLimiter, asyncHandler(async (req, res) => {
  const student = await Student.findById(req.studentId).select('-password');
  const result = await aiService.generateStudyPlan(student);
  res.json(result);
}));

// AI Flashcards
router.post('/ai-flashcards', auth, aiLimiter, asyncHandler(async (req, res) => {
  const { subject, topic, notes } = req.body;
  if (!subject || !topic) return res.status(400).json({ error: 'Subject and topic are required' });

  const result = await aiService.generateFlashcards(subject, topic, notes);
  res.json(result);
}));

// AI Summarize
router.post('/ai-summarize', auth, aiLimiter, asyncHandler(async (req, res) => {
  const { text, type } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  const result = await aiService.summarize(text, type);
  res.json(result);
}));

module.exports = router;
