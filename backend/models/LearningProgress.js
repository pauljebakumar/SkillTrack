const mongoose = require('mongoose');

const learningProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studyMaterial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyMaterial'
  },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  category: {
    type: String,
    enum: ['aptitude', 'programming', 'core_cs'],
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'marked_for_revision'],
    default: 'not_started'
  },
  lastStudiedAt: { type: Date, default: Date.now },
  progressPercentage: { type: Number, default: 0 },
  bookmarked: { type: Boolean, default: false },
  personalNotes: { type: String, default: '' },
  timeSpentMinutes: { type: Number, default: 0 }
}, {
  timestamps: true
});

learningProgressSchema.index({ user: 1, subject: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model('LearningProgress', learningProgressSchema);
