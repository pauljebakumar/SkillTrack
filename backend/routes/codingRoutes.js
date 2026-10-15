const express = require('express');
const router = express.Router();
const {
  getAllQuestions,
  getQuestion,
  runCode,
  submitSolution,
  getSubmissions
} = require('../controllers/codingController');
const { protect } = require('../middleware/auth');
const { codeExecutionLimiter } = require('../middleware/rateLimiter');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/questions', optionalAuth, getAllQuestions);
router.get('/questions/:slugOrId', optionalAuth, getQuestion);
router.post('/run', codeExecutionLimiter, runCode);
router.post('/questions/:id/submit', protect, codeExecutionLimiter, submitSolution);
router.get('/submissions/:questionId', protect, getSubmissions);

module.exports = router;
