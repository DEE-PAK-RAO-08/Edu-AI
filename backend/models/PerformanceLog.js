const mongoose = require('mongoose');

const performanceLogSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true },
  testType: { type: String, enum: ['assessment', 'challenge', 'game', 'practice'], required: true },
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
    difficulty: Number,
    action: String
  }],
  aiFeedback: {
    summary: String,
    insights: [String],
    recommendations: [String],
    status: String
  },
  completedAt: { type: Date, default: Date.now }
});

// Add indexes for performance
performanceLogSchema.index({ studentId: 1, subject: 1 });
performanceLogSchema.index({ studentId: 1, completedAt: -1 });

module.exports = mongoose.model('PerformanceLog', performanceLogSchema);
