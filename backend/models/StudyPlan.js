const mongoose = require('mongoose');

const taskItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, default: 'General' },
  category: { type: String, default: 'Aptitude' },
  targetDate: { type: String }, // YYYY-MM-DD
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  notes: { type: String, default: '' }
});

const studyPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dailyTargetMinutes: { type: Number, default: 60 },
  tasks: [taskItemSchema],
  weeklyMilestone: { type: String, default: 'Complete 15 Coding Questions & 2 Mock Tests' },
  progressPercentage: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
