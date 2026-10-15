const mongoose = require('mongoose');

const skillScoreItem = new mongoose.Schema({
  skill: String,
  category: String,
  score: Number, // 0-100
  totalAttempted: Number,
  totalSolved: Number,
  accuracy: Number,
  status: {
    type: String,
    enum: ['strong', 'moderate', 'weak'],
    default: 'moderate'
  }
}, { _id: false });

const recommendationItem = new mongoose.Schema({
  title: String,
  description: String,
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  category: String,
  actionLink: String
}, { _id: false });

const repeatedMistakeItem = new mongoose.Schema({
  topic: String,
  pattern: String,
  suggestion: String,
  frequency: Number
}, { _id: false });

const skillAnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  overallScore: { type: Number, default: 0 },
  skillScores: [skillScoreItem],
  strongSkills: [{ type: String }],
  weakSkills: [{ type: String }],
  recommendations: [recommendationItem],
  repeatedMistakes: [repeatedMistakeItem],
  studyTimeDistribution: [{
    subject: String,
    minutes: Number
  }],
  codingStats: {
    solvedCount: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 },
    preferredLanguage: { type: String, default: 'python' }
  },
  aptitudeStats: {
    attemptedCount: { type: Number, default: 0 },
    averageAccuracy: { type: Number, default: 0 }
  },
  mockStats: {
    testsTaken: { type: Number, default: 0 },
    averagePercentage: { type: Number, default: 0 }
  },
  lastCalculatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('SkillAnalysis', skillAnalysisSchema);
