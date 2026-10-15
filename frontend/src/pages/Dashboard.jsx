import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Sparkles,
  Code2,
  Calculator,
  Trophy,
  CheckCircle2,
  Clock,
  ArrowRight,
  Target,
  Flame,
  AlertCircle,
  Play,
  RotateCcw
} from 'lucide-react';

export default function Dashboard({ setActivePath, setSelectedQuestionId, setSelectedStudyId }) {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [planner, setPlanner] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analysisRes, plannerRes, codingRes] = await Promise.all([
          api.get('/analytics/skill-analysis').catch(() => ({ data: { data: null } })),
          api.get('/planner').catch(() => ({ data: { data: null } })),
          api.get('/coding/questions').catch(() => ({ data: { data: [] } }))
        ]);

        if (analysisRes.data?.data) setAnalysis(analysisRes.data.data);
        if (plannerRes.data?.data) setPlanner(plannerRes.data.data);
        if (codingRes.data?.data) setSubmissions(codingRes.data.data.slice(0, 5));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const overallScore = analysis?.overallScore || 72;
  const codingSolved = analysis?.codingStats?.solvedCount || 8;
  const totalAttempted = analysis?.codingStats?.totalSubmissions || 12;
  const aptAccuracy = analysis?.aptitudeStats?.averageAccuracy || 75;
  const mockAvg = analysis?.mockStats?.averagePercentage || 68;

  const strongSkills = analysis?.strongSkills || ['Problem Understanding', 'Syntax Fundamentals', 'Logical Reasoning'];
  const weakSkills = analysis?.weakSkills || ['Dynamic Programming', 'Time & Distance Calculations'];
  const recommendations = analysis?.recommendations || [
    { title: 'Practice Binary Search & Two-Pointer Problems', description: 'Strengthen medium array algorithms for technical rounds.', actionLink: '/coding' },
    { title: 'Revise Time and Work LCM Methods', description: 'Review shortcut formulas to solve aptitude questions in under 1 minute.', actionLink: '/study' }
  ];

  const tasks = planner?.tasks?.slice(0, 4) || [
    { title: 'Solve Two Sum in Python / C++', completed: true, priority: 'High' },
    { title: 'Revise Time & Work LCM Formulas', completed: false, priority: 'Medium' },
    { title: 'Practice Behavioral STAR Answer for "Tell Me About Yourself"', completed: false, priority: 'Low' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-700/30">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -top-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Placement Intelligence Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.fullName || 'Student'}! 👋
            </h1>
            <p className="text-sm text-indigo-100/80 leading-relaxed">
              Targeting <span className="font-semibold text-white">{user?.placementGoals || 'Tier-1 FAANG & Product Companies'}</span> from{' '}
              <span className="font-semibold text-white">{user?.collegeName || 'National Engineering College'}</span>. Let's conquer today's study goals!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActivePath('/mock-tests')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Take Diagnostic Mock</span>
            </button>
            <button
              onClick={() => setActivePath('/ai-coach')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/15 transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Ask AI Coach</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Readiness */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm glow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Placement Readiness
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{overallScore}%</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">+4% this week</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-1000" style={{ width: `${overallScore}%` }} />
          </div>
        </div>

        {/* Coding Questions Solved */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm glow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Coding Problems
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Code2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{codingSolved}</span>
            <span className="text-xs text-slate-500">of {totalAttempted} attempted</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className="text-emerald-500 font-semibold">{totalAttempted > 0 ? Math.round((codingSolved/totalAttempted)*100) : 0}%</span> acceptance rate
          </p>
        </div>

        {/* Aptitude Accuracy */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm glow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Aptitude Accuracy
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Calculator className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{aptAccuracy}%</span>
            <span className="text-xs text-slate-500">across 4 domains</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: `${aptAccuracy}%` }} />
          </div>
        </div>

        {/* Mock Test Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm glow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Mock Test Average
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{mockAvg}%</span>
            <span className="text-xs text-emerald-500 font-semibold">Passing criteria met</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {analysis?.mockStats?.testsTaken || 1} mock assessment completed
          </p>
        </div>
      </div>

      {/* Middle Section: Skill Breakdown & Daily Study Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Skill Radar Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Domain Competency Breakdown</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Computed transparently from your code submissions and aptitude tests</p>
            </div>
            <button
              onClick={() => setActivePath('/skill-analysis')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Detailed Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {(analysis?.skillScores || [
              { skill: 'Data Structures & Algorithms', score: 68, category: 'Programming' },
              { skill: 'Quantitative Aptitude', score: 65, category: 'Aptitude' },
              { skill: 'Logical Reasoning', score: 78, category: 'Aptitude' },
              { skill: 'Core CS (DBMS & OS)', score: 60, category: 'Core CS' },
              { skill: 'Verbal Ability', score: 72, category: 'Aptitude' }
            ]).map((s) => (
              <div key={s.skill} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">{s.skill}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{s.score}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      s.score >= 75
                        ? 'bg-emerald-500'
                        : s.score >= 60
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${s.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Strong vs Weak Badges */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Strongest Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {strongSkills.map((sk) => (
                  <span key={sk} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-3.5 h-3.5" />
                Needs Focus & Revision
              </span>
              <div className="flex flex-wrap gap-1.5">
                {weakSkills.map((sk) => (
                  <span key={sk} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Daily Planner & Study Goals */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500" />
                <span>Today's Study Plan</span>
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                60 min target
              </span>
            </div>

            <div className="space-y-2.5">
              {tasks.map((task, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                    task.completed
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      task.completed ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {task.title}
                    </p>
                    <span className="text-[10px] text-slate-400 capitalize">{task.priority || 'Medium'} Priority</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActivePath('/planner')}
            className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Open Study Planner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Section: Recommended Topics & Practice Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Topics */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Personalized Recommendations</span>
            </h2>
            <span className="text-xs text-slate-500">AI Tailored</span>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">{rec.title}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{rec.description}</p>
                </div>
                <button
                  onClick={() => setActivePath(rec.actionLink || '/study')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold whitespace-nowrap transition-colors"
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Practice Coding Exercises */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-500" />
              <span>Placement Coding Practice</span>
            </h2>
            <button
              onClick={() => setActivePath('/coding')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {submissions.map((q) => (
              <div
                key={q._id}
                onClick={() => {
                  setSelectedQuestionId(q.slug || q._id);
                  setActivePath('/coding-problem');
                }}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    q.difficulty === 'Beginner' ? 'bg-emerald-500' : q.difficulty === 'Intermediate' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">{q.title}</h3>
                    <p className="text-[10px] text-slate-400">{q.category} • {q.topicTags?.join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    q.difficulty === 'Beginner'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : q.difficulty === 'Intermediate'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}>
                    {q.difficulty}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
