const mongoose = require('mongoose');

const quizAnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AptitudeQuestion' },
  questionText: String,
  selectedOption: Number,
  correctOption: Number,
  isCorrect: Boolean,
  explanation: String,
  timeSpentSeconds: { type: Number, default: 0 }
}, { _id: false });

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, default: 'All' },
  totalQuestions: { type: Number, required: true },
  score: { type: Number, required: true },
  correctAnswersCount: { type: Number, default: 0 },
  incorrectAnswersCount: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  timeSpentTotalSeconds: { type: Number, default: 0 },
  answers: [quizAnswerSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
