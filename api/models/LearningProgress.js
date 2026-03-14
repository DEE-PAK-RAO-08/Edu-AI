const mongoose = require('mongoose');

const learningProgressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  level: { type: Number, default: 1 },
  completed: { type: Boolean, default: false },
  progress: { type: Number, default: 0 },
  lessonsCompleted: [String],
  unlockedLevels: [Number],
  startedAt: { type: Date, default: Date.now },
  completedAt: Date
});

module.exports = mongoose.model('LearningProgress', learningProgressSchema);
