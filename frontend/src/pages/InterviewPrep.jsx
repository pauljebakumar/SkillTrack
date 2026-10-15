import React, { useState } from 'react';
import api from '../services/api';
import {
  MessagesSquare,
  Sparkles,
  Send,
  HelpCircle,
  CheckCircle2,
  BookOpen,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function InterviewPrep({ setActivePath }) {
  const [category, setCategory] = useState('Technical');
  const [activeQuestion, setActiveQuestion] = useState(
    'Explain the difference between Process and Thread, and how OS scheduling handles context switching.'
  );
  const [studentAnswer, setStudentAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [evaluating, setEvaluating] = useState(false);

  const sampleQuestions = {
    Technical: [
      'Explain the difference between Process and Thread, and how OS scheduling handles context switching.',
      'What are the ACID properties in DBMS and why is Isolation level crucial in high-concurrency systems?',
      'How does a Hash Table resolve collisions, and what is the difference between Chaining and Open Addressing?',
      'Explain the 3-Way Handshake in TCP and why UDP is preferred for live video streaming.'
    ],
    HR: [
      'Tell me about yourself and walk me through your engineering background.',
      'Describe a challenging bug you encountered in a project and how you solved it (STAR method).',
      'Where do you see yourself in 3 to 5 years, and what are your technical goals?',
      'Describe a situation where you had a disagreement with a team member during a hackathon or group project.'
    ],
    Project: [
      'Walk me through the architecture of your best project. What database did you choose and why?',
      'If your system had to handle 100x traffic tomorrow, where would the primary bottleneck occur?',
      'What was the most difficult design trade-off you made during development?'
    ]
  };

  const handleEvaluate = async () => {
    if (!studentAnswer.trim() || evaluating) return;
    setEvaluating(true);
    setFeedback('');
    try {
      const res = await api.post('/ai/evaluate-interview', {
        category,
        question: activeQuestion,
        answer: studentAnswer
      });
      if (res.data?.success) {
        setFeedback(res.data.feedback);
      }
    } catch (err) {
      console.error('Interview evaluation error:', err);
      setFeedback('Evaluation briefly unavailable. Please review answer against STAR criteria.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <MessagesSquare className="w-6 h-6 text-indigo-500" />
            <span>Campus Placement Interview Coach</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Practice technical, behavioral STAR, and project walkthrough interviews with AI evaluation and model answers.
          </p>
        </div>

        <button
          onClick={() => setActivePath('/ai-coach')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Live AI Interview Simulator</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {['Technical', 'HR', 'Project'].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setActiveQuestion(sampleQuestions[cat][0]);
              setFeedback('');
              setStudentAnswer('');
            }}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              category === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-400'
            }`}
          >
            {cat} Interview Rounds
          </button>
        ))}
      </div>

      {/* Interview Question Selector Carousel */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Select Interview Prompt:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {sampleQuestions[category]?.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveQuestion(q);
                setFeedback('');
                setStudentAnswer('');
              }}
              className={`p-3.5 rounded-2xl border text-left text-xs font-medium transition-all ${
                activeQuestion === q
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
              }`}
            >
              Q: {q}
            </button>
          ))}
        </div>
      </div>

      {/* Answer Formulation Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Current Question</span>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-relaxed">
            {activeQuestion}
          </h2>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Your Response (STAR Method recommended for HR: Situation, Task, Action, Result):</span>
            <span>{studentAnswer.split(/\s+/).filter(Boolean).length} words</span>
          </div>
          <textarea
            rows={6}
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            placeholder="Structure your answer clearly as you would speak to an interviewer..."
            className="w-full p-4 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleEvaluate}
            disabled={evaluating || !studentAnswer.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{evaluating ? 'Analyzing Answer Quality...' : 'Evaluate with AI Interviewer'}</span>
          </button>
        </div>
      </div>

      {/* AI Evaluation Report */}
      {feedback && (
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-indigo-200 dark:border-indigo-900/60 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Interviewer Feedback & Model Answer</span>
          </div>

          <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-sans">
            {feedback}
          </div>
        </div>
      )}
    </div>
  );
}
