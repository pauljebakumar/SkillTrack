const mongoose = require('mongoose');

const sampleProgramSchema = new mongoose.Schema({
  title: String,
  code: String,
  language: String,
  expectedOutput: String
}, { _id: false });

const commonErrorSchema = new mongoose.Schema({
  error: String,
  explanation: String,
  fix: String
}, { _id: false });

const solvedExampleSchema = new mongoose.Schema({
  problem: String,
  stepByStepSolution: String,
  answer: String
}, { _id: false });

const interviewQuestionSchema = new mongoose.Schema({
  question: String,
  answer: String,
  explanation: String
}, { _id: false });

const quizQuestionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: Number, // index 0-3
  explanation: String
}, { _id: false });

const studyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: {
    type: String,
    enum: ['aptitude', 'programming', 'core_cs'],
    required: true
  },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  isAiGenerated: { type: Boolean, default: false },
  verifiedByAdmin: { type: Boolean, default: true },
  content: {
    notes: { type: String, required: true },
    formulas: [{ type: String }],
    syntax: { type: String, default: '' },
    samplePrograms: [sampleProgramSchema],
    commonErrors: [commonErrorSchema],
    solvedExamples: [solvedExampleSchema],
    practiceExercises: [{ type: String }],
    interviewQuestions: [interviewQuestionSchema]
  },
  quizzes: [quizQuestionSchema],
  tags: [{ type: String }],
  estimatedReadTimeMinutes: { type: Number, default: 15 },
  viewCount: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
