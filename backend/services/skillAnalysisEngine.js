const { isConnected } = require('../config/db');
const CodingSubmission = require('../models/CodingSubmission');
const QuizAttempt = require('../models/QuizAttempt');
const MockTestAttempt = require('../models/MockTestAttempt');
const LearningProgress = require('../models/LearningProgress');
const SkillAnalysis = require('../models/SkillAnalysis');
const memoryStore = require('../config/memoryStore');

class SkillAnalysisEngine {
  async calculateForUser(userId) {
    let submissions = [];
    let quizAttempts = [];
    let mockAttempts = [];
    let progress = [];

    if (isConnected()) {
      submissions = await CodingSubmission.find({ user: userId }).populate('question');
      quizAttempts = await QuizAttempt.find({ user: userId });
      mockAttempts = await MockTestAttempt.find({ user: userId });
      progress = await LearningProgress.find({ user: userId });
    } else {
      submissions = memoryStore.find('codingsubmissions', { user: userId });
      quizAttempts = memoryStore.find('quizattempts', { user: userId });
      mockAttempts = memoryStore.find('mocktestattempts', { user: userId });
      progress = memoryStore.find('learningprogresses', { user: userId });
    }

    // 1. Coding stats
    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter(s => s.status === 'Accepted');
    const uniqueSolvedProblems = new Set(acceptedSubmissions.map(s => String(s.question?._id || s.question)));
    const solvedCount = uniqueSolvedProblems.size;
    const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions.length / totalSubmissions) * 100) : 0;

    // Language frequency
    const langCounts = {};
    submissions.forEach(s => {
      langCounts[s.language] = (langCounts[s.language] || 0) + 1;
    });
    let preferredLanguage = 'python';
    let maxLangCount = 0;
    for (const [lang, count] of Object.entries(langCounts)) {
      if (count > maxLangCount) {
        maxLangCount = count;
        preferredLanguage = lang;
      }
    }

    // 2. Aptitude stats
    const totalQuizzes = quizAttempts.length;
    let totalQuestionsAttempted = 0;
    let totalCorrectAnswers = 0;
    const topicScores = {};

    quizAttempts.forEach(qa => {
      totalQuestionsAttempted += qa.totalQuestions || 0;
      totalCorrectAnswers += qa.correctAnswersCount || 0;

      const topicKey = qa.topic || 'General Aptitude';
      if (!topicScores[topicKey]) {
        topicScores[topicKey] = { correct: 0, total: 0, category: qa.category || 'Aptitude' };
      }
      topicScores[topicKey].correct += qa.correctAnswersCount || 0;
      topicScores[topicKey].total += qa.totalQuestions || 0;
    });

    const averageAccuracy = totalQuestionsAttempted > 0
      ? Math.round((totalCorrectAnswers / totalQuestionsAttempted) * 100)
      : (totalQuizzes > 0 ? 70 : 0);

    // 3. Mock test stats
    const testsTaken = mockAttempts.length;
    const completedMocks = mockAttempts.filter(m => m.status === 'completed');
    const totalMockPct = completedMocks.reduce((acc, m) => acc + (m.percentage || 0), 0);
    const averagePercentage = completedMocks.length > 0 ? Math.round(totalMockPct / completedMocks.length) : 0;

    // 4. Calculate skill scores across core domains
    const domainScores = [
      {
        skill: 'Quantitative Aptitude',
        category: 'Aptitude',
        accuracy: topicScores['Quantitative Aptitude'] ? Math.round((topicScores['Quantitative Aptitude'].correct / topicScores['Quantitative Aptitude'].total) * 100) : 65,
        totalAttempted: topicScores['Quantitative Aptitude']?.total || 10,
        totalSolved: topicScores['Quantitative Aptitude']?.correct || 6
      },
      {
        skill: 'Logical Reasoning',
        category: 'Aptitude',
        accuracy: topicScores['Logical Reasoning'] ? Math.round((topicScores['Logical Reasoning'].correct / topicScores['Logical Reasoning'].total) * 100) : 75,
        totalAttempted: topicScores['Logical Reasoning']?.total || 10,
        totalSolved: topicScores['Logical Reasoning']?.correct || 7
      },
      {
        skill: 'Verbal Ability',
        category: 'Aptitude',
        accuracy: topicScores['Verbal Ability'] ? Math.round((topicScores['Verbal Ability'].correct / topicScores['Verbal Ability'].total) * 100) : 70,
        totalAttempted: topicScores['Verbal Ability']?.total || 8,
        totalSolved: topicScores['Verbal Ability']?.correct || 6
      },
      {
        skill: 'Data Structures & Algorithms',
        category: 'Programming',
        accuracy: acceptanceRate || 68,
        totalAttempted: totalSubmissions || 12,
        totalSolved: solvedCount || 8
      },
      {
        skill: 'Core CS (DBMS & OS)',
        category: 'Core CS',
        accuracy: topicScores['DBMS & OS'] ? Math.round((topicScores['DBMS & OS'].correct / topicScores['DBMS & OS'].total) * 100) : 60,
        totalAttempted: 15,
        totalSolved: 9
      }
    ];

    const skillScores = domainScores.map(d => {
      const score = Math.min(100, Math.max(0, d.accuracy));
      let status = 'moderate';
      if (score >= 75) status = 'strong';
      else if (score < 55) status = 'weak';

      return {
        ...d,
        score,
        status
      };
    });

    // 5. Strong & Weak skills
    const strongSkills = skillScores.filter(s => s.status === 'strong').map(s => s.skill);
    const weakSkills = skillScores.filter(s => s.status === 'weak').map(s => s.skill);

    // Default fallbacks if brand new user
    if (strongSkills.length === 0) strongSkills.push('Problem Understanding', 'Syntax Fundamentals');
    if (weakSkills.length === 0) weakSkills.push('Dynamic Programming', 'Time & Distance Calculations');

    // 6. Overall readiness score (0-100)
    const overallScore = Math.round(
      (skillScores.reduce((sum, s) => sum + s.score, 0) / skillScores.length)
    );

    // 7. Dynamic Recommendations
    const recommendations = [];
    if (acceptanceRate < 60 && totalSubmissions > 0) {
      recommendations.push({
        title: 'Review Edge Cases in Coding Questions',
        description: 'Noticeable Wrong Answer submissions detected. Practice writing edge-case tests (empty arrays, boundary limits) before final submission.',
        priority: 'high',
        category: 'Programming',
        actionLink: '/coding'
      });
    }

    if (averageAccuracy < 70 && totalQuizzes > 0) {
      recommendations.push({
        title: 'Reinforce Aptitude Formulas',
        description: 'Spend 20 minutes daily reviewing quick formulas in Time & Work and Permutations.',
        priority: 'high',
        category: 'Aptitude',
        actionLink: '/study'
      });
    }

    recommendations.push({
      title: 'Attempt Weekly Full Placement Mock Test',
      description: 'Simulate high-pressure exam conditions with timed 45-minute multi-section tests.',
      priority: 'medium',
      category: 'Mock Test',
      actionLink: '/mock-tests'
    });

    recommendations.push({
      title: 'Practice HR STAR-Method Answers',
      description: 'Engage with the AI Interview Coach to refine your answers for behavioral rounds.',
      priority: 'medium',
      category: 'Interview',
      actionLink: '/interview-prep'
    });

    // 8. Repeated mistakes analysis
    const repeatedMistakes = [];
    const wrongAnswers = submissions.filter(s => s.status === 'Wrong Answer');
    if (wrongAnswers.length > 2) {
      repeatedMistakes.push({
        topic: 'Boundary Conditions',
        pattern: 'Off-by-one errors or unhandled empty inputs',
        suggestion: 'Trace your loops with N=0 and N=1 on scratch paper.',
        frequency: wrongAnswers.length
      });
    }
    const runtimeErrors = submissions.filter(s => s.status === 'Runtime Error');
    if (runtimeErrors.length > 1) {
      repeatedMistakes.push({
        topic: 'Type and Null Pointers',
        pattern: 'Accessing properties of undefined or null elements',
        suggestion: 'Include explicit guards or optional chaining checks.',
        frequency: runtimeErrors.length
      });
    }
    if (repeatedMistakes.length === 0) {
      repeatedMistakes.push({
        topic: 'Aptitude Time Management',
        pattern: 'Spending > 2.5 minutes on complex arithmetic calculations',
        suggestion: 'Use digital root approximations and option-elimination tactics.',
        frequency: 2
      });
    }

    // 9. Study time distribution
    const studyTimeDistribution = [
      { subject: 'Data Structures', minutes: 180 },
      { subject: 'Quantitative Aptitude', minutes: 120 },
      { subject: 'Logical Reasoning', minutes: 90 },
      { subject: 'Core CS (DBMS/OS)', minutes: 75 },
      { subject: 'Mock Tests & Interviews', minutes: 60 }
    ];

    const analysisData = {
      user: userId,
      overallScore,
      skillScores,
      strongSkills,
      weakSkills,
      recommendations,
      repeatedMistakes,
      studyTimeDistribution,
      codingStats: {
        solvedCount,
        totalSubmissions,
        acceptanceRate,
        preferredLanguage
      },
      aptitudeStats: {
        attemptedCount: totalQuestionsAttempted,
        averageAccuracy
      },
      mockStats: {
        testsTaken,
        averagePercentage
      },
      lastCalculatedAt: new Date()
    };

    // Save or update
    if (isConnected()) {
      await SkillAnalysis.findOneAndUpdate(
        { user: userId },
        analysisData,
        { upsert: true, new: true }
      );
    } else {
      const existing = memoryStore.findOne('skillanalyses', { user: userId });
      if (existing) {
        memoryStore.updateOne('skillanalyses', { user: userId }, analysisData);
      } else {
        memoryStore.insertOne('skillanalyses', analysisData);
      }
    }

    return analysisData;
  }
}

const skillAnalysisEngine = new SkillAnalysisEngine();
module.exports = skillAnalysisEngine;
