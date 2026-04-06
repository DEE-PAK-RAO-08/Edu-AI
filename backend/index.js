require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const learningRoutes = require('./routes/learningRoutes');
const gameRoutes = require('./routes/gameRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const codeRoutes = require('./routes/codeRoutes');
const notificationService = require('./services/notificationService');

const Student = require('./models/Student');

const app = express();

// ============================================
// GLOBAL MIDDLEWARE
// ============================================
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: [FRONTEND_URL, 'http://127.0.0.1:5173', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Cross-Origin-Opener-Policy (COOP) header for Firebase Auth popups
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp'); // Optional but recommended
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/api', apiLimiter);

// ============================================
// DATABASE CONNECTION
// ============================================
// Check for Railway's MONGO_URL first, then fallbacks
const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edu_ai';
mongoose.connect(mongoUri)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/test-connection', (req, res) => res.json({ status: 'ok', message: 'Backend is reachable', version: '2.0.0' }));

// ============================================
// API ROUTES
// ============================================
app.use('/api', authRoutes);
app.use('/api', testRoutes);
app.use('/api', learningRoutes);
app.use('/api', gameRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', aiRoutes);
app.use('/api', discussionRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/notifications', notificationRoutes);

// ============================================
// STREAK NOTIFICATION BACKGROUND JOB
// ============================================
const checkStreaks = async () => {
  try {
    const now = new Date();
    const warningThreshold = 20 * 60 * 60 * 1000;
    const breakThreshold = 24 * 60 * 60 * 1000;

    const studentsToWarn = await Student.find({
      streakNotificationsEnabled: true,
      streak: { $gt: 0 },
      lastActive: {
        $lte: new Date(now - warningThreshold),
        $gt: new Date(now - breakThreshold)
      }
    });

    for (const student of studentsToWarn) {
      if (!student.lastActive || !student.email) continue;
      
      const timeRemaining = Math.round((breakThreshold - (now - student.lastActive)) / (60 * 60 * 1000));
      if (timeRemaining <= 0) continue;

      await notificationService.sendStreakWarning(
        student.email, 
        student.displayName || student.username || 'Student', 
        student.fcmTokens || [], 
        student.streak || 0, 
        timeRemaining
      );
    }
  } catch (err) {
    console.error('Streak check error:', err);
  }
};

setInterval(checkStreaks, 10 * 60 * 1000);

// ============================================
// GLOBAL ERROR HANDLER (must be last)
// ============================================
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 EDU AI Server v2.0 running on port ${PORT}`);
  console.log(`📡 API routes: auth, tests, learning, games, analytics, AI, discussions`);
  console.log(`🤖 AI Service: ${process.env.GEMINI_API_KEY ? 'Configured ✅' : 'No API key ⚠️'}`);
});
