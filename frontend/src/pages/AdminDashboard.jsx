import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ShieldAlert,
  Users,
  BookOpen,
  Code2,
  FileCheck2,
  CheckCircle2,
  Trash2,
  Plus,
  Sparkles,
  BarChart3,
  Check
} from 'lucide-react';

export default function AdminDashboard({ setActivePath }) {
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('stats'); // stats, materials, questions, users
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showAddCodingModal, setShowAddCodingModal] = useState(false);

  // New Material State
  const [matTitle, setMatTitle] = useState('');
  const [matCategory, setMatCategory] = useState('programming');
  const [matSubject, setMatSubject] = useState('Data Structures');
  const [matTopic, setMatTopic] = useState('');
  const [matDifficulty, setMatDifficulty] = useState('Beginner');
  const [matNotes, setMatNotes] = useState('');

  // New Coding Question State
  const [qTitle, setQTitle] = useState('');
  const [qDifficulty, setQDifficulty] = useState('Beginner');
  const [qCategory, setQCategory] = useState('Arrays & Hashing');
  const [qDescription, setQDescription] = useState('');
  const [qSampleInput, setQSampleInput] = useState('');
  const [qSampleOutput, setQSampleOutput] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, matRes, qRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: { stats: null } })),
        api.get('/admin/users').catch(() => ({ data: { data: [] } })),
        api.get('/study').catch(() => ({ data: { data: [] } })),
        api.get('/coding/questions').catch(() => ({ data: { data: [] } }))
      ]);

      if (statsRes.data?.stats) setStats(statsRes.data.stats);
      if (usersRes.data?.data) setUsersList(usersRes.data.data);
      if (matRes.data?.data) setMaterials(matRes.data.data);
      if (qRes.data?.data) setQuestions(qRes.data.data);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMaterial = async (id, currentVerified) => {
    try {
      await api.patch(`/admin/study-materials/${id}/verify`, { verified: !currentVerified });
      fetchAdminData();
    } catch (err) {
      console.error('Verification error:', err);
    }
  };

  const handleDeleteMaterial = async (id) => {
    try {
      await api.delete(`/admin/study-materials/${id}`);
      fetchAdminData();
    } catch (err) {
      console.error('Delete material error:', err);
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await api.delete(`/admin/coding-questions/${id}`);
      fetchAdminData();
    } catch (err) {
      console.error('Delete question error:', err);
    }
  };

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/study-materials', {
        title: matTitle,
        category: matCategory,
        subject: matSubject,
        topic: matTopic || matTitle,
        difficulty: matDifficulty,
        content: {
          notes: matNotes,
          formulas: ['Fundamental placement rules and patterns.'],
          samplePrograms: [],
          commonErrors: [],
          solvedExamples: []
        },
        verifiedByAdmin: true
      });
      setShowAddMaterialModal(false);
      setMatTitle('');
      setMatNotes('');
      fetchAdminData();
    } catch (err) {
      console.error('Create material error:', err);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/coding-questions', {
        title: qTitle,
        difficulty: qDifficulty,
        category: qCategory,
        description: qDescription,
        sampleTestCases: [{ input: qSampleInput, expectedOutput: qSampleOutput }],
        hiddenTestCases: [{ input: qSampleInput, expectedOutput: qSampleOutput }]
      });
      setShowAddCodingModal(false);
      setQTitle('');
      setQDescription('');
      setQSampleInput('');
      setQSampleOutput('');
      fetchAdminData();
    } catch (err) {
      console.error('Create question error:', err);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading administrative telemetry...</div>;
  }

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            <span>Administrator Control Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Platform-level analytics, content curation, AI verification, and user management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddMaterialModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Study Material</span>
          </button>
          <button
            onClick={() => setShowAddCodingModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Coding Problem</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {[
          { id: 'stats', label: 'Platform Telemetry', icon: BarChart3 },
          { id: 'materials', label: `Study Materials (${materials.length})`, icon: BookOpen },
          { id: 'questions', label: `Coding Exercises (${questions.length})`, icon: Code2 },
          { id: 'users', label: `Registered Students (${usersList.length})`, icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Platform Stats */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Users</span>
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats?.totalUsers || 2}</div>
              <span className="text-[10px] text-slate-400">{stats?.totalStudents || 1} active students</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Study Modules</span>
              <div className="text-2xl font-extrabold text-amber-500">{stats?.totalStudyMaterials || materials.length}</div>
              <span className="text-[10px] text-slate-400">Aptitude, DSA & Core CS</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Coding Problems</span>
              <div className="text-2xl font-extrabold text-emerald-500">{stats?.totalCodingQuestions || questions.length}</div>
              <span className="text-[10px] text-slate-400">With sandboxed testcases</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Code Submissions</span>
              <div className="text-2xl font-extrabold text-cyan-400">{stats?.totalSubmissions || 0}</div>
              <span className="text-[10px] text-slate-400">Evaluated in real-time</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Study Materials Management */}
      {activeTab === 'materials' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">AI / Verified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {materials.map((m) => (
                <tr key={m._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{m.title}</td>
                  <td className="py-3 px-4 text-slate-500 uppercase">{m.category}</td>
                  <td className="py-3 px-4">{m.difficulty}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleVerifyMaterial(m._id, m.verifiedByAdmin)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.verifiedByAdmin
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>{m.verifiedByAdmin ? 'Verified' : 'Pending Review'}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteMaterial(m._id)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Coding Questions Management */}
      {activeTab === 'questions' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Problem Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {questions.map((q) => (
                <tr key={q._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{q.title}</td>
                  <td className="py-3 px-4 text-slate-500">{q.category}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-[10px] uppercase text-indigo-500">{q.difficulty}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteQuestion(q._id)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Users Management */}
      {activeTab === 'users' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">College</th>
                <th className="py-3 px-4">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {usersList.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{u.fullName}</td>
                  <td className="py-3 px-4 text-slate-500">{u.email}</td>
                  <td className="py-3 px-4 text-slate-500">{u.collegeName || 'National Engineering College'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Study Material Modal */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Publish New Study Material</h3>
            <form onSubmit={handleCreateMaterial} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Title:</label>
                <input
                  type="text"
                  required
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Category:</label>
                  <select
                    value={matCategory}
                    onChange={(e) => setMatCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="programming">Programming & DSA</option>
                    <option value="aptitude">Aptitude Practice</option>
                    <option value="core_cs">Core Computer Science</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Difficulty:</label>
                  <select
                    value={matDifficulty}
                    onChange={(e) => setMatDifficulty(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Concept Notes:</label>
                <textarea
                  rows={4}
                  required
                  value={matNotes}
                  onChange={(e) => setMatNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMaterialModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Publish Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Coding Problem Modal */}
      {showAddCodingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Publish New Coding Problem</h3>
            <form onSubmit={handleCreateQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Problem Title:</label>
                <input
                  type="text"
                  required
                  value={qTitle}
                  onChange={(e) => setQTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Difficulty:</label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Category:</label>
                  <input
                    type="text"
                    value={qCategory}
                    onChange={(e) => setQCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Problem Description:</label>
                <textarea
                  rows={3}
                  required
                  value={qDescription}
                  onChange={(e) => setQDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Sample Input:</label>
                  <input
                    type="text"
                    value={qSampleInput}
                    onChange={(e) => setQSampleInput(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Expected Output:</label>
                  <input
                    type="text"
                    value={qSampleOutput}
                    onChange={(e) => setQSampleOutput(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCodingModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  Publish Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
