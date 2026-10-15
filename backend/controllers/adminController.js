const User = require('../models/User');
const StudyMaterial = require('../models/StudyMaterial');
const CodingQuestion = require('../models/CodingQuestion');
const CodingSubmission = require('../models/CodingSubmission');
const MockTest = require('../models/MockTest');
const MockTestAttempt = require('../models/MockTestAttempt');
const QuizAttempt = require('../models/QuizAttempt');
const memoryStore = require('../config/memoryStore');
const { isConnected } = require('../config/db');

// @desc Get platform aggregate statistics
// @route GET /api/admin/stats
exports.getPlatformStats = async (req, res, next) => {
  try {
    let totalUsers = 0;
    let totalStudents = 0;
    let totalStudyMaterials = 0;
    let totalCodingQuestions = 0;
    let totalSubmissions = 0;
    let totalMockAttempts = 0;
    let totalQuizAttempts = 0;

    if (isConnected()) {
      totalUsers = await User.countDocuments();
      totalStudents = await User.countDocuments({ role: 'student' });
      totalStudyMaterials = await StudyMaterial.countDocuments();
      totalCodingQuestions = await CodingQuestion.countDocuments();
      totalSubmissions = await CodingSubmission.countDocuments();
      totalMockAttempts = await MockTestAttempt.countDocuments();
      totalQuizAttempts = await QuizAttempt.countDocuments();
    } else {
      const users = memoryStore.getCollection('users');
      totalUsers = users.length;
      totalStudents = users.filter(u => u.role === 'student').length;
      totalStudyMaterials = memoryStore.getCollection('studymaterials').length;
      totalCodingQuestions = memoryStore.getCollection('codingquestions').length;
      totalSubmissions = memoryStore.getCollection('codingsubmissions').length;
      totalMockAttempts = memoryStore.getCollection('mocktestattempts').length;
      totalQuizAttempts = memoryStore.getCollection('quizattempts').length;
    }

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalStudyMaterials,
        totalCodingQuestions,
        totalSubmissions,
        totalMockAttempts,
        totalQuizAttempts,
        activeModules: ['Aptitude Practice', 'Coding Practice', 'Mock Tests', 'AI Placement Coach', 'Roadmap Planner']
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc List all platform users
// @route GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    let users = [];
    if (isConnected()) {
      users = await User.find().select('-password').sort({ createdAt: -1 });
    } else {
      users = memoryStore.getCollection('users').map(u => {
        const { password, ...safe } = u;
        return safe;
      });
    }

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc Create or edit study material (Admin)
// @route POST /api/admin/study-materials
exports.saveStudyMaterial = async (req, res, next) => {
  try {
    const { _id, title, category, subject, topic, difficulty, content, quizzes, tags, isAiGenerated, verifiedByAdmin } = req.body;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    const doc = {
      title,
      slug,
      category,
      subject,
      topic,
      difficulty,
      content,
      quizzes: quizzes || [],
      tags: tags || [],
      isAiGenerated: Boolean(isAiGenerated),
      verifiedByAdmin: verifiedByAdmin !== undefined ? verifiedByAdmin : true
    };

    let result;
    if (isConnected()) {
      if (_id) {
        result = await StudyMaterial.findByIdAndUpdate(_id, { $set: doc }, { new: true });
      } else {
        result = await StudyMaterial.create(doc);
      }
    } else {
      if (_id) {
        result = memoryStore.findByIdAndUpdate('studymaterials', _id, doc);
      } else {
        result = memoryStore.insertOne('studymaterials', doc);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Study material saved successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// @desc Delete study material
// @route DELETE /api/admin/study-materials/:id
exports.deleteStudyMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isConnected()) {
      await StudyMaterial.findByIdAndDelete(id);
    } else {
      memoryStore.findByIdAndDelete('studymaterials', id);
    }

    res.status(200).json({ success: true, message: 'Study material deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc Create or edit coding question (Admin)
// @route POST /api/admin/coding-questions
exports.saveCodingQuestion = async (req, res, next) => {
  try {
    const {
      _id,
      title,
      difficulty,
      category,
      topicTags,
      description,
      inputFormat,
      outputFormat,
      constraints,
      sampleTestCases,
      hiddenTestCases,
      starterCode,
      hints,
      editorial,
      timeLimitSeconds,
      memoryLimitMB
    } = req.body;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    const doc = {
      title,
      slug,
      difficulty,
      category,
      topicTags: topicTags || [],
      description,
      inputFormat: inputFormat || '',
      outputFormat: outputFormat || '',
      constraints: constraints || '',
      sampleTestCases: sampleTestCases || [],
      hiddenTestCases: hiddenTestCases || [],
      starterCode: starterCode || {},
      hints: hints || [],
      editorial: editorial || '',
      timeLimitSeconds: timeLimitSeconds || 2,
      memoryLimitMB: memoryLimitMB || 128
    };

    let result;
    if (isConnected()) {
      if (_id) {
        result = await CodingQuestion.findByIdAndUpdate(_id, { $set: doc }, { new: true });
      } else {
        result = await CodingQuestion.create(doc);
      }
    } else {
      if (_id) {
        result = memoryStore.findByIdAndUpdate('codingquestions', _id, doc);
      } else {
        result = memoryStore.insertOne('codingquestions', doc);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Coding question saved',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// @desc Delete coding question
// @route DELETE /api/admin/coding-questions/:id
exports.deleteCodingQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isConnected()) {
      await CodingQuestion.findByIdAndDelete(id);
    } else {
      memoryStore.findByIdAndDelete('codingquestions', id);
    }

    res.status(200).json({ success: true, message: 'Coding question deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc Review / Approve AI generated content
// @route PATCH /api/admin/study-materials/:id/verify
exports.verifyStudyMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    let updated;
    if (isConnected()) {
      updated = await StudyMaterial.findByIdAndUpdate(
        id,
        { $set: { verifiedByAdmin: verified !== undefined ? verified : true } },
        { new: true }
      );
    } else {
      updated = memoryStore.findByIdAndUpdate('studymaterials', id, {
        verifiedByAdmin: verified !== undefined ? verified : true
      });
    }

    res.status(200).json({
      success: true,
      message: 'Material verification updated',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};
