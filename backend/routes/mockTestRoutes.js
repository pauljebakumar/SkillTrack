const express = require('express');
const router = express.Router();
const { getMockTests, getMockTestById, submitMockTest, getAttempts } = require('../controllers/mockTestController');
const { protect } = require('../middleware/auth');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, getMockTests);
router.get('/:id', protect, getMockTestById);
router.post('/:id/submit', protect, submitMockTest);
router.get('/history/attempts', protect, getAttempts);

module.exports = router;
