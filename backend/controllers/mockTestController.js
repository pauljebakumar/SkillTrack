const MockTest = require('../models/MockTest');
const MockTestAttempt = require('../models/MockTestAttempt');
const skillAnalysisEngine = require('../services/skillAnalysisEngine');
const memoryStore = require('../config/memoryStore');
const { isConnected } = require('../config/db');

// @desc Get all published mock tests
// @route GET /api/mock-tests
exports.getMockTests = async (req, res, next) => {
  try {
    const { category } = req.query;

    let tests = [];
    if (isConnected()) {
      const q = { isPublished: true };
      if (category) q.category = category;
      tests = await MockTest.find(q);
    } else {
      tests = memoryStore.getCollection('mocktests').filter(m => m.isPublished);
      if (category) tests = tests.filter(m => m.category === category);
    }

    // Attach student attempt status if logged in
    let attemptMap = {};
    if (req.user) {
      const userId = req.user._id || req.user.id;
      let attempts = [];
      if (isConnected()) {
        attempts = await MockTestAttempt.find({ user: userId });
      } else {
        attempts = memoryStore.find('mocktestattempts', { user: userId });
      }

      attempts.forEach(a => {
        const tId = String(a.mockTest?._id || a.mockTest);
        if (!attemptMap[tId] || a.scoreObtained > attemptMap[tId].scoreObtained) {
          attemptMap[tId] = a;
        }
      });
    }

    const data = tests.map(t => {
      const plain = typeof t.toObject === 'function' ? t.toObject() : { ...t };
      return {
        ...plain,
        lastAttempt: attemptMap[String(plain._id)] || null
      };
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get mock test by ID for taking the test
// @route GET /api/mock-tests/:id
exports.getMockTestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let test = null;

    if (isConnected()) {
      test = await MockTest.findById(id);
    } else {
      test = memoryStore.findById('mocktests', id);
    }

    if (!test) {
      return res.status(404).json({ success: false, message: 'Mock test not found' });
    }

    res.status(200).json({
      success: true,
      data: test
    });
  } catch (err) {
    next(err);
  }
};

// @desc Submit mock test attempt
// @route POST /api/mock-tests/:id/submit
exports.submitMockTest = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { responses, timeSpentSeconds } = req.body;

    let test = null;
    if (isConnected()) {
      test = await MockTest.findById(id);
    } else {
      test = memoryStore.findById('mocktests', id);
    }

    if (!test) {
      return res.status(404).json({ success: false, message: 'Mock test not found' });
    }

    const questions = test.questions || [];
    let totalScore = 0;
    const gradedResponses = [];
    const sectionTotals = {};

    questions.forEach((q, idx) => {
      const resp = responses?.find(r => Number(r.questionIndex) === idx);
      const selectedAnswer = resp ? Number(resp.selectedAnswer) : null;
      const isCorrect = selectedAnswer !== null && selectedAnswer === q.correctOptionId;
      const section = q.section || 'General';

      if (!sectionTotals[section]) {
        sectionTotals[section] = { score: 0, maxScore: 0, correct: 0, total: 0 };
      }
      sectionTotals[section].maxScore += q.marks || 1;
      sectionTotals[section].total += 1;

      if (selectedAnswer !== null) {
        if (isCorrect) {
          totalScore += q.marks || 1;
          sectionTotals[section].score += q.marks || 1;
          sectionTotals[section].correct += 1;
        } else {
          totalScore -= (q.negativeMarks || 0);
          sectionTotals[section].score -= (q.negativeMarks || 0);
        }
      }

      gradedResponses.push({
        questionIndex: idx,
        questionText: q.questionText,
        selectedAnswer,
        correctAnswer: q.correctOptionId,
        isCorrect,
        markedForReview: resp?.markedForReview || false,
        timeSpentSeconds: resp?.timeSpentSeconds || 0
      });
    });

    const finalScore = Math.max(0, Math.round(totalScore * 100) / 100);
    const percentage = test.totalMarks > 0 ? Math.round((finalScore / test.totalMarks) * 100) : 0;
    const passed = finalScore >= (test.passingMarks || (test.totalMarks * 0.4));

    // Build section wise scores
    const sectionWiseScores = Object.entries(sectionTotals).map(([sec, stats]) => ({
      section: sec,
      score: Math.max(0, stats.score),
      maxScore: stats.maxScore,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
    }));

    // Recommendations based on score
    const recommendations = [];
    if (percentage < 60) {
      recommendations.push('Review fundamental formulas and take untimed practice tests first.');
    }
    sectionWiseScores.forEach(sec => {
      if (sec.accuracy < 60) {
        recommendations.push(`Revise topics under '${sec.section}' to improve sectional cutoff performance.`);
      }
    });
    if (recommendations.length === 0) {
      recommendations.push('Outstanding performance! Maintain speed and attempt Tier-1 company specific tests.');
    }

    const attemptData = {
      user: userId,
      mockTest: test._id,
      startTime: new Date(Date.now() - (timeSpentSeconds || 60) * 1000),
      endTime: new Date(),
      status: 'completed',
      timeSpentSeconds: timeSpentSeconds || 60,
      scoreObtained: finalScore,
      totalMarks: test.totalMarks,
      percentage,
      passed,
      sectionWiseScores,
      responses: gradedResponses,
      recommendations
    };

    let savedAttempt;
    if (isConnected()) {
      savedAttempt = await MockTestAttempt.create(attemptData);
    } else {
      savedAttempt = memoryStore.insertOne('mocktestattempts', attemptData);
    }

    // Refresh skill analysis
    skillAnalysisEngine.calculateForUser(userId).catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Mock test submitted and evaluated',
      data: savedAttempt
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get student mock test history
// @route GET /api/mock-tests/history
exports.getAttempts = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let attempts = [];

    if (isConnected()) {
      attempts = await MockTestAttempt.find({ user: userId }).populate('mockTest').sort({ createdAt: -1 });
    } else {
      attempts = memoryStore
        .find('mocktestattempts', { user: userId })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (err) {
    next(err);
  }
};
