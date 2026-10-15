const mongoose = require('mongoose');

const mockQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ id: Number, text: String }],
  correctOptionId: { type: Number, required: true },
  marks: { type: Number, default: 1 },
  negativeMarks: { type: Number, default: 0.25 },
  section: { type: String, default: 'General' },
  explanation: { type: String, default: '' }
}, { _id: false });

const mockTestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: [
      'Quantitative Aptitude',
      'Logical Reasoning',
      'Verbal Ability',
      'Programming',
      'Data Structures and Algorithms',
      'Core Computer Science',
      'Mixed Placement Assessment'
    ],
    required: true
  },
  durationMinutes: { type: Number, required: true, default: 45 },
  totalMarks: { type: Number, required: true, default: 50 },
  passingMarks: { type: Number, required: true, default: 25 },
  questionCount: { type: Number, required: true, default: 25 },
  mode: {
    type: String,
    enum: ['practice', 'assessment'],
    default: 'assessment'
  },
  questions: [mockQuestionSchema],
  isPublished: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('MockTest', mockTestSchema);
