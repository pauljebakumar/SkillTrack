const express = require('express');
const router = express.Router();
const { getMyAnalysis, recalculate } = require('../controllers/skillAnalysisController');
const { protect } = require('../middleware/auth');

router.get('/skill-analysis', protect, getMyAnalysis);
router.post('/recalculate', protect, recalculate);

module.exports = router;
