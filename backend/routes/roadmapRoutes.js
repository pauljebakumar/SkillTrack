const express = require('express');
const router = express.Router();
const { getRoadmap } = require('../controllers/roadmapController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRoadmap);

module.exports = router;
