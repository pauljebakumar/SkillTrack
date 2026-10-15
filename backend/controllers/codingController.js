const CodingQuestion = require('../models/CodingQuestion');
const CodingSubmission = require('../models/CodingSubmission');
const judge0Service = require('../services/judge0Service');
const skillAnalysisEngine = require('../services/skillAnalysisEngine');
const memoryStore = require('../config/memoryStore');
const { isConnected } = require('../config/db');

// @desc Get all coding problems
// @route GET /api/coding/questions
exports.getAllQuestions = async (req, res, next) => {
  try {
    const { difficulty, category, search, tag } = req.query;

    let questions = [];
    if (isConnected()) {
      const query = {};
      if (difficulty) query.difficulty = difficulty;
      if (category) query.category = category;
      if (tag) query.topicTags = tag;
      if (search) {
        query.$or = [
          { title: new RegExp(search, 'i') },
          { topicTags: new RegExp(search, 'i') },
          { category: new RegExp(search, 'i') }
        ];
      }
      questions = await CodingQuestion.find(query).select('-hiddenTestCases -starterCode');
    } else {
      questions = memoryStore.getCollection('codingquestions');
      if (difficulty) questions = questions.filter(q => q.difficulty === difficulty);
      if (category) questions = questions.filter(q => q.category === category);
      if (tag) questions = questions.filter(q => q.topicTags && q.topicTags.includes(tag));
      if (search) {
        const s = search.toLowerCase();
        questions = questions.filter(q =>
          q.title.toLowerCase().includes(s) ||
          q.category.toLowerCase().includes(s) ||
          (q.topicTags && q.topicTags.some(t => t.toLowerCase().includes(s)))
        );
      }
    }

    // Attach user submission status if logged in
    let solvedMap = {};
    if (req.user) {
      const userId = req.user._id || req.user.id;
      let subs = [];
      if (isConnected()) {
        subs = await CodingSubmission.find({ user: userId });
      } else {
        subs = memoryStore.find('codingsubmissions', { user: userId });
      }
      subs.forEach(s => {
        const qId = String(s.question?._id || s.question);
        if (s.status === 'Accepted') {
          solvedMap[qId] = 'Accepted';
        } else if (!solvedMap[qId]) {
          solvedMap[qId] = 'Attempted';
        }
      });
    }

    const data = questions.map(q => {
      const plain = typeof q.toObject === 'function' ? q.toObject() : { ...q };
      return {
        ...plain,
        userStatus: solvedMap[String(plain._id)] || 'Unsolved'
      };
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get single coding problem
// @route GET /api/coding/questions/:slugOrId
exports.getQuestion = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    let question = null;

    if (isConnected()) {
      question = await CodingQuestion.findOne({
        $or: [{ slug: slugOrId }, { _id: slugOrId.match(/^[0-9a-fA-F]{24}$/) ? slugOrId : null }]
      }).select('-hiddenTestCases'); // Never reveal hidden test cases
    } else {
      const list = memoryStore.getCollection('codingquestions');
      const found = list.find(q => q.slug === slugOrId || String(q._id) === String(slugOrId));
      if (found) {
        const { hiddenTestCases, ...safe } = found;
        question = safe;
      }
    }

    if (!question) {
      return res.status(404).json({ success: false, message: 'Coding problem not found' });
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (err) {
    next(err);
  }
};

// @desc Run code with custom input or sample tests (Sandboxed / Judge0)
// @route POST /api/coding/run
exports.runCode = async (req, res, next) => {
  try {
    const { code, language, stdin, expectedOutput, timeLimit } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both code and programming language.'
      });
    }

    const result = await judge0Service.executeCode({
      code,
      language,
      stdin: stdin || '',
      expectedOutput: expectedOutput || '',
      timeLimit: timeLimit || 2
    });

    res.status(200).json({
      success: true,
      result
    });
  } catch (err) {
    next(err);
  }
};

// @desc Submit solution for evaluation against all test cases
// @route POST /api/coding/questions/:id/submit
exports.submitSolution = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Please provide code and language for submission.'
      });
    }

    let question = null;
    if (isConnected()) {
      question = await CodingQuestion.findById(id);
    } else {
      question = memoryStore.findById('codingquestions', id);
    }

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Combine sample and hidden test cases
    const allTestCases = [
      ...(question.sampleTestCases || []),
      ...(question.hiddenTestCases || [])
    ];

    if (allTestCases.length === 0) {
      allTestCases.push({ input: '', expectedOutput: '' });
    }

    let passedCount = 0;
    let finalStatus = 'Accepted';
    let totalTimeMs = 0;
    let maxMemoryKB = 0;
    let compilerErrorMsg = '';
    const testCaseResults = [];

    // Evaluate against each test case
    for (let i = 0; i < allTestCases.length; i++) {
      const tc = allTestCases[i];
      const execResult = await judge0Service.executeCode({
        code,
        language,
        stdin: tc.input || '',
        expectedOutput: tc.expectedOutput || '',
        timeLimit: question.timeLimitSeconds || 2
      });

      totalTimeMs += execResult.executionTimeMs || 0;
      maxMemoryKB = Math.max(maxMemoryKB, execResult.memoryUsedKB || 0);

      const passed = execResult.status === 'Accepted';
      if (passed) {
        passedCount++;
      } else if (finalStatus === 'Accepted') {
        finalStatus = execResult.status; // first failing status
      }

      if (execResult.status === 'Compilation Error') {
        compilerErrorMsg = execResult.stderr || execResult.compilerOutput || 'Compilation Error';
      }

      testCaseResults.push({
        caseNumber: i + 1,
        passed,
        input: i < (question.sampleTestCases?.length || 1) ? tc.input : '[Hidden Test Case]',
        expectedOutput: i < (question.sampleTestCases?.length || 1) ? tc.expectedOutput : '[Hidden]',
        actualOutput: execResult.stdout,
        executionTimeMs: execResult.executionTimeMs,
        error: execResult.stderr
      });

      // Stop early if compilation error
      if (execResult.status === 'Compilation Error') {
        break;
      }
    }

    const avgTimeMs = allTestCases.length > 0 ? Math.round(totalTimeMs / allTestCases.length) : 0;

    // Save submission
    const submissionData = {
      user: userId,
      question: question._id,
      code,
      language,
      status: finalStatus,
      executionTimeMs: avgTimeMs,
      memoryUsedKB: maxMemoryKB,
      testCasesPassed: passedCount,
      totalTestCases: allTestCases.length,
      compilerOutput: compilerErrorMsg,
      testCaseResults
    };

    let savedSubmission;
    if (isConnected()) {
      savedSubmission = await CodingSubmission.create(submissionData);
      // Update question counts
      await CodingQuestion.findByIdAndUpdate(question._id, {
        $inc: {
          totalSubmissions: 1,
          totalAccepted: finalStatus === 'Accepted' ? 1 : 0
        }
      });
    } else {
      savedSubmission = memoryStore.insertOne('codingsubmissions', submissionData);
      const q = memoryStore.findById('codingquestions', question._id);
      if (q) {
        q.totalSubmissions = (q.totalSubmissions || 0) + 1;
        if (finalStatus === 'Accepted') q.totalAccepted = (q.totalAccepted || 0) + 1;
        memoryStore.saveToFile();
      }
    }

    // Trigger asynchronous skill recalculation in background
    skillAnalysisEngine.calculateForUser(userId).catch(err => {
      console.warn('[CodingController] Skill analysis recalculation warning:', err.message);
    });

    res.status(200).json({
      success: true,
      submission: savedSubmission
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get student's previous submissions for a question
// @route GET /api/coding/submissions/:questionId
exports.getSubmissions = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { questionId } = req.params;

    let submissions = [];
    if (isConnected()) {
      submissions = await CodingSubmission.find({ user: userId, question: questionId }).sort({ createdAt: -1 });
    } else {
      submissions = memoryStore
        .find('codingsubmissions', { user: userId, question: questionId })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (err) {
    next(err);
  }
};
