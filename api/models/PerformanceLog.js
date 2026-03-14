const mongoose = require('mongoose');

const performanceLogSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true },
  testType: { type: String, enum: ['assessment', 'challenge', 'game'], required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  avgResponseTime: { type: Number, default: 0 },
  strongTopics: [String],
  weakTopics: [String],
  difficultyLevel: { type: Number, default: 1 },
  xpEarned: { type: Number, default: 0 },
  details: [{
    question: String,
    topic: String,
    correct: Boolean,
    responseTime: Number,
    difficulty: Number
  }],
  completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PerformanceLog', performanceLogSchema);
