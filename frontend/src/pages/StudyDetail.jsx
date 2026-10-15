import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Code2,
  Save,
  MessageSquare
} from 'lucide-react';

export default function StudyDetail({ studyId, setActivePath }) {
  const [material, setMaterial] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studyId) {
      fetchStudyDetail();
    }
  }, [studyId]);

  const fetchStudyDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/study/${studyId}`);
      if (res.data?.success) {
        setMaterial(res.data.data);
        setProgress(res.data.progress);
        setIsBookmarked(res.data.isBookmarked);
        setNoteContent(res.data.progress?.personalNotes || '');
      }
    } catch (err) {
      console.error('Failed to load study details:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async () => {
    if (!material) return;
    try {
      const res = await api.post(`/study/${material._id}/bookmark`);
      if (res.data?.success) {
        setIsBookmarked(res.data.isBookmarked);
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const markCompleted = async () => {
    if (!material) return;
    try {
      const res = await api.post(`/study/${material._id}/progress`, {
        status: 'completed',
        progressPercentage: 100,
        personalNotes: noteContent
      });
      if (res.data?.success) {
        setProgress(res.data.data);
      }
    } catch (err) {
      console.error('Progress error:', err);
    }
  };

  const handleSaveNote = async () => {
    if (!material) return;
    try {
      await api.post(`/study/${material._id}/progress`, {
        status: progress?.status || 'in_progress',
        personalNotes: noteContent
      });
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  const handleOptionSelect = (qIdx, optIdx) => {
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading topic material and interactive exercises...
      </div>
    );
  }

  if (!material) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-sm text-slate-400">Study material not found.</p>
        <button
          onClick={() => setActivePath('/study')}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Back to Materials
        </button>
      </div>
    );
  }

  const { content, quizzes = [] } = material;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActivePath('/study')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Materials</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-xl border transition-all ${
              isBookmarked
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-500'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark this topic"}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={markCompleted}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              progress?.status === 'completed'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-300 dark:border-emerald-700'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{progress?.status === 'completed' ? 'Completed' : 'Mark as Completed'}</span>
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {material.subject}
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-xs text-slate-500">{material.difficulty}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {material.estimatedReadTimeMinutes || 15} mins read
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {material.title}
        </h1>
      </div>

      {/* Concept Notes Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Concept Explanation</h2>
        <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {content?.notes}
        </div>
      </div>

      {/* Important Formulas / Rules */}
      {content?.formulas && content.formulas.length > 0 && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/5 via-cyan-500/5 to-transparent border border-indigo-200/60 dark:border-indigo-800/40 space-y-3">
          <h2 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Important Placement Formulas & Invariants</span>
          </h2>
          <ul className="space-y-2">
            {content.formulas.map((f, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sample Programs with Code & Expected Output */}
      {content?.samplePrograms && content.samplePrograms.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-500" />
            <span>Sample Program & Expected Output</span>
          </h2>
          {content.samplePrograms.map((prog, idx) => (
            <div key={idx} className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#0d1117]">
              <div className="px-4 py-2.5 bg-slate-800/70 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold">{prog.title}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-700 text-indigo-300">
                  {prog.language}
                </span>
              </div>
              <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto">
                <code>{prog.code}</code>
              </pre>
              {prog.expectedOutput && (
                <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-[11px] font-mono text-slate-300">
                  <span className="text-slate-500 block mb-1">Expected Output:</span>
                  <div className="text-slate-200">{prog.expectedOutput}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Common Errors & Debugging */}
      {content?.commonErrors && content.commonErrors.length > 0 && (
        <div className="p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-3">
          <h2 className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Common Interview Traps & Debugging Explanations</span>
          </h2>
          {content.commonErrors.map((err, idx) => (
            <div key={idx} className="text-xs space-y-1">
              <p className="font-semibold text-rose-600 dark:text-rose-400">❌ Error: {err.error}</p>
              <p className="text-slate-600 dark:text-slate-300">{err.explanation}</p>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">✓ Fix: {err.fix}</p>
            </div>
          ))}
        </div>
      )}

      {/* Step-by-Step Solved Examples */}
      {content?.solvedExamples && content.solvedExamples.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Step-by-Step Solved Examples</h2>
          {content.solvedExamples.map((ex, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Example {idx + 1}: {ex.problem}
              </h3>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-mono">
                {ex.stepByStepSolution}
              </div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Answer: {ex.answer}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Placement Interview Questions */}
      {content?.interviewQuestions && content.interviewQuestions.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <span>Placement Interview Q&A</span>
          </h2>
          {content.interviewQuestions.map((iq, idx) => (
            <div key={idx} className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0 pb-3 last:pb-0">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Q: {iq.question}</h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Model Answer: {iq.answer}</p>
              {iq.explanation && <p className="text-[11px] text-slate-500">{iq.explanation}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Interactive Practice Quiz */}
      {quizzes.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-500" />
              <span>Concept Check Quiz</span>
            </h2>
            <button
              onClick={() => setShowQuizResults(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              Check Answers
            </button>
          </div>

          <div className="space-y-6">
            {quizzes.map((q, qIdx) => (
              <div key={qIdx} className="space-y-3">
                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                  {qIdx + 1}. {q.question}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[qIdx] === optIdx;
                    const isCorrect = q.correctAnswer === optIdx;

                    let btnClass = 'border-slate-200 dark:border-slate-800 hover:border-indigo-400';
                    if (showQuizResults) {
                      if (isCorrect) {
                        btnClass = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold';
                      } else if (isSelected && !isCorrect) {
                        btnClass = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 font-semibold';
                      }
                    } else if (isSelected) {
                      btnClass = 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleOptionSelect(qIdx, optIdx)}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${btnClass}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {showQuizResults && q.explanation && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg">
                    💡 <span className="font-semibold">Explanation:</span> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal Notes Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Save className="w-4 h-4 text-indigo-500" />
            <span>My Personal Key Takeaways & Notes</span>
          </h2>
          {noteSaved && <span className="text-xs text-emerald-500 font-semibold">Saved!</span>}
        </div>

        <textarea
          rows={3}
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Jot down your personal shortcuts, reminders, or tricky points about this topic..."
          className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={handleSaveNote}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
        >
          Save Note
        </button>
      </div>
    </div>
  );
}
