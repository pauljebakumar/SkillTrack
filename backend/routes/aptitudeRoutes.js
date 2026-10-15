const express = require('express');
const router = express.Router();
const { getQuestions, submitQuiz, getHistory } = require('../controllers/aptitudeController');
const { protect } = require('../middleware/auth');

router.get('/questions', getQuestions);
router.post('/submit', protect, submitQuiz);
router.get('/history', protect, getHistory);

module.exports = router;
