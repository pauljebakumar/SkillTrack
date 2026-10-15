const mongoose = require('mongoose');

const testCaseResultSchema = new mongoose.Schema({
  caseNumber: Number,
  passed: Boolean,
  input: String,
  expectedOutput: String,
  actualOutput: String,
  executionTimeMs: Number,
  error: String
}, { _id: false });

const codingSubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingQuestion',
    required: true
  },
  code: { type: String, required: true },
  language: {
    type: String,
    enum: ['python', 'javascript', 'java', 'cpp', 'c'],
    required: true
  },
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error', 'Runtime Error', 'Pending'],
    default: 'Pending'
  },
  executionTimeMs: { type: Number, default: 0 },
  memoryUsedKB: { type: Number, default: 0 },
  testCasesPassed: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  compilerOutput: { type: String, default: '' },
  testCaseResults: [testCaseResultSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('CodingSubmission', codingSubmissionSchema);
