const StudyPlan = require('../models/StudyPlan');
const memoryStore = require('../config/memoryStore');
const { isConnected } = require('../config/db');

// @desc Get student study plan & tasks
// @route GET /api/planner
exports.getStudyPlan = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    let plan = null;
    if (isConnected()) {
      plan = await StudyPlan.findOne({ user: userId });
      if (!plan) {
        plan = await StudyPlan.create({
          user: userId,
          dailyTargetMinutes: 60,
          weeklyMilestone: 'Complete 10 Coding Exercises & 1 Placement Mock Test',
          tasks: [
            {
              title: 'Solve Two Sum in Python / C++',
              subject: 'Data Structures',
              category: 'Coding',
              targetDate: new Date().toISOString().split('T')[0],
              completed: false,
              priority: 'High'
            },
            {
              title: 'Revise Time and Work LCM formulas',
              subject: 'Quantitative Aptitude',
              category: 'Aptitude',
              targetDate: new Date().toISOString().split('T')[0],
              completed: false,
              priority: 'Medium'
            },
            {
              title: 'Practice Behavioral STAR Method for "Tell Me About Yourself"',
              subject: 'HR Preparation',
              category: 'Interview',
              targetDate: new Date().toISOString().split('T')[0],
              completed: false,
              priority: 'Low'
            }
          ]
        });
      }
    } else {
      plan = memoryStore.findOne('studyplans', { user: userId });
      if (!plan) {
        plan = memoryStore.insertOne('studyplans', {
          user: userId,
          dailyTargetMinutes: 60,
          weeklyMilestone: 'Complete 10 Coding Exercises & 1 Placement Mock Test',
          tasks: [
            {
              _id: 'task_1',
              title: 'Solve Two Sum in Python / C++',
              subject: 'Data Structures',
              category: 'Coding',
              targetDate: new Date().toISOString().split('T')[0],
              completed: false,
              priority: 'High'
            },
            {
              _id: 'task_2',
              title: 'Revise Time and Work LCM formulas',
              subject: 'Quantitative Aptitude',
              category: 'Aptitude',
              targetDate: new Date().toISOString().split('T')[0],
              completed: false,
              priority: 'Medium'
            },
            {
              _id: 'task_3',
              title: 'Practice Behavioral STAR Method for "Tell Me About Yourself"',
              subject: 'HR Preparation',
              category: 'Interview',
              targetDate: new Date().toISOString().split('T')[0],
              completed: false,
              priority: 'Low'
            }
          ]
        });
      }
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (err) {
    next(err);
  }
};

// @desc Add a task
// @route POST /api/planner/tasks
exports.addTask = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { title, subject, category, targetDate, priority, notes } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const newTask = {
      title,
      subject: subject || 'General',
      category: category || 'Study',
      targetDate: targetDate || new Date().toISOString().split('T')[0],
      completed: false,
      priority: priority || 'Medium',
      notes: notes || ''
    };

    let plan;
    if (isConnected()) {
      plan = await StudyPlan.findOne({ user: userId });
      if (!plan) {
        plan = await StudyPlan.create({ user: userId, tasks: [newTask] });
      } else {
        plan.tasks.push(newTask);
        await plan.save();
      }
    } else {
      plan = memoryStore.findOne('studyplans', { user: userId });
      newTask._id = memoryStore.generateId();
      if (!plan) {
        plan = memoryStore.insertOne('studyplans', { user: userId, tasks: [newTask] });
      } else {
        plan.tasks.push(newTask);
        memoryStore.saveToFile();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Task added successfully',
      data: plan
    });
  } catch (err) {
    next(err);
  }
};

// @desc Toggle task completed
// @route PATCH /api/planner/tasks/:taskId/toggle
exports.toggleTask = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { taskId } = req.params;

    let plan;
    if (isConnected()) {
      plan = await StudyPlan.findOne({ user: userId });
      if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

      const task = plan.tasks.id(taskId);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date() : null;
      await plan.save();
    } else {
      plan = memoryStore.findOne('studyplans', { user: userId });
      if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

      const task = plan.tasks.find(t => String(t._id) === String(taskId));
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date() : null;
      memoryStore.saveToFile();
    }

    res.status(200).json({
      success: true,
      message: 'Task status updated',
      data: plan
    });
  } catch (err) {
    next(err);
  }
};

// @desc Delete task
// @route DELETE /api/planner/tasks/:taskId
exports.deleteTask = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { taskId } = req.params;

    let plan;
    if (isConnected()) {
      plan = await StudyPlan.findOne({ user: userId });
      if (plan) {
        plan.tasks = plan.tasks.filter(t => String(t._id) !== String(taskId));
        await plan.save();
      }
    } else {
      plan = memoryStore.findOne('studyplans', { user: userId });
      if (plan) {
        plan.tasks = plan.tasks.filter(t => String(t._id) !== String(taskId));
        memoryStore.saveToFile();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Task removed',
      data: plan
    });
  } catch (err) {
    next(err);
  }
};
