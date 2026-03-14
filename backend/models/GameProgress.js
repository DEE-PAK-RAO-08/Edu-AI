const mongoose = require('mongoose');

const gameProgressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  gameType: { type: String, required: true },
  subject: { type: String, required: true },
  score: { type: Number, default: 0 },
  xpEarned: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  completed: { type: Boolean, default: false },
  timeTaken: { type: Number, default: 0 },
  playedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GameProgress', gameProgressSchema);
