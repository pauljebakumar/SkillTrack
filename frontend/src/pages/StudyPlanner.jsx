import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  CalendarCheck,
  CheckCircle2,
  Plus,
  Trash2,
  Clock,
  Target,
  ArrowRight,
  Flame,
  AlertCircle
} from 'lucide-react';

export default function StudyPlanner() {
  const [plan, setPlan] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('Data Structures');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await api.get('/planner');
      if (res.data?.success) {
        setPlan(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load study plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      const res = await api.patch(`/planner/tasks/${taskId}/toggle`);
      if (res.data?.success) {
        setPlan(res.data.data);
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await api.delete(`/planner/tasks/${taskId}`);
      if (res.data?.success) {
        setPlan(res.data.data);
      }
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await api.post('/planner/tasks', {
        title: newTaskTitle,
        subject: newTaskSubject,
        priority: newTaskPriority
      });
      if (res.data?.success) {
        setPlan(res.data.data);
        setNewTaskTitle('');
        setShowAddModal(false);
      }
    } catch (err) {
      console.error('Add task error:', err);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading daily study planner...</div>;
  }

  const tasks = plan?.tasks || [];
  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-indigo-500" />
            <span>Placement Study Planner</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize daily tasks, track completion streaks, and conquer your weekly placement milestones.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Study Task</span>
        </button>
      </div>

      {/* Progress & Milestone Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Daily Goal Completion</span>
            <Target className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {completedCount} / {tasks.length} Done
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Target Daily Time</span>
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {plan?.dailyTargetMinutes || 60} mins
          </div>
          <p className="text-[11px] text-slate-400">Paced for campus recruitment schedules</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-500" />
            <span>Weekly Milestone</span>
          </span>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
            {plan?.weeklyMilestone || 'Solve 10 Coding Exercises & 1 Mock Assessment'}
          </p>
        </div>
      </div>

      {/* Task List */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Actionable Tasks Checklist
        </h2>

        {tasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No active tasks. Click "Add Study Task" above to plan your day!
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task._id}
                className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between transition-all ${
                  task.completed
                    ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 shadow-sm'
                }`}
              >
                <div
                  onClick={() => handleToggleTask(task._id)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <CheckCircle2
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      task.completed ? 'text-emerald-500 fill-current' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                  <div className="truncate">
                    <p className={`font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {task.title}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      Subject: {task.subject} • {task.priority} Priority
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Study Task</h3>

            <form onSubmit={handleAddTask} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Task Title:</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Solve 3 Binary Search Problems in Python"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Subject / Domain:</label>
                <select
                  value={newTaskSubject}
                  onChange={(e) => setNewTaskSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                  <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                  <option value="Logical Reasoning">Logical Reasoning</option>
                  <option value="Core CS (DBMS / OS)">Core CS (DBMS / OS)</option>
                  <option value="HR & Technical Interview">HR & Technical Interview</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Priority:</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
