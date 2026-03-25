const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const PerformanceLog = require('../models/PerformanceLog');
const LearningProgress = require('../models/LearningProgress');
const { auth } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');
const courseContent = require('../data/courseContent');
const { getLearningPath } = require('../data/questionBank');

// Get Personalized Learning Path
router.get('/personalized-learning-path', auth, asyncHandler(async (req, res) => {
  const { subject } = req.query;
  const student = await Student.findById(req.studentId);
  const subjectData = student.subjects.find(s => s.name === subject);

  if (!subjectData || !subjectData.assessmentCompleted) {
    return res.status(400).json({ error: 'Complete assessment first' });
  }

  let learningPath = getLearningPath(subject, subjectData.weakAreas);
  
  // IF SUBJECT NOT IN LOCAL BANK, GENERATE VIA AI
  if (learningPath.length === 0) {
    console.log(`✨ Generating AI Learning Path for: ${subject}`);
    const aiResult = await aiService.generateLearningPath(subject, subjectData.weakAreas);
    if (aiResult.success) {
      learningPath = aiResult.learningPath;
    }
  }

  const progress = await LearningProgress.find({ studentId: req.studentId, subject });

  learningPath.forEach(path => {
    if (path.levels) {
      path.levels.forEach(level => {
        const existing = progress.find(p => p.topic === path.topic && p.level === level.level);
        level.completed = existing ? existing.completed : false;
        level.progress = existing ? existing.progress : 0;
      });
    }
  });

  res.json({ learningPath, subjectData });
}));

// Complete Lesson
router.post('/complete-lesson', auth, asyncHandler(async (req, res) => {
  const { subject, topic, level, lessonName } = req.body;

  let progress = await LearningProgress.findOne({ studentId: req.studentId, subject, topic, level });
  if (!progress) {
    progress = new LearningProgress({ studentId: req.studentId, subject, topic, level, unlockedLevels: [1] });
  }

  if (!progress.lessonsCompleted.includes(lessonName)) {
    progress.lessonsCompleted.push(lessonName);
  }

  progress.progress = Math.min(100, (progress.lessonsCompleted.length / 3) * 100);
  if (progress.progress >= 100) {
    progress.completed = true;
    progress.completedAt = new Date();
    if (!progress.unlockedLevels.includes(level + 1)) progress.unlockedLevels.push(level + 1);
  }
  await progress.save();

  const student = await Student.findById(req.studentId);
  student.xp += 20;
  student.level = Math.floor(student.xp / 100) + 1;
  student.levelTitle = student.getLevelTitle();
  await student.save();

  res.json({ progress, xpEarned: 20, totalXP: student.xp, level: student.level });
}));

// Get Course Content
router.get('/courses/:subject/:topic', auth, asyncHandler(async (req, res) => {
  const { subject, topic } = req.params;
  let content = courseContent[subject] ? courseContent[subject][topic] : null;

  if (!content) {
    const formattedTopic = topic.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    content = {
      title: `${formattedTopic} Introduction`,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      notes: `Welcome to ${formattedTopic}! This lesson will cover the core principles and advanced concepts of ${formattedTopic} in the context of ${subject}.`,
      practiceSum: `What is the primary goal of studying ${formattedTopic}?`,
      practiceOptions: ["Understanding core principles", "Memorizing facts", "Passing the exam", "Skipping the lesson"],
      practiceAnswer: "Understanding core principles",
      isPlaceholder: true
    };
  }
  res.json(content);
}));

// Complete Course Practice
router.post('/complete-course-practice', auth, asyncHandler(async (req, res) => {
  const { subject, topic, isCorrect, action } = req.body;
  let xpEarned = 0;

  if (action === 'watch') xpEarned = 10;
  else if (action === 'read') xpEarned = 10;
  else if (action === 'practice' && isCorrect) xpEarned = 20;

  if (xpEarned > 0) {
    const alreadyDone = await PerformanceLog.findOne({
      studentId: req.studentId, subject, testType: 'practice',
      'details.topic': topic, 'details.action': action,
      'details.correct': (action === 'practice' ? true : undefined)
    });

    if (alreadyDone) {
      const student = await Student.findById(req.studentId);
      return res.json({ xpEarned: 0, totalXP: student.xp, level: student.level, message: 'XP already earned' });
    }

    const student = await Student.findById(req.studentId);
    student.xp += xpEarned;
    student.level = Math.floor(student.xp / 100) + 1;
    student.levelTitle = student.getLevelTitle();
    await student.save();

    const log = new PerformanceLog({
      studentId: req.studentId, subject, testType: 'practice',
      totalQuestions: action === 'practice' ? 1 : 0,
      correctAnswers: (action === 'practice' && isCorrect) ? 1 : 0,
      accuracy: (action === 'practice' && isCorrect) ? 100 : 0,
      difficultyLevel: 1, xpEarned,
      details: [{ topic, action, correct: isCorrect }]
    });
    await log.save();

    return res.json({ xpEarned, totalXP: student.xp, level: student.level, levelTitle: student.levelTitle });
  }
  res.json({ xpEarned: 0 });
}));

// Detect Learning Style
router.post('/detect-learning-style', auth, asyncHandler(async (req, res) => {
  const { answers } = req.body;
  const counts = { visual: 0, reading: 0, practice: 0 };
  answers.forEach(ans => { if (counts[ans] !== undefined) counts[ans]++; });

  const total = answers.length;
  const scores = {
    visual: Math.round((counts.visual / total) * 100),
    reading: Math.round((counts.reading / total) * 100),
    practice: Math.round((counts.practice / total) * 100)
  };

  const style = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const student = await Student.findById(req.studentId);
  student.learningStyle = style;
  await student.save();

  res.json({ learningStyle: style, scores });
}));

// Set Language
router.post('/set-language', auth, asyncHandler(async (req, res) => {
  const { language } = req.body;
  const student = await Student.findById(req.studentId);
  student.preferredLanguage = language;
  await student.save();
  res.json({ language: student.preferredLanguage });
}));

module.exports = router;
