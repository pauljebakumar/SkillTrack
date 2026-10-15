const mongoose = require('mongoose');

const sectionScoreSchema = new mongoose.Schema({
  section: String,
  score: Number,
  maxScore: Number,
  accuracy: Number
}, { _id: false });

const responseSchema = new mongoose.Schema({
  questionIndex: Number,
  questionText: String,
  selectedAnswer: Number, // option id
  correctAnswer: Number,
  isCorrect: Boolean,
  markedForReview: { type: Boolean, default: false },
  timeSpentSeconds: { type: Number, default: 0 }
}, { _id: false });

const mockTestAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mockTest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockTest',
    required: true
  },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress'
  },
  timeSpentSeconds: { type: Number, default: 0 },
  scoreObtained: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  sectionWiseScores: [sectionScoreSchema],
  responses: [responseSchema],
  recommendations: [{ type: String }]
}, {
  timestamps: true
});

module.exports = mongoose.model('MockTestAttempt', mockTestAttemptSchema);
