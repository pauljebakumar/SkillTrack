const express = require('express');
const router = express.Router();
const { getStudyPlan, addTask, toggleTask, deleteTask } = require('../controllers/plannerController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getStudyPlan);
router.post('/tasks', addTask);
router.patch('/tasks/:taskId/toggle', toggleTask);
router.delete('/tasks/:taskId', deleteTask);

module.exports = router;
