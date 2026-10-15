const AptitudeQuestion = require('../models/AptitudeQuestion');
const QuizAttempt = require('../models/QuizAttempt');
const skillAnalysisEngine = require('../services/skillAnalysisEngine');
const memoryStore = require('../config/memoryStore');
const { isConnected } = require('../config/db');

// @desc Get aptitude questions by topic / subject / difficulty
// @route GET /api/aptitude/questions
exports.getQuestions = async (req, res, next) => {
  try {
    const { subject, topic, difficulty, limit = 10 } = req.query;

    let questions = [];
    if (isConnected()) {
      const query = {};
      if (subject) query.subject = subject;
      if (topic) query.topic = new RegExp(topic, 'i');
      if (difficulty) query.difficulty = difficulty;
      questions = await AptitudeQuestion.find(query).limit(Number(limit));
    } else {
      questions = memoryStore.getCollection('aptitudequestions');
      if (subject) questions = questions.filter(q => q.subject === subject);
      if (topic) questions = questions.filter(q => q.topic.toLowerCase().includes(topic.toLowerCase()));
      if (difficulty) questions = questions.filter(q => q.difficulty === difficulty);
      questions = questions.slice(0, Number(limit));
    }

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (err) {
    next(err);
  }
};

// @desc Submit aptitude quiz attempt
// @route POST /api/aptitude/submit
exports.submitQuiz = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { category, topic, difficulty, answers, timeSpentTotalSeconds } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: 'No answers provided.' });
    }

    let correctCount = 0;
    const gradedAnswers = [];

    for (const ans of answers) {
      let q = null;
      if (isConnected()) {
        q = await AptitudeQuestion.findById(ans.questionId);
      } else {
        q = memoryStore.findById('aptitudequestions', ans.questionId);
      }

      if (q) {
        const isCorrect = Number(ans.selectedOption) === Number(q.correctOptionId);
        if (isCorrect) correctCount++;

        gradedAnswers.push({
          questionId: q._id,
          questionText: q.questionText,
          selectedOption: ans.selectedOption,
          correctOption: q.correctOptionId,
          isCorrect,
          explanation: q.explanation || '',
          timeSpentSeconds: ans.timeSpentSeconds || 0
        });
      }
    }

    const totalQuestions = gradedAnswers.length;
    const incorrectCount = totalQuestions - correctCount;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const score = correctCount; // 1 mark per question

    const attemptData = {
      user: userId,
      category: category || 'Aptitude Practice',
      topic: topic || 'Mixed Aptitude',
      difficulty: difficulty || 'All',
      totalQuestions,
      score,
      correctAnswersCount: correctCount,
      incorrectAnswersCount: incorrectCount,
      accuracy,
      timeSpentTotalSeconds: timeSpentTotalSeconds || 60,
      answers: gradedAnswers
    };

    let savedAttempt;
    if (isConnected()) {
      savedAttempt = await QuizAttempt.create(attemptData);
    } else {
      savedAttempt = memoryStore.insertOne('quizattempts', attemptData);
    }

    // Refresh skill analysis in background
    skillAnalysisEngine.calculateForUser(userId).catch(err => {
      console.warn('[AptitudeController] Skill recalculation error:', err.message);
    });

    res.status(200).json({
      success: true,
      message: 'Quiz evaluated successfully',
      data: savedAttempt
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get student quiz attempt history
// @route GET /api/aptitude/history
exports.getHistory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let history = [];

    if (isConnected()) {
      history = await QuizAttempt.find({ user: userId }).sort({ createdAt: -1 });
    } else {
      history = memoryStore
        .find('quizattempts', { user: userId })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (err) {
    next(err);
  }
};
