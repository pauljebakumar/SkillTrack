import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  Bookmark,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';

export default function StudyMaterials({ setActivePath, setSelectedStudyId }) {
  const [materials, setMaterials] = useState([]);
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, [category, difficulty]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (difficulty !== 'all') params.difficulty = difficulty;
      if (search) params.search = search;

      const res = await api.get('/study', { params });
      if (res.data?.success) {
        setMaterials(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load study materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMaterials();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            <span>Placement Study Materials</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Curated notes, formulas, step-by-step solved examples, and interview questions across Aptitude, Programming, and Core CS.
          </p>
        </div>

        <button
          onClick={() => setActivePath('/ai-coach')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Generate with AI</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 w-full md:w-auto overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Modules' },
            { id: 'aptitude', label: 'Aptitude Practice' },
            { id: 'programming', label: 'Programming & DSA' },
            { id: 'core_cs', label: 'Core CS (DBMS, OS)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                category === tab.id
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Difficulty Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search concepts, formulas..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </form>
        </div>
      </div>

      {/* Materials Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading verified placement study materials...</div>
      ) : materials.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400">No study materials match your filter criteria.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {materials.map((mat) => (
            <div
              key={mat._id}
              onClick={() => {
                setSelectedStudyId(mat.slug || mat._id);
                setActivePath('/study-detail');
              }}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-sm glow-card cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    mat.category === 'aptitude'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      : mat.category === 'programming'
                      ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                      : 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300'
                  }`}>
                    {mat.category.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {mat.estimatedReadTimeMinutes || 15} min read
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mb-1.5">
                  {mat.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">
                  {mat.content?.notes || 'Comprehensive placement guide with formulas, solved problems and quizzes.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className={`font-semibold ${
                  mat.userStatus === 'completed'
                    ? 'text-emerald-500 flex items-center gap-1'
                    : 'text-slate-400'
                }`}>
                  {mat.userStatus === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {mat.userStatus === 'completed' ? 'Completed' : mat.difficulty}
                </span>

                <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Study</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
