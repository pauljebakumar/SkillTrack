const express = require('express');
const router = express.Router();
const {
  chatWithCoach,
  generateStudyMaterial,
  saveGeneratedMaterial,
  explainCode,
  evaluateInterview
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.post('/chat', optionalAuth, aiLimiter, chatWithCoach);
router.post('/generate-study-material', optionalAuth, aiLimiter, generateStudyMaterial);
router.post('/save-generated-material', protect, saveGeneratedMaterial);
router.post('/explain-code', optionalAuth, aiLimiter, explainCode);
router.post('/evaluate-interview', optionalAuth, aiLimiter, evaluateInterview);

module.exports = router;
