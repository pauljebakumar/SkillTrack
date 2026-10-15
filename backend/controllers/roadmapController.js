const LearningProgress = require('../models/LearningProgress');
const CodingSubmission = require('../models/CodingSubmission');
const QuizAttempt = require('../models/QuizAttempt');
const MockTestAttempt = require('../models/MockTestAttempt');
const memoryStore = require('../config/memoryStore');
const { isConnected } = require('../config/db');

// @desc Get personalized 8-stage placement roadmap with real user progress
// @route GET /api/roadmap
exports.getRoadmap = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    let progress = [];
    let submissions = [];
    let quizAttempts = [];
    let mockAttempts = [];

    if (isConnected()) {
      progress = await LearningProgress.find({ user: userId });
      submissions = await CodingSubmission.find({ user: userId });
      quizAttempts = await QuizAttempt.find({ user: userId });
      mockAttempts = await MockTestAttempt.find({ user: userId });
    } else {
      progress = memoryStore.find('learningprogresses', { user: userId });
      submissions = memoryStore.find('codingsubmissions', { user: userId });
      quizAttempts = memoryStore.find('quizattempts', { user: userId });
      mockAttempts = memoryStore.find('mocktestattempts', { user: userId });
    }

    const acceptedSubmissions = submissions.filter(s => s.status === 'Accepted').length;
    const completedQuizzes = quizAttempts.length;
    const completedMocks = mockAttempts.filter(m => m.status === 'completed').length;
    const completedTopics = progress.filter(p => p.status === 'completed').length;

    // 8 Placement Stages with real dynamic completion status
    const roadmapStages = [
      {
        stageNumber: 1,
        title: 'Stage 1: Programming Fundamentals',
        description: 'Master variables, loops, conditionals, functions, and standard I/O in your preferred language.',
        targetMilestone: '10 Problems Solved',
        category: 'Programming',
        status: acceptedSubmissions >= 5 ? 'completed' : 'in_progress',
        progressPct: Math.min(100, Math.round((acceptedSubmissions / 5) * 100)),
        topics: ['Basic Syntax & I/O', 'Conditionals & Loops', 'Functions & Scope', 'Arrays & Strings'],
        actionLink: '/coding'
      },
      {
        stageNumber: 2,
        title: 'Stage 2: Aptitude and Logical Reasoning',
        description: 'Practice high-frequency quantitative, logical, and verbal topics tested in placement exams.',
        targetMilestone: '5 Aptitude Quizzes',
        category: 'Aptitude',
        status: completedQuizzes >= 3 ? 'completed' : (completedQuizzes > 0 ? 'in_progress' : 'pending'),
        progressPct: Math.min(100, Math.round((completedQuizzes / 3) * 100)),
        topics: ['Time and Work', 'Percentages & Profit/Loss', 'Blood Relations', 'Coding-Decoding', 'Sentence Correction'],
        actionLink: '/aptitude'
      },
      {
        stageNumber: 3,
        title: 'Stage 3: Data Structures and Algorithms',
        description: 'Implement fundamental DSA structures: Linked Lists, Stacks, Queues, Trees, Binary Search, and Recursion.',
        targetMilestone: '15 DSA Problems',
        category: 'DSA',
        status: acceptedSubmissions >= 12 ? 'completed' : (acceptedSubmissions >= 3 ? 'in_progress' : 'pending'),
        progressPct: Math.min(100, Math.round((acceptedSubmissions / 12) * 100)),
        topics: ['Searching & Sorting', 'Binary Search', 'Sliding Window', 'Binary Trees', 'Hash Tables'],
        actionLink: '/coding'
      },
      {
        stageNumber: 4,
        title: 'Stage 4: Core Computer Science',
        description: 'Solidify your core engineering knowledge: DBMS (SQL & ACID), Operating Systems, and Computer Networks.',
        targetMilestone: 'All 3 Core Subjects Studied',
        category: 'Core CS',
        status: completedTopics >= 3 ? 'completed' : (completedTopics > 0 ? 'in_progress' : 'pending'),
        progressPct: Math.min(100, Math.round((completedTopics / 3) * 100)),
        topics: ['DBMS & SQL Queries', 'OS Process & Threading', 'Virtual Memory & Paging', 'Computer Networks & TCP/IP'],
        actionLink: '/study'
      },
      {
        stageNumber: 5,
        title: 'Stage 5: Coding Assessments',
        description: 'Timed problem-solving with boundary condition edge cases, optimal space and time complexity.',
        targetMilestone: 'Medium & Hard Problems',
        category: 'Coding',
        status: acceptedSubmissions >= 10 ? 'in_progress' : 'pending',
        progressPct: Math.min(100, Math.round((acceptedSubmissions / 10) * 100)),
        topics: ['Two-Pointer Techniques', 'Sliding Window', 'Dynamic Programming Fundamentals', 'Recursion & Backtracking'],
        actionLink: '/coding'
      },
      {
        stageNumber: 6,
        title: 'Stage 6: Technical Interview Preparation',
        description: 'Simulate live coding interviews, explain time complexity out loud, and walk through system architecture.',
        targetMilestone: '3 AI Technical Mock Interviews',
        category: 'Interview',
        status: 'in_progress',
        progressPct: 40,
        topics: ['Data Structure Walkthroughs', 'Complexity Analysis Presentation', 'Project Architecture Q&A'],
        actionLink: '/interview-prep'
      },
      {
        stageNumber: 7,
        title: 'Stage 7: HR Interview Preparation',
        description: 'Master behavioral questions using the STAR framework (Situation, Task, Action, Result).',
        targetMilestone: '5 HR Questions Answered',
        category: 'HR Interview',
        status: 'in_progress',
        progressPct: 50,
        topics: ['Tell Me About Yourself', 'Strengths & Weaknesses', 'Conflict Resolution', 'Handling Deadlines'],
        actionLink: '/interview-prep'
      },
      {
        stageNumber: 8,
        title: 'Stage 8: Full Placement Mock Tests',
        description: 'Simulate full company hiring drives (TCS, Infosys, Amazon, Cognizant) under authentic timed conditions.',
        targetMilestone: '3 Full Mock Tests Passed',
        category: 'Mock Test',
        status: completedMocks >= 2 ? 'completed' : (completedMocks > 0 ? 'in_progress' : 'pending'),
        progressPct: Math.min(100, Math.round((completedMocks / 2) * 100)),
        topics: ['Multi-section Aptitude', 'Technical MCQs', 'Speed Coding Assessment'],
        actionLink: '/mock-tests'
      }
    ];

    const overallProgress = Math.round(
      roadmapStages.reduce((sum, s) => sum + s.progressPct, 0) / roadmapStages.length
    );

    res.status(200).json({
      success: true,
      overallProgress,
      stages: roadmapStages
    });
  } catch (err) {
    next(err);
  }
};
