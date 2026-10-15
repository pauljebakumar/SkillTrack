import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Flag,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Trophy,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export default function MockTestTake({ testId, setActivePath }) {
  const [test, setTest] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [index]: selectedOptionId }
  const [markedForReview, setMarkedForReview] = useState({}); // { [index]: boolean }
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(45 * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (testId) {
      fetchTest();
    }
  }, [testId]);

  useEffect(() => {
    let timer;
    if (!isSubmitted && !loading && timeLeftSeconds > 0) {
      timer = setInterval(() => {
        setTimeLeftSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSubmitted, loading, timeLeftSeconds]);

  const fetchTest = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/mock-tests/${testId}`);
      if (res.data?.success) {
        setTest(res.data.data);
        setTimeLeftSeconds((res.data.data.durationMinutes || 45) * 60);
      }
    } catch (err) {
      console.error('Failed to load test:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optId) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [currentIdx]: optId }));
  };

  const toggleMarkForReview = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [currentIdx]: !prev[currentIdx]
    }));
  };

  const handleAutoSubmit = () => {
    handleSubmit(true);
  };

  const handleSubmit = async (isAuto = false) => {
    if (!test || isSubmitted) return;
    setIsSubmitted(true);

    const questions = test.questions || [];
    const responsesPayload = questions.map((q, idx) => ({
      questionIndex: idx,
      selectedAnswer: answers[idx] !== undefined ? answers[idx] : null,
      markedForReview: Boolean(markedForReview[idx]),
      timeSpentSeconds: 30
    }));

    const totalDurationSeconds = (test.durationMinutes || 45) * 60;
    const timeSpent = Math.max(10, totalDurationSeconds - timeLeftSeconds);

    try {
      const res = await api.post(`/mock-tests/${test._id}/submit`, {
        responses: responsesPayload,
        timeSpentSeconds: timeSpent
      });

      if (res.data?.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      console.error('Mock test submit error:', err);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading placement assessment...</div>;
  }

  if (!test) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-sm text-slate-400">Assessment not found.</p>
        <button onClick={() => setActivePath('/mock-tests')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
          Back to Tests
        </button>
      </div>
    );
  }

  const questions = test.questions || [];
  const currentQ = questions[currentIdx];

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Test Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePath('/mock-tests')}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              {test.title}
            </h1>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{test.category}</span>
          </div>
        </div>

        {!isSubmitted && (
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold border ${
              timeLeftSeconds < 300
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-300 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}>
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>

            <button
              onClick={() => handleSubmit(false)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
            >
              Submit Assessment
            </button>
          </div>
        )}
      </div>

      {isSubmitted && result ? (
        /* Detailed Assessment Report */
        <div className="max-w-4xl mx-auto space-y-6">
          <div className={`p-8 rounded-3xl border text-center space-y-4 shadow-xl ${
            result.passed
              ? 'bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-transparent border-emerald-500/30'
              : 'bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-transparent border-amber-500/30'
          }`}>
            <div className={`w-14 h-14 mx-auto rounded-3xl flex items-center justify-center text-white shadow-lg ${
              result.passed ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-amber-500 shadow-amber-500/30'
            }`}>
              <Trophy className="w-7 h-7" />
            </div>

            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                result.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {result.passed ? 'Placement Cutoff Passed' : 'Needs Preparation to Clear Cutoff'}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                Score: {result.scoreObtained} / {result.totalMarks} ({result.percentage}%)
              </h2>
            </div>

            {/* Section Wise Breakdown */}
            {result.sectionWiseScores && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-2">
                {result.sectionWiseScores.map((sec, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400 block truncate font-semibold">{sec.section}</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{sec.score}/{sec.maxScore}</span>
                    <span className="text-[10px] text-indigo-500 block font-semibold">{sec.accuracy}% accuracy</span>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-left text-xs max-w-xl mx-auto space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Personalized Recommendations:</span>
              </span>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                {result.recommendations?.map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setAnswers({});
                  setMarkedForReview({});
                  fetchTest();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Test</span>
              </button>
              <button
                onClick={() => setActivePath('/mock-tests')}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Back to Tests
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Test Taking Split Screen */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question Display (8/12) */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                Section: {currentQ?.section || 'General'}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-slate-400">Marks: +{currentQ?.marks || 1} / -{currentQ?.negativeMarks || 0.25}</span>
                <button
                  onClick={toggleMarkForReview}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    markedForReview[currentIdx]
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{markedForReview[currentIdx] ? 'Marked' : 'Mark for Review'}</span>
                </button>
              </div>
            </div>

            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
              Q{currentIdx + 1}. {currentQ?.questionText}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {currentQ?.options?.map((opt) => {
                const isSelected = answers[currentIdx] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span>{opt.text}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIdx === questions.length - 1}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-40"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Palette (4/12) */}
          <div className="lg:col-span-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Question Palette
            </h3>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-indigo-600" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-500" />
                <span>Marked for Review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800" />
                <span>Unvisited</span>
              </div>
            </div>

            {/* Grid of Question Numbers */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {questions.map((_, idx) => {
                const isAnswered = answers[idx] !== undefined;
                const isMarked = markedForReview[idx];
                const isCurrent = currentIdx === idx;

                let pillClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
                if (isCurrent) {
                  pillClass = 'ring-2 ring-indigo-500 font-bold';
                }
                if (isMarked) {
                  pillClass += ' bg-amber-500 text-white border-amber-500';
                } else if (isAnswered) {
                  pillClass += ' bg-indigo-600 text-white border-indigo-600';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-9 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all ${pillClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
