const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const PerformanceLog = require('../models/PerformanceLog');
const { auth } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');
const { questionBank, getTestQuestions, getAdaptiveQuestions } = require('../data/questionBank');
const aiService = require('../services/aiService');

// Start Test
router.post('/start-test', auth, asyncHandler(async (req, res) => {
  const { subject, level } = req.body;
  let limit = 12;
  let timeLimit = 600;

  if (level === 'easy') { limit = 8; timeLimit = 15 * 60; }
  else if (level === 'medium') { limit = 10; timeLimit = 20 * 60; }
  else if (level === 'hard') { limit = 12; timeLimit = 30 * 60; }

  let questions = getTestQuestions(subject, limit);
  
  // IF SUBJECT IS NOT IN LOCAL BANK, GENERATE VIA AI
  if (questions.length === 0 || !subject) {
    console.log(`✨ Generating AI questions for new subject: ${subject}`);
    // Use subject as topic if it's not in the bank
    const aiTopic = subject || 'General Knowledge';
    const aiResult = await aiService.generateQuestions(aiTopic, 'Core Concepts', level === 'easy' ? 1 : level === 'hard' ? 3 : 2, limit);
    if (aiResult.success) {
      questions = aiResult.questions;
    } else {
      console.error(`❌ AI Generation failed for subject: ${subject}`);
      return res.status(500).json({ error: 'Unable to generate content for this topic right now.' });
    }
  }

  const sanitized = questions.map(q => ({
    id: q.id, question: q.question, options: q.options, topic: q.topic, difficulty: q.difficulty
  }));

  res.json({ questions: sanitized, timeLimit, subject, level });
}));

