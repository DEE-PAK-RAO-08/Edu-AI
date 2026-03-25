const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const PerformanceLog = require('../models/PerformanceLog');
const LearningProgress = require('../models/LearningProgress');
const GameProgress = require('../models/GameProgress');
const { auth } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

// Performance Report
router.get('/performance-report', auth, asyncHandler(async (req, res) => {
  const logs = await PerformanceLog.find({ studentId: req.studentId }).sort({ completedAt: -1 });
  const student = await Student.findById(req.studentId).select('-password');

  const subjectStats = {};
  logs.forEach(log => {
    if (!subjectStats[log.subject]) subjectStats[log.subject] = { tests: 0, avgAccuracy: 0, totalXP: 0, accuracies: [] };
    subjectStats[log.subject].tests++;
    subjectStats[log.subject].accuracies.push(log.accuracy);
    subjectStats[log.subject].totalXP += log.xpEarned;
  });

  Object.keys(subjectStats).forEach(subject => {
    const accs = subjectStats[subject].accuracies;
    subjectStats[subject].avgAccuracy = Math.round(accs.reduce((a, b) => a + b, 0) / accs.length);
  });

  res.json({ logs, subjectStats, student: { ...student.toObject(), levelTitle: student.getLevelTitle() } });
}));

// Leaderboard
router.get('/leaderboard', asyncHandler(async (req, res) => {
  const students = await Student.find()
    .select('username displayName xp level levelTitle badges streak avatar profilePicture')
    .sort({ xp: -1 }).limit(50);

  const leaderboard = students.map((s, index) => ({
    rank: index + 1, username: s.username, displayName: s.displayName,
    profilePicture: s.profilePicture, xp: s.xp, level: s.level,
    levelTitle: s.getLevelTitle(), badges: s.badges.length, streak: s.streak, avatar: s.avatar
  }));

  res.json({ leaderboard });
}));

// Progress Overview
router.get('/progress-overview', auth, asyncHandler(async (req, res) => {
  const student = await Student.findById(req.studentId).select('-password');
  const performanceLogs = await PerformanceLog.find({ studentId: req.studentId }).sort({ completedAt: -1 }).limit(20);
  const learningProgress = await LearningProgress.find({ studentId: req.studentId });
  const gameProgress = await GameProgress.find({ studentId: req.studentId }).sort({ playedAt: -1 }).limit(10);

  res.json({
    student: { ...student.toObject(), levelTitle: student.getLevelTitle() },
    performanceLogs, learningProgress, gameProgress
  });
}));

module.exports = router;
