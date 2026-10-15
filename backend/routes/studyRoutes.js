const express = require('express');
const router = express.Router();
const { getAll, getOne, updateProgress, toggleBookmark } = require('../controllers/studyMaterialController');
const { protect } = require('../middleware/auth');

// Optional auth for reading materials so guests can view, but logged-in students track progress
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, getAll);
router.get('/:slugOrId', optionalAuth, getOne);
router.post('/:id/progress', protect, updateProgress);
router.post('/:id/bookmark', protect, toggleBookmark);

module.exports = router;
