import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Calculator,
  Timer,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Trophy
} from 'lucide-react';

export default function AptitudePractice({ setActivePath }) {
  const [questions, setQuestions] = useState([]);
  const [subject, setSubject] = useState('Quantitative Aptitude');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [subject]);

  useEffect(() => {
    let timer;
    if (!isSubmitted && !loading && questions.length > 0) {
      timer = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSubmitted, loading, questions.length]);

  const fetchQuestions = async () => {
    setLoading(true);
    setIsSubmitted(false);
    setSelectedAnswers({});
    setResult(null);
    setCurrentIdx(0);
    setSecondsElapsed(0);
    try {
      const res = await api.get('/aptitude/questions', { params: { subject } });
      if (res.data?.success) {
        setQuestions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load aptitude questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optId) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIdx]: optId
    }));
  };

  const handleSubmitTest = async () => {
    setIsSubmitted(true);
    const answersPayload = questions.map((q, idx) => ({
      questionId: q._id,
      selectedOption: selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : null,
      timeSpentSeconds: Math.round(secondsElapsed / (questions.length || 1))
    }));

    try {
      const res = await api.post('/aptitude/submit', {
        category: 'Aptitude Practice',
        topic: subject,
        answers: answersPayload,
        timeSpentTotalSeconds: secondsElapsed
      });
      if (res.data?.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      console.error('Submit quiz error:', err);
    }
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header & Subject Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Calculator className="w-6 h-6 text-amber-500" />
            <span>Aptitude Practice Module</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Topic-wise practice, instant score feedback, formulas, and step-by-step math solutions.
          </p>
        </div>

        {/* Live Timer */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
          <Timer className="w-4 h-4 text-indigo-500" />
          <span>{formatTimer(secondsElapsed)}</span>
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
        {[
          'Quantitative Aptitude',
          'Logical Reasoning',
          'Verbal Ability',
          'Data Interpretation'
        ].map((sub) => (
          <button
            key={sub}
            onClick={() => setSubject(sub)}
            className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
              subject === sub
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-amber-400'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading aptitude questions...</div>
      ) : questions.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400">No questions found for this category.</div>
      ) : isSubmitted && result ? (
        /* Results View */
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-indigo-500/10 to-transparent border border-amber-300/40 dark:border-amber-700/40 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Practice Attempt Complete!</h2>
              <p className="text-xs text-slate-500 mt-1">
                You scored <span className="font-bold text-amber-500">{result.score}</span> out of {result.totalQuestions} ({result.accuracy}% Accuracy) in {formatTimer(secondsElapsed)}
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={fetchQuestions}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md shadow-amber-500/20 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Practice Again</span>
              </button>
              <button
                onClick={() => setActivePath('/skill-analysis')}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                View Skill Analysis
              </button>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Review Detailed Answers & Explanations:</h3>
            {result.answers?.map((ans, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border text-xs space-y-2.5 ${
                  ans.isCorrect
                    ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                    : 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {idx + 1}. {ans.questionText}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    ans.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {ans.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                {ans.explanation && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    💡 <span className="font-semibold text-slate-900 dark:text-white">Explanation:</span> {ans.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Test Active View */
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* Question Index Progress */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              Topic: {currentQ?.topic}
            </span>
          </div>

          {/* Question Text */}
          <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
            {currentQ?.questionText}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3">
            {currentQ?.options?.map((opt) => {
              const isSelected = selectedAnswers[currentIdx] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
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

          {/* Question Navigation Controls */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitTest}
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Submit & View Score</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
