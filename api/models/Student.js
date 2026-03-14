const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String, default: '' },
  avatar: { type: String, default: 'avatar1' },
  profilePicture: { type: String, default: '' },
  bio: { type: String, default: '' },
  phone: { type: String, default: '' },
  isPhoneVerified: { type: Boolean, default: false },
  streakNotificationsEnabled: { type: Boolean, default: false },
  otp: { type: String, default: '' },
  otpExpiry: { type: Date },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  levelTitle: { type: String, default: 'Beginner' },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  badges: [{ 
    name: String, 
    icon: String, 
    earnedAt: { type: Date, default: Date.now } 
  }],
  preferredLanguage: { type: String, default: 'en' },
  learningStyle: { type: String, enum: ['visual', 'reading', 'practice', 'unknown'], default: 'unknown' },
  subjects: [{
    name: String,
    assessmentCompleted: { type: Boolean, default: false },
    accuracy: { type: Number, default: 0 },
    strongAreas: [String],
    weakAreas: [String],
    currentLevel: { type: Number, default: 1 }
  }],
  createdAt: { type: Date, default: Date.now }
});

studentSchema.methods.getLevelTitle = function() {
  const l = this.level;
  if (l <= 5) return 'Novice';
  if (l <= 12) return 'Apprentice';
  if (l <= 20) return 'Explorer';
  if (l <= 30) return 'Scholar';
  if (l <= 45) return 'Specialist';
  if (l <= 60) return 'Elite';
  if (l <= 80) return 'Master';
  if (l <= 100) return 'Legend';
  return 'Grandmaster';
};

module.exports = mongoose.model('Student', studentSchema);
