import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  FileCheck2,
  Clock,
  Trophy,
  Play,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function MockTests({ setActivePath, setSelectedMockTestId }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/mock-tests');
      if (res.data?.success) {
        setTests(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load mock tests:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-purple-500" />
            <span>Placement Mock Assessments</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulate realistic campus recruitment tests under authentic exam timing with sectional analysis.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold">
          Auto-Evaluated with Negative Marking
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading placement tests...</div>
      ) : tests.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400">No mock tests available right now.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tests.map((test) => {
            const hasAttempted = Boolean(test.lastAttempt);
            const passed = test.lastAttempt?.passed;

            return (
              <div
                key={test._id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5 glow-card"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                      {test.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {test.durationMinutes} mins
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {test.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    {test.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Total Marks</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{test.totalMarks}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Passing</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{test.passingMarks}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Questions</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{test.questionCount}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {hasAttempted ? (
                    <div className="text-xs">
                      <span className="text-slate-400 block text-[10px]">Previous Score:</span>
                      <span className={`font-bold ${passed ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {test.lastAttempt.scoreObtained}/{test.totalMarks} ({test.lastAttempt.percentage}%) - {passed ? 'Passed' : 'Needs Practice'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Not attempted yet</span>
                  )}

                  <button
                    onClick={() => {
                      setSelectedMockTestId(test._id);
                      setActivePath('/mock-test-take');
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/25 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{hasAttempted ? 'Retake Test' : 'Start Mock Test'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
