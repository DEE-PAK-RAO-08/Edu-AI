const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const PerformanceLog = require('../models/PerformanceLog');
const GameProgress = require('../models/GameProgress');
const { auth } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

// Save XP
router.post('/save-xp', auth, asyncHandler(async (req, res) => {
  const { xp, source } = req.body;
  const student = await Student.findById(req.studentId);
  student.xp += xp;
  student.level = Math.floor(student.xp / 100) + 1;
  student.levelTitle = student.getLevelTitle();

  if (student.streak >= 7 && !student.badges.find(b => b.name === 'Week Warrior')) student.badges.push({ name: 'Week Warrior', icon: '🔥' });
  if (student.streak >= 30 && !student.badges.find(b => b.name === 'Month Master')) student.badges.push({ name: 'Month Master', icon: '💎' });

  await student.save();
  res.json({ xp: student.xp, level: student.level, levelTitle: student.getLevelTitle(), badges: student.badges });
}));

// Complete Game
router.post('/complete-game', auth, asyncHandler(async (req, res) => {
  const { gameType, subject, score, timeTaken } = req.body;
  const xpEarned = Math.round(score * 0.3) + 30;

  const gameProgress = new GameProgress({
    studentId: req.studentId, gameType, subject, score, xpEarned, timeTaken, completed: true
  });
  await gameProgress.save();

  const student = await Student.findById(req.studentId);
  student.xp += xpEarned;
  student.level = Math.floor(student.xp / 100) + 1;
  student.levelTitle = student.getLevelTitle();
  if (!student.badges.find(b => b.name === 'Game Champion')) student.badges.push({ name: 'Game Champion', icon: '🎮' });
  await student.save();

  const log = new PerformanceLog({
    studentId: req.studentId, subject, testType: 'game',
    totalQuestions: 1, correctAnswers: score >= 50 ? 1 : 0, accuracy: score, xpEarned, difficultyLevel: 1
  });
  await log.save();

  res.json({ xpEarned, totalXP: student.xp, level: student.level, levelTitle: student.getLevelTitle(), badges: student.badges });
}));

// Game History
router.get('/game-history', auth, asyncHandler(async (req, res) => {
  const games = await GameProgress.find({ studentId: req.studentId }).sort({ playedAt: -1 });
  res.json({ games });
}));

module.exports = router;
