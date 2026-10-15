const mongoose = require('mongoose');

const aiUsageRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  feature: {
    type: String,
    enum: ['tutor', 'coding_assistant', 'question_generator', 'interview_coach', 'planner', 'recommendations', 'general'],
    required: true
  },
  promptTokens: { type: Number, default: 0 },
  responseTokens: { type: Number, default: 0 },
  requestCost: { type: Number, default: 0 },
  success: { type: Boolean, default: true },
  modelUsed: { type: String, default: 'gemini-1.5-flash' },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('AIUsageRecord', aiUsageRecordSchema);