// Submit Test
router.post('/submit-test', auth, asyncHandler(async (req, res) => {
  const { subject, answers, timePerQuestion, questions: providedQuestions } = req.body;
  
  let allQuestionsPool = [];
  const subjectPool = questionBank[subject];
  
  if (subjectPool) {
    Object.values(subjectPool).forEach(topicQs => allQuestionsPool.push(...topicQs));
  } else if (providedQuestions && providedQuestions.length > 0) {
    // USE QUESTIONS PROVIDED BY CLIENT FOR AI GENERATED TOPICS
    allQuestionsPool = providedQuestions;
  }

  let correct = 0;
  let totalCount = (answers || []).length;
  const topicScores = {};
  const details = [];

  (answers || []).forEach(ans => {
    const originalId = ans.questionId.replace(/_\d+_\d+$/, '');
    const question = allQuestionsPool.find(q => q.id === originalId || q.id === ans.questionId);
    if (!question) return;

    const normalize = (str) => String(str || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const userAns = normalize(ans.answer);
    const correctAns = normalize(question.answer);
    const isCorrect = userAns === correctAns;
    if (isCorrect) correct++;

    const topicName = question.topic || 'General';
    if (!topicScores[topicName]) topicScores[topicName] = { correct: 0, total: 0 };
    topicScores[topicName].total++;
    if (isCorrect) topicScores[topicName].correct++;

    details.push({
      question: question.question, topic: question.topic || 'General', correct: isCorrect,
      responseTime: ans.responseTime || 0, difficulty: question.difficulty
    });
  });

  const accuracy = totalCount > 0 ? Math.round((correct / totalCount) * 100) : 0;
  const avgResponseTime = timePerQuestion && timePerQuestion.length > 0 ? timePerQuestion.reduce((a, b) => a + b, 0) / timePerQuestion.length : 0;

  const strongTopics = [];
  const weakTopics = [];
  Object.entries(topicScores).forEach(([topic, scores]) => {
    const topicAccuracy = scores.total > 0 ? (scores.correct / scores.total) * 100 : 0;
    if (topicAccuracy >= 70) strongTopics.push(topic);
    else weakTopics.push(topic);
  });

  const xpEarned = Math.round(accuracy * 0.5) + 20;

  const log = new PerformanceLog({
    studentId: req.studentId, subject, testType: 'assessment',
    totalQuestions: totalCount, correctAnswers: correct, accuracy,
    avgResponseTime: Math.round(avgResponseTime), strongTopics, weakTopics,
    difficultyLevel: 1, xpEarned, details
  });
  await log.save();

  const student = await Student.findById(req.studentId);
  student.xp += xpEarned;
  student.level = Math.floor(student.xp / 100) + 1;
  student.levelTitle = student.getLevelTitle();

  const subjectIndex = student.subjects.findIndex(s => s.name === subject);
  const subjectData = { name: subject, assessmentCompleted: true, accuracy, strongAreas: strongTopics, weakAreas: weakTopics, currentLevel: 1 };
  if (subjectIndex >= 0) student.subjects[subjectIndex] = subjectData;
  else student.subjects.push(subjectData);

  // Award badges
  if (accuracy >= 90 && !student.badges.find(b => b.name === 'Perfect Score')) student.badges.push({ name: 'Perfect Score', icon: '🏆' });
  if (accuracy === 100 && !student.badges.find(b => b.name === 'Grand Master')) student.badges.push({ name: 'Grand Master', icon: '👑' });
  if (!student.badges.find(b => b.name === 'First Test')) student.badges.push({ name: 'First Test', icon: '📝' });
  if (avgResponseTime < 6000 && totalCount >= 5 && !student.badges.find(b => b.name === 'Quick Thinker')) student.badges.push({ name: 'Quick Thinker', icon: '⚡' });
  if (student.subjects.length >= 3 && !student.badges.find(b => b.name === 'Subject Specialist')) student.badges.push({ name: 'Subject Specialist', icon: '📚' });

  await student.save();

  const { getLearningPath } = require('../data/questionBank');
  const learningPath = getLearningPath(subject, weakTopics);

  // AI PERFORMANCE ANALYSIS (Async)
  let aiAnalysis = null;
  try {
    const analysisResult = await aiService.analyzePerformance(subject, details, accuracy);
    if (analysisResult.success) {
      aiAnalysis = analysisResult.report;
      // Update log with analysis
      log.aiFeedback = aiAnalysis;
      await log.save();
    }
  } catch (err) {
    console.error('AI Analysis failed:', err);
  }

  res.json({
    accuracy, correct, total: totalCount, strongTopics, weakTopics,
    xpEarned, topicScores, avgResponseTime: Math.round(avgResponseTime),
    learningPath, level: student.level, levelTitle: student.getLevelTitle(), totalXP: student.xp,
    aiAnalysis
  });
}));

// Adaptive Challenge
router.post('/adaptive-challenge', auth, asyncHandler(async (req, res) => {
  const { subject, topic } = req.body;
  const recentLogs = await PerformanceLog.find({ studentId: req.studentId, subject }).sort({ completedAt: -1 }).limit(3);

  let difficulty = 1;
  if (recentLogs.length > 0) {
    const avgAccuracy = recentLogs.reduce((sum, log) => sum + log.accuracy, 0) / recentLogs.length;
    if (avgAccuracy > 80) difficulty = 3;
    else if (avgAccuracy >= 50) difficulty = 2;
  }

  const questions = getAdaptiveQuestions(subject, topic, difficulty, 5);
  const sanitized = questions.map(q => ({ id: q.id, question: q.question, options: q.options, topic: q.topic, difficulty: q.difficulty }));

  res.json({ questions: sanitized, difficulty, showHints: difficulty === 1, timeLimit: 300 });
}));

// Submit Challenge
router.post('/submit-challenge', auth, asyncHandler(async (req, res) => {
  const { subject, answers, difficulty } = req.body;
  const allQuestions = getTestQuestions(subject, 100);

  let correct = 0;
  const details = [];

  answers.forEach(ans => {
    const question = allQuestions.find(q => q.id === ans.questionId);
    if (!question) return;
    const isCorrect = question.answer === ans.answer;
    if (isCorrect) correct++;
    details.push({ question: question.question, topic: question.topic, correct: isCorrect, responseTime: ans.responseTime || 0, difficulty: question.difficulty });
  });

  const accuracy = answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0;
  const xpEarned = Math.round(accuracy * 0.5) + (difficulty * 10);

  const log = new PerformanceLog({
    studentId: req.studentId, subject, testType: 'challenge',
    totalQuestions: answers.length, correctAnswers: correct, accuracy,
    difficultyLevel: difficulty, xpEarned, details
  });
  await log.save();

  const student = await Student.findById(req.studentId);
  student.xp += xpEarned;
  student.level = Math.floor(student.xp / 100) + 1;
  student.levelTitle = student.getLevelTitle();
  if (accuracy === 100 && !student.badges.find(b => b.name === 'Challenge Master')) student.badges.push({ name: 'Challenge Master', icon: '⚡' });
  await student.save();

  res.json({ accuracy, correct, total: answers.length, xpEarned, totalXP: student.xp, level: student.level, levelTitle: student.getLevelTitle() });
}));

module.exports = router;
