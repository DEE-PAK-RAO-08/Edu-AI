require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Student = require('./models/Student');
const PerformanceLog = require('./models/PerformanceLog');
const LearningProgress = require('./models/LearningProgress');
const GameProgress = require('./models/GameProgress');
const { questionBank, getTestQuestions, getAdaptiveQuestions, getLearningPath } = require('./data/questionBank');
const courseContent = require('./data/courseContent');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edu_ai')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const JWT_SECRET = process.env.JWT_SECRET || 'edu_ai_secret_key_2026';

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.studentId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.get('/api/test-connection', (req, res) => res.json({ status: 'ok', message: 'Backend is reachable' }));

// ============================================
// AUTH ROUTES
// ============================================

app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;
    const existing = await Student.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ error: 'Username or email already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({ username, email, password: hashedPassword, displayName: displayName || username, streak: 1, lastActive: new Date() });
    await student.save();
    
    const token = jwt.sign({ id: student._id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, student: { id: student._id, username: student.username, displayName: student.displayName, xp: student.xp, level: student.level, levelTitle: student.levelTitle } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    
    // Update streak (Calendar Day Logic)
    const now = new Date();
    const lastActive = new Date(student.lastActive);
    const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfLast = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
    const dayDiff = Math.round((startOfNow - startOfLast) / (86400000));

    if (dayDiff === 1) {
      student.streak += 1;
      console.log(`🔥 Streak increased for ${student.username}: ${student.streak}`);
    } else if (dayDiff > 1 || student.streak === 0) {
      student.streak = 1;
      console.log(`♻️ Streak reset for ${student.username}: 1`);
    }
    
    student.lastActive = now;
    await student.save();
    
    const token = jwt.sign({ id: student._id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, student: { id: student._id, username: student.username, displayName: student.displayName, bio: student.bio, xp: student.xp, level: student.level, levelTitle: student.getLevelTitle(), streak: student.streak, badges: student.badges, subjects: student.subjects, learningStyle: student.learningStyle, preferredLanguage: student.preferredLanguage, profilePicture: student.profilePicture, phone: student.phone, isPhoneVerified: student.isPhoneVerified } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/google-auth', async (req, res) => {
  try {
    const { email, displayName, uid } = req.body;
    let student = await Student.findOne({ email });
    
    if (!student) {
      // Create new user if they don't exist
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      const hashedPassword = await bcrypt.hash(uid, 10); // use uid as dummy password
      
      student = new Student({
        username,
        email,
        password: hashedPassword,
        displayName: displayName || username,
        streak: 1,
        lastActive: new Date()
      });
      await student.save();
    } else {
      // Update streak for existing user (Calendar Day Logic)
      const now = new Date();
      const lastActive = new Date(student.lastActive);
      const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfLast = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
      const dayDiff = Math.round((startOfNow - startOfLast) / (86400000));

      if (dayDiff === 1) {
        student.streak += 1;
        console.log(`🔥 Streak increased (Google) for ${student.username}: ${student.streak}`);
      } else if (dayDiff > 1 || student.streak === 0) {
        student.streak = 1;
        console.log(`♻️ Streak reset (Google) for ${student.username}: 1`);
      }
      
      student.lastActive = now;
      await student.save();
    }

    const token = jwt.sign({ id: student._id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, student: { id: student._id, username: student.username, displayName: student.displayName, bio: student.bio, xp: student.xp, level: student.level, levelTitle: student.getLevelTitle(), streak: student.streak, badges: student.badges, subjects: student.subjects, learningStyle: student.learningStyle, preferredLanguage: student.preferredLanguage, profilePicture: student.profilePicture, phone: student.phone, isPhoneVerified: student.isPhoneVerified } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/profile', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.studentId).select('-password');
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ ...student.toObject(), levelTitle: student.getLevelTitle() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/update-profile', auth, async (req, res) => {
  try {
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
    
    // Award Profile Pro badge
    if (student.displayName && student.bio && student.profilePicture && !student.badges.find(b => b.name === 'Profile Pro')) {
      student.badges.push({ name: 'Profile Pro', icon: '👤' });
      await student.save();
    }
    
    res.json({ ...student.toObject(), levelTitle: student.getLevelTitle() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/send-otp', auth, async (req, res) => {
  try {
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
    
    console.log(`[Twilio Mock] Sending OTP ${otp} to phone ${phone}`);
    
    res.json({ message: 'OTP sent successfully', _mockOtp: otp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/verify-otp', auth, async (req, res) => {
  try {
    const { otp } = req.body;
    const student = await Student.findById(req.studentId);
    
    if (!student.otp || student.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    if (new Date() > new Date(student.otpExpiry)) {
      return res.status(400).json({ error: 'OTP expired' });
    }
    
    student.isPhoneVerified = true;
    student.streakNotificationsEnabled = true;
    student.otp = '';
    student.otpExpiry = null;
    await student.save();
    
    res.json({ message: 'Phone verified & Streak notifications enabled!', isPhoneVerified: true, phone: student.phone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// ASSESSMENT & TEST ROUTES
// ============================================

app.post('/api/start-test', auth, async (req, res) => {
  try {
    const { subject, level } = req.body;
    let limit = 12;
    let timeLimit = 600; // 10 minutes default
    
    if (level === 'easy') {
      limit = 15;
      timeLimit = 15 * 60; // 15 mins
    } else if (level === 'medium') {
      limit = 30;
      timeLimit = 40 * 60; // 40 mins
    } else if (level === 'hard') {
      limit = 50;
      timeLimit = 60 * 60; // 60 mins
    }

    const questions = getTestQuestions(subject, limit);
    if (questions.length === 0) return res.status(400).json({ error: 'Invalid subject' });
    
    // Remove answers before sending
    const sanitized = questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      topic: q.topic,
      difficulty: q.difficulty
    }));
    
    res.json({ questions: sanitized, timeLimit, subject, level });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/submit-test', auth, async (req, res) => {
  try {
    const { subject, answers, timePerQuestion } = req.body;
    console.log(`[DEBUG] Submitting Test: Subject=${subject}, AnswersRecv=${answers?.length}`);
    
    // getTestQuestions fallback logic for subject pool
    const subjectPool = questionBank[subject] || questionBank['mathematics'];
    const allQuestionsPool = [];
    if (subjectPool) {
      Object.values(subjectPool).forEach(topicQs => {
        allQuestionsPool.push(...topicQs);
      });
    }
    console.log(`[DEBUG] Pool Size for subject ${subject}: ${allQuestionsPool.length}`);
    
    let correct = 0;
    let totalCount = (answers || []).length;
    const topicScores = {};
    const details = [];
    
      (answers || []).forEach(ans => {
        // Strip the session-specific suffix (_resultLength_index) to get the original question ID
        const originalId = ans.questionId.replace(/_\d+_\d+$/, '');
        const question = allQuestionsPool.find(q => q.id === originalId);
        
        if (!question) {
          console.warn(`[DEBUG] Question NOT found in pool! RecvID=${ans.questionId}, DerivedID=${originalId}`);
          return;
        }
        
        const normalize = (str) => String(str || '').replace(/\s+/g, ' ').trim().toLowerCase();
        const userAns = normalize(ans.answer);
        const correctAns = normalize(question.answer);
        const isCorrect = userAns === correctAns;
        
        console.log(`[DEBUG] Verify -> QID: ${originalId} | User: "${userAns}" | Correct: "${correctAns}" | Match: ${isCorrect}`);
        if (isCorrect) correct++;
      
      if (!topicScores[question.topic]) {
        topicScores[question.topic] = { correct: 0, total: 0 };
      }
      topicScores[question.topic].total++;
      if (isCorrect) topicScores[question.topic].correct++;
      
      details.push({
        question: question.question,
        topic: question.topic,
        correct: isCorrect,
        responseTime: ans.responseTime || 0,
        difficulty: question.difficulty
      });
    });
    
    const accuracy = totalCount > 0 ? Math.round((correct / totalCount) * 100) : 0;
    const avgResponseTime = timePerQuestion && timePerQuestion.length > 0 ? timePerQuestion.reduce((a, b) => a + b, 0) / timePerQuestion.length : 0;
    
    // Determine strong/weak topics
    const strongTopics = [];
    const weakTopics = [];
    Object.entries(topicScores).forEach(([topic, scores]) => {
      const topicAccuracy = scores.total > 0 ? (scores.correct / scores.total) * 100 : 0;
      if (topicAccuracy >= 70) strongTopics.push(topic);
      else weakTopics.push(topic);
    });
    
    // Calculate XP
    const xpEarned = Math.round(accuracy * 0.5) + 20;
    
    // Save performance log
    const log = new PerformanceLog({
      studentId: req.studentId,
      subject,
      testType: 'assessment',
      totalQuestions: totalCount,
      correctAnswers: correct,
      accuracy,
      avgResponseTime: Math.round(avgResponseTime),
      strongTopics,
      weakTopics,
      difficultyLevel: 1,
      xpEarned,
      details
    });
    await log.save();
    
    // Update student
    const student = await Student.findById(req.studentId);
    student.xp += xpEarned;
    student.level = Math.floor(student.xp / 100) + 1;
    student.levelTitle = student.getLevelTitle();
    
    // Update subject info
    const subjectIndex = student.subjects.findIndex(s => s.name === subject);
    const subjectData = { name: subject, assessmentCompleted: true, accuracy, strongAreas: strongTopics, weakAreas: weakTopics, currentLevel: 1 };
    if (subjectIndex >= 0) {
      student.subjects[subjectIndex] = subjectData;
    } else {
      student.subjects.push(subjectData);
    }
    
    // Award badges
    if (accuracy >= 90 && !student.badges.find(b => b.name === 'Perfect Score')) {
      student.badges.push({ name: 'Perfect Score', icon: '🏆' });
    }
    if (accuracy === 100 && !student.badges.find(b => b.name === 'Grand Master')) {
      student.badges.push({ name: 'Grand Master', icon: '👑' });
    }
    if (!student.badges.find(b => b.name === 'First Test')) {
      student.badges.push({ name: 'First Test', icon: '📝' });
    }
    if (avgResponseTime < 6000 && totalCount >= 5 && !student.badges.find(b => b.name === 'Quick Thinker')) {
      student.badges.push({ name: 'Quick Thinker', icon: '⚡' });
    }
    
    // Check for Subject Specialist (tested in 3+ subjects)
    if (student.subjects.length >= 3 && !student.badges.find(b => b.name === 'Subject Specialist')) {
      student.badges.push({ name: 'Subject Specialist', icon: '📚' });
    }
    
    await student.save();
    
    // Generate learning path
    const learningPath = getLearningPath(subject, weakTopics);
    
    res.json({
      accuracy,
      correct,
      total: totalCount,
      strongTopics,
      weakTopics,
      xpEarned,
      topicScores,
      avgResponseTime: Math.round(avgResponseTime),
      learningPath,
      level: student.level,
      levelTitle: student.getLevelTitle(),
      totalXP: student.xp
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// PERFORMANCE & ANALYTICS
// ============================================

app.get('/api/performance-report', auth, async (req, res) => {
  try {
    const logs = await PerformanceLog.find({ studentId: req.studentId }).sort({ completedAt: -1 });
    const student = await Student.findById(req.studentId).select('-password');
    
    const subjectStats = {};
    logs.forEach(log => {
      if (!subjectStats[log.subject]) {
        subjectStats[log.subject] = { tests: 0, avgAccuracy: 0, totalXP: 0, accuracies: [] };
      }
      subjectStats[log.subject].tests++;
      subjectStats[log.subject].accuracies.push(log.accuracy);
      subjectStats[log.subject].totalXP += log.xpEarned;
    });
    
    Object.keys(subjectStats).forEach(subject => {
      const accs = subjectStats[subject].accuracies;
      subjectStats[subject].avgAccuracy = Math.round(accs.reduce((a, b) => a + b, 0) / accs.length);
    });
    
    res.json({ logs, subjectStats, student: { ...student.toObject(), levelTitle: student.getLevelTitle() } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// LEARNING PATH
// ============================================

app.get('/api/personalized-learning-path', auth, async (req, res) => {
  try {
    const { subject } = req.query;
    const student = await Student.findById(req.studentId);
    const subjectData = student.subjects.find(s => s.name === subject);
    
    if (!subjectData || !subjectData.assessmentCompleted) {
      return res.status(400).json({ error: 'Complete assessment first' });
    }
    
    const learningPath = getLearningPath(subject, subjectData.weakAreas);
    const progress = await LearningProgress.find({ studentId: req.studentId, subject });
    
    // Merge progress into learning path
    learningPath.forEach(path => {
      path.levels.forEach(level => {
        const existing = progress.find(p => p.topic === path.topic && p.level === level.level);
        level.completed = existing ? existing.completed : false;
        level.progress = existing ? existing.progress : 0;
      });
    });
    
    res.json({ learningPath, subjectData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/complete-lesson', auth, async (req, res) => {
  try {
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
      if (!progress.unlockedLevels.includes(level + 1)) {
        progress.unlockedLevels.push(level + 1);
      }
    }
    
    await progress.save();
    
    // Award XP
    const student = await Student.findById(req.studentId);
    student.xp += 20;
    student.level = Math.floor(student.xp / 100) + 1;
    student.levelTitle = student.getLevelTitle();
    await student.save();
    
    res.json({ progress, xpEarned: 20, totalXP: student.xp, level: student.level });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// ADAPTIVE CHALLENGE ENGINE
// ============================================

app.post('/api/adaptive-challenge', auth, async (req, res) => {
  try {
    const { subject, topic } = req.body;
    
    // Get recent performance to determine difficulty
    const recentLogs = await PerformanceLog.find({ 
      studentId: req.studentId, 
      subject 
    }).sort({ completedAt: -1 }).limit(3);
    
    let difficulty = 1;
    if (recentLogs.length > 0) {
      const avgAccuracy = recentLogs.reduce((sum, log) => sum + log.accuracy, 0) / recentLogs.length;
      if (avgAccuracy > 80) difficulty = 3;
      else if (avgAccuracy >= 50) difficulty = 2;
      else difficulty = 1;
    }
    
    const questions = getAdaptiveQuestions(subject, topic, difficulty, 5);
    const sanitized = questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      topic: q.topic,
      difficulty: q.difficulty
    }));
    
    const hints = difficulty === 1;
    
    res.json({ questions: sanitized, difficulty, showHints: hints, timeLimit: 300 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/submit-challenge', auth, async (req, res) => {
  try {
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
      studentId: req.studentId,
      subject,
      testType: 'challenge',
      totalQuestions: answers.length,
      correctAnswers: correct,
      accuracy,
      difficultyLevel: difficulty,
      xpEarned,
      details
    });
    await log.save();
    
    const student = await Student.findById(req.studentId);
    student.xp += xpEarned;
    student.level = Math.floor(student.xp / 100) + 1;
    student.levelTitle = student.getLevelTitle();
    
    if (accuracy === 100 && !student.badges.find(b => b.name === 'Challenge Master')) {
      student.badges.push({ name: 'Challenge Master', icon: '⚡' });
    }
    
    await student.save();
    
    res.json({ accuracy, correct, total: answers.length, xpEarned, totalXP: student.xp, level: student.level, levelTitle: student.getLevelTitle() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// GAMIFICATION ROUTES
// ============================================

app.post('/api/save-xp', auth, async (req, res) => {
  try {
    const { xp, source } = req.body;
    const student = await Student.findById(req.studentId);
    student.xp += xp;
    student.level = Math.floor(student.xp / 100) + 1;
    student.levelTitle = student.getLevelTitle();
    
    // Award streak badge
    if (student.streak >= 7 && !student.badges.find(b => b.name === 'Week Warrior')) {
      student.badges.push({ name: 'Week Warrior', icon: '🔥' });
    }
    if (student.streak >= 30 && !student.badges.find(b => b.name === 'Month Master')) {
      student.badges.push({ name: 'Month Master', icon: '💎' });
    }
    
    await student.save();
    res.json({ xp: student.xp, level: student.level, levelTitle: student.getLevelTitle(), badges: student.badges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/complete-game', auth, async (req, res) => {
  try {
    const { gameType, subject, score, timeTaken } = req.body;
    const xpEarned = Math.round(score * 0.3) + 30;
    
    const gameProgress = new GameProgress({
      studentId: req.studentId,
      gameType,
      subject,
      score,
      xpEarned,
      timeTaken,
      completed: true
    });
    await gameProgress.save();
    
    const student = await Student.findById(req.studentId);
    student.xp += xpEarned;
    student.level = Math.floor(student.xp / 100) + 1;
    student.levelTitle = student.getLevelTitle();
    
    if (!student.badges.find(b => b.name === 'Game Champion')) {
      student.badges.push({ name: 'Game Champion', icon: '🎮' });
    }
    
    await student.save();
    
    // Log performance
    const log = new PerformanceLog({
      studentId: req.studentId,
      subject,
      testType: 'game',
      totalQuestions: 1,
      correctAnswers: score >= 50 ? 1 : 0,
      accuracy: score,
      xpEarned,
      difficultyLevel: 1
    });
    await log.save();
    
    res.json({ xpEarned, totalXP: student.xp, level: student.level, levelTitle: student.getLevelTitle(), badges: student.badges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// LEADERBOARD
// ============================================

app.get('/api/leaderboard', async (req, res) => {
  try {
    const students = await Student.find()
      .select('username displayName xp level levelTitle badges streak avatar profilePicture')
      .sort({ xp: -1 })
      .limit(50);
    
    const leaderboard = students.map((s, index) => ({
      rank: index + 1,
      username: s.username,
      displayName: s.displayName,
      profilePicture: s.profilePicture,
      xp: s.xp,
      level: s.level,
      levelTitle: s.getLevelTitle(),
      badges: s.badges.length,
      streak: s.streak,
      avatar: s.avatar
    }));
    
    res.json({ leaderboard });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// COURSES & PRACTICE
// ============================================

app.get('/api/courses/:subject/:topic', auth, async (req, res) => {
  try {
    const { subject, topic } = req.params;
    let content = courseContent[subject] ? courseContent[subject][topic] : null;

    // Provide a smart placeholder if content doesn't exist yet
    if (!content) {
      const formattedTopic = topic.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      content = {
        title: `${formattedTopic} Introduction`,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder video
        notes: `Welcome to ${formattedTopic}! This lesson will cover the core principles and advanced concepts of ${formattedTopic} in the context of ${subject}. We are currently finalizing the full curriculum for this specific topic.`,
        practiceSum: `What is the primary goal of studying ${formattedTopic}?`,
        practiceOptions: [
          "Understanding core principles",
          "Memorizing facts",
          "Passing the exam",
          "Skipping the lesson"
        ],
        practiceAnswer: "Understanding core principles",
        isPlaceholder: true
      };
    }
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/complete-course-practice', auth, async (req, res) => {
  try {
    const { subject, topic, isCorrect, action } = req.body;
    let xpEarned = 0;
    
    if (action === 'watch') xpEarned = 10;
    else if (action === 'read') xpEarned = 10;
    else if (action === 'practice' && isCorrect) xpEarned = 20;

    if (xpEarned > 0) {
      // Check if already earned XP for this specific topic/action
      const alreadyDone = await PerformanceLog.findOne({
        studentId: req.studentId,
        subject,
        testType: 'practice',
        'details.topic': topic,
        'details.action': action,
        'details.correct': (action === 'practice' ? true : undefined)
      });

      if (alreadyDone) {
        const student = await Student.findById(req.studentId);
        return res.json({ xpEarned: 0, totalXP: student.xp, level: student.level, message: 'XP already earned for this activity' });
      }

      const student = await Student.findById(req.studentId);
      student.xp += xpEarned;
      student.level = Math.floor(student.xp / 100) + 1;
      student.levelTitle = student.getLevelTitle();
      await student.save();
      
      const log = new PerformanceLog({
        studentId: req.studentId,
        subject,
        testType: 'practice',
        totalQuestions: action === 'practice' ? 1 : 0,
        correctAnswers: (action === 'practice' && isCorrect) ? 1 : 0,
        accuracy: (action === 'practice' && isCorrect) ? 100 : 0,
        difficultyLevel: 1,
        xpEarned,
        details: [{ topic, action, correct: isCorrect }]
      });
      await log.save();
      
      return res.json({ xpEarned, totalXP: student.xp, level: student.level, levelTitle: student.levelTitle });
    }
    
    res.json({ xpEarned: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// LEARNING STYLE DETECTION
// ============================================

app.post('/api/detect-learning-style', auth, async (req, res) => {
  try {
    const { answers } = req.body;
    const counts = { visual: 0, reading: 0, practice: 0 };
    
    answers.forEach(ans => {
      if (counts[ans] !== undefined) counts[ans]++;
    });

    const total = answers.length;
    const scores = {
      visual: Math.round((counts.visual / total) * 100),
      reading: Math.round((counts.reading / total) * 100),
      practice: Math.round((counts.practice / total) * 100)
    };
    
    // Sort to find the dominant style
    const style = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    
    const student = await Student.findById(req.studentId);
    student.learningStyle = style;
    await student.save();
    
    res.json({ learningStyle: style, scores });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// LANGUAGE SUPPORT
// ============================================

app.post('/api/set-language', auth, async (req, res) => {
  try {
    const { language } = req.body;
    const student = await Student.findById(req.studentId);
    student.preferredLanguage = language;
    await student.save();
    res.json({ language: student.preferredLanguage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// GAME HISTORY
// ============================================

app.get('/api/game-history', auth, async (req, res) => {
  try {
    const games = await GameProgress.find({ studentId: req.studentId }).sort({ playedAt: -1 });
    res.json({ games });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// PROGRESS OVERVIEW
// ============================================

app.get('/api/progress-overview', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.studentId).select('-password');
    const performanceLogs = await PerformanceLog.find({ studentId: req.studentId }).sort({ completedAt: -1 }).limit(20);
    const learningProgress = await LearningProgress.find({ studentId: req.studentId });
    const gameProgress = await GameProgress.find({ studentId: req.studentId }).sort({ playedAt: -1 }).limit(10);
    
    res.json({
      student: { ...student.toObject(), levelTitle: student.getLevelTitle() },
      performanceLogs,
      learningProgress,
      gameProgress
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// STREAK NOTIFICATIONS & BACKGROUND JOBS
// ============================================

// Mock SMS Sender
const sendSMS = (phone, message) => {
  console.log(`\n📱 [SMS SENT] To: ${phone}\n💬 Message: "${message}"\n`);
};

// Background task to check for expiring streaks (runs every 10 mins)
const checkStreaks = async () => {
    try {
        console.log('🔍 Checking for expiring streaks...');
        const now = new Date();
        const warningThreshold = 20 * 60 * 60 * 1000; // 20 hours
        const breakThreshold = 24 * 60 * 60 * 1000; // 24 hours

        // Find students who were active between 20 and 24 hours ago
        const studentsToWarn = await Student.find({
            isPhoneVerified: true,
            streakNotificationsEnabled: true,
            streak: { $gt: 0 },
            lastActive: {
                $lte: new Date(now - warningThreshold),
                $gt: new Date(now - breakThreshold)
            }
        });

        for (const student of studentsToWarn) {
            const timeRemaining = Math.round((breakThreshold - (now - student.lastActive)) / (60 * 60 * 1000));
            sendSMS(student.phone, `🚨 Hey ${student.displayName || student.username}, your ${student.streak}-day streak is about to break! You have ${timeRemaining} hours left to maintain your progress. Hop back into EDU AI now! 🔥`);
        }
    } catch (err) {
        console.error('Streak check error:', err);
    }
};

// setInterval(checkStreaks, 10 * 60 * 1000); // Disabled for Vercel Serverless

// Manual test route
app.post('/api/test-streak-notification', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.studentId);
        if (!student.isPhoneVerified) return res.status(400).json({ error: 'Phone not verified' });
        
        sendSMS(student.phone, `🔥 TEST: Hey ${student.displayName}, this is how we'll notify you when your streak is at risk! Keep up the great work!`);
        res.json({ message: 'Test notification sent to your phone' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;
