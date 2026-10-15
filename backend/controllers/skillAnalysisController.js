const skillAnalysisEngine = require('../services/skillAnalysisEngine');
const SkillAnalysis = require('../models/SkillAnalysis');
const memoryStore = require('../config/memoryStore');
const { isConnected } = require('../config/db');

// @desc Get student skill analysis report
// @route GET /api/analytics/skill-analysis
exports.getMyAnalysis = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    let analysis = null;
    if (isConnected()) {
      analysis = await SkillAnalysis.findOne({ user: userId });
    } else {
      analysis = memoryStore.findOne('skillanalyses', { user: userId });
    }

    if (!analysis) {
      // Calculate fresh if not existing yet
      analysis = await skillAnalysisEngine.calculateForUser(userId);
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (err) {
    next(err);
  }
};

// @desc Manually recalculate analysis
// @route POST /api/analytics/recalculate
exports.recalculate = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const freshAnalysis = await skillAnalysisEngine.calculateForUser(userId);

    res.status(200).json({
      success: true,
      message: 'Skill analysis recalculated based on current activity',
      data: freshAnalysis
    });
  } catch (err) {
    next(err);
  }
};
