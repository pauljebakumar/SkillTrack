const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, default: '' },
  expectedOutput: { type: String, required: true },
  explanation: { type: String, default: '' }
}, { _id: false });

const codingQuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  category: { type: String, default: 'Algorithms' },
  topicTags: [{ type: String }],
  description: { type: String, required: true },
  inputFormat: { type: String, default: '' },
  outputFormat: { type: String, default: '' },
  constraints: { type: String, default: '' },
  sampleTestCases: [testCaseSchema],
  hiddenTestCases: [testCaseSchema],
  starterCode: {
    python: { type: String, default: '' },
    javascript: { type: String, default: '' },
    java: { type: String, default: '' },
    cpp: { type: String, default: '' },
    c: { type: String, default: '' }
  },
  hints: [{ type: String }],
  editorial: { type: String, default: '' },
  timeLimitSeconds: { type: Number, default: 2 },
  memoryLimitMB: { type: Number, default: 128 },
  totalSubmissions: { type: Number, default: 0 },
  totalAccepted: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('CodingQuestion', codingQuestionSchema);
