const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  text: { type: String, required: true }
}, { _id: false });

const aptitudeQuestionSchema = new mongoose.Schema({
  subject: {
    type: String,
    enum: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Data Interpretation'],
    required: true
  },
  topic: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  questionText: { type: String, required: true },
  options: [optionSchema],
  correctOptionId: { type: Number, required: true },
  explanation: { type: String, default: '' },
  formulaUsed: { type: String, default: '' },
  isAiGenerated: { type: Boolean, default: false },
  verified: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('AptitudeQuestion', aptitudeQuestionSchema);
