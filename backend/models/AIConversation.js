const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { _id: false });

const aiConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionTitle: { type: String, default: 'New Conversation' },
  mode: {
    type: String,
    enum: [
      'study_assistant',
      'coding_assistant',
      'aptitude_coach',
      'interview_coach',
      'learning_planner',
      'skill_analysis'
    ],
    default: 'study_assistant'
  },
  messages: [chatMessageSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('AIConversation', aiConversationSchema);
