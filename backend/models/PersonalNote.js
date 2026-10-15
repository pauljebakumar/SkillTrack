const mongoose = require('mongoose');

const personalNoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, required: true },
  subject: { type: String, default: 'General' },
  topic: { type: String, default: 'Notes' },
  content: { type: String, required: true },
  tags: [{ type: String }],
  isAiGenerated: { type: Boolean, default: false },
  isBookmarked: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('PersonalNote', personalNoteSchema);
