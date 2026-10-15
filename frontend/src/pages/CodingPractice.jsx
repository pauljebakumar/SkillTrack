import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Code2,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Flame,
  Cpu
} from 'lucide-react';

export default function CodingPractice({ setActivePath, setSelectedQuestionId }) {
  const [questions, setQuestions] = useState([]);
  const [difficulty, setDifficulty] = useState('all');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [difficulty, category]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (difficulty !== 'all') params.difficulty = difficulty;
      if (category !== 'all') params.category = category;
      if (search) params.search = search;

      const res = await api.get('/coding/questions', { params });
      if (res.data?.success) {
        setQuestions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load coding questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Code2 className="w-6 h-6 text-emerald-500" />
            <span>Placement Coding Practice</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Solve curated placement coding challenges with multi-language execution in Python, JavaScript, Java, C++, and C.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
            {questions.length} Problems Available
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Difficulty Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 w-full md:w-auto text-xs">
          {['all', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setDifficulty(lvl)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize whitespace-nowrap transition-all ${
                difficulty === lvl
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {lvl === 'all' ? 'All Difficulties' : lvl}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problem title or tags..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>
      </div>

      {/* Questions Table */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading placement problems...</div>
      ) : questions.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400">No coding problems matched your query.</div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Title & Topics</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {questions.map((q) => (
                  <tr
                    key={q._id}
                    onClick={() => {
                      setSelectedQuestionId(q.slug || q._id);
                      setActivePath('/coding-problem');
                    }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      {q.userStatus === 'Accepted' ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Solved</span>
                        </span>
                      ) : q.userStatus === 'Attempted' ? (
                        <span className="text-amber-500 font-semibold text-[11px]">Attempted</span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Unsolved</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-medium">
                      <div className="text-slate-900 dark:text-white font-semibold text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {q.title}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {q.topicTags?.map((t) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {q.category}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        q.difficulty === 'Beginner'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : q.difficulty === 'Intermediate'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                        <span>Solve</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
