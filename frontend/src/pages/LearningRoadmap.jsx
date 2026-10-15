import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Milestone,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Code2,
  Trophy,
  Check
} from 'lucide-react';

export default function LearningRoadmap({ setActivePath }) {
  const [roadmap, setRoadmap] = useState(null);
  const [completedTopicOverrides, setCompletedTopicOverrides] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const res = await api.get('/roadmap');
      if (res.data?.success) {
        setRoadmap(res.data);
      }
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopicCheck = (stageNum, topicName) => {
    const key = `${stageNum}_${topicName}`;
    setCompletedTopicOverrides(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading personalized placement roadmap...</div>;
  }

  const stages = roadmap?.stages || [];
  const overallProgress = roadmap?.overallProgress || 45;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Milestone className="w-6 h-6 text-indigo-500" />
            <span>8-Stage Placement Pathway</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Structured step-by-step roadmap from coding syntax to full mock interviews and product assessments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Pathway Progress</span>
            <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">{overallProgress}% Completed</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>Campus Readiness Journey</span>
          <span>Stage {stages.filter(s => s.status === 'completed').length} of {stages.length} Mastered</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full rounded-full transition-all duration-1000"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* 8 Stages Accordion / Timeline */}
      <div className="space-y-4">
        {stages.map((stage) => {
          const isCompleted = stage.status === 'completed';
          const inProgress = stage.status === 'in_progress';

          return (
            <div
              key={stage.stageNumber}
              className={`p-6 rounded-3xl border transition-all ${
                isCompleted
                  ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-300/60 dark:border-emerald-800/40 shadow-sm'
                  : inProgress
                  ? 'bg-white dark:bg-slate-900 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : inProgress
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : stage.stageNumber}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {stage.title}
                    </h3>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                      Milestone: {stage.targetMilestone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    isCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : inProgress
                      ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {stage.status.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => setActivePath(stage.actionLink)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {stage.description}
              </p>

              {/* Topics Checklist */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Stage Checklist:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {stage.topics?.map((topic) => {
                    const checkKey = `${stage.stageNumber}_${topic}`;
                    const isChecked = isCompleted || completedTopicOverrides[checkKey];

                    return (
                      <div
                        key={topic}
                        onClick={() => toggleTopicCheck(stage.stageNumber, topic)}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={`text-xs ${isChecked ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {topic}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
