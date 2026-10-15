const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getUsers,
  saveStudyMaterial,
  deleteStudyMaterial,
  saveCodingQuestion,
  deleteCodingQuestion,
  verifyStudyMaterial
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Server-side role enforcement: Must be authenticated AND have role === 'admin'
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getUsers);
router.post('/study-materials', saveStudyMaterial);
router.delete('/study-materials/:id', deleteStudyMaterial);
router.patch('/study-materials/:id/verify', verifyStudyMaterial);
router.post('/coding-questions', saveCodingQuestion);
router.delete('/coding-questions/:id', deleteCodingQuestion);

module.exports = router;
