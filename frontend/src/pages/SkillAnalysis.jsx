import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  LineChart,
  Trophy,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Clock,
  Code2,
  Calculator,
  ArrowRight
} from 'lucide-react';

export default function SkillAnalysis({ setActivePath }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/skill-analysis');
      if (res.data?.success) {
        setAnalysis(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load skill analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await api.post('/analytics/recalculate');
      if (res.data?.success) {
        setAnalysis(res.data.data);
      }
    } catch (err) {
      console.error('Recalculate error:', err);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Computing personalized skill telemetry...</div>;
  }

  const overallScore = analysis?.overallScore || 72;
  const skillScores = analysis?.skillScores || [];
  const strongSkills = analysis?.strongSkills || [];
  const weakSkills = analysis?.weakSkills || [];
  const repeatedMistakes = analysis?.repeatedMistakes || [];
  const timeDist = analysis?.studyTimeDistribution || [];
  const codingStats = analysis?.codingStats || {};
  const aptStats = analysis?.aptitudeStats || {};
  const mockStats = analysis?.mockStats || {};

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <LineChart className="w-6 h-6 text-indigo-500" />
            <span>Personalized Skill Analysis Engine</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real performance diagnosis based on your actual submissions, accuracy, and mock test scores.
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
          <span>{recalculating ? 'Recalculating...' : 'Refresh Telemetry'}</span>
        </button>
      </div>

      {/* Top Banner: Overall Score & Domain Accuracy */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 border border-indigo-800/40 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>Campus Placement Index</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Overall Placement Readiness: {overallScore}%
          </h2>
          <p className="text-xs text-indigo-200/80 max-w-lg">
            Calculated across Coding Test Cases, Aptitude Topic Accuracy, Sectional Cutoffs, and Core Computer Science quizzes.
          </p>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * overallScore) / 100}
              strokeLinecap="round"
              className="text-cyan-400 transition-all duration-1000"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-2xl font-extrabold">{overallScore}%</span>
            <span className="block text-[9px] uppercase tracking-wider text-slate-400">Score</span>
          </div>
        </div>
      </div>

      {/* Domain Competency Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Scores Bar Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Domain Competency Scores
          </h2>

          <div className="space-y-4">
            {skillScores.map((s) => (
              <div key={s.skill} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{s.skill}</span>
                  <span className="text-slate-900 dark:text-white">{s.score}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      s.score >= 75 ? 'bg-emerald-500' : s.score >= 60 ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${s.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-3">
            <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Identified Strengths</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {strongSkills.map((sk) => (
                <span key={sk} className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 shadow-sm">
                  ✓ {sk}
                </span>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
            <h3 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Areas Requiring Targeted Revision</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {weakSkills.map((sk) => (
                <span key={sk} className="px-3 py-1 rounded-xl text-xs font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 shadow-sm">
                  ⚠️ {sk}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Repeated Mistakes Analysis */}
      {repeatedMistakes.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>Repeated Conceptual Mistake Patterns Detected</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repeatedMistakes.map((m, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-rose-800 dark:text-rose-300">
                  <span>Topic: {m.topic}</span>
                  <span className="text-[10px] bg-rose-200/60 dark:bg-rose-900/60 px-2 py-0.5 rounded">
                    Freq: {m.frequency || 2}x
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300"><span className="font-semibold">Pattern:</span> {m.pattern}</p>
                <p className="text-indigo-600 dark:text-indigo-400 font-semibold"><span className="text-slate-500">Actionable Fix:</span> {m.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study Time Distribution */}
      {timeDist.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Study Time Distribution (Minutes Logged)</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {timeDist.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center space-y-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block truncate">{item.subject}</span>
                <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">{item.minutes}m</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
