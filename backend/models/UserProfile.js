const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  targetCompanies: [{ type: String }],
  targetRole: { type: String, default: 'Software Development Engineer' },
  cgpa: { type: Number, default: 8.0 },
  resumeUrl: { type: String, default: '' },
  avatar: { type: String, default: '' },
  dailyGoalMinutes: { type: Number, default: 60 },
  skillsMatrix: {
    type: Map,
    of: Number,
    default: {}
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    dailyReminder: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
