import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Calculator,
  Code2,
  FileCheck2,
  Bot,
  LineChart,
  Milestone,
  MessagesSquare,
  CalendarCheck,
  StickyNote,
  UserCircle,
  ShieldAlert,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, activePath, setActivePath }) {
  const { user, isAdmin } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Study Materials', path: '/study', icon: BookOpen },
    { label: 'Aptitude Practice', path: '/aptitude', icon: Calculator },
    { label: 'Coding Practice', path: '/coding', icon: Code2 },
    { label: 'Mock Tests', path: '/mock-tests', icon: FileCheck2 },
    { label: 'AI Placement Coach', path: '/ai-coach', icon: Bot, badge: 'AI' },
    { label: 'Skill Analysis', path: '/skill-analysis', icon: LineChart },
    { label: 'Learning Roadmap', path: '/roadmap', icon: Milestone },
    { label: 'Interview Prep', path: '/interview-prep', icon: MessagesSquare },
    { label: 'Study Planner', path: '/planner', icon: CalendarCheck },
    { label: 'My Notes', path: '/notes', icon: StickyNote },
    { label: 'My Profile', path: '/profile', icon: UserCircle },
  ];

  if (isAdmin) {
    navItems.push({
      label: 'Admin Dashboard',
      path: '/admin',
      icon: ShieldAlert,
      adminOnly: true
    });
  }

  const handleNavClick = (path) => {
    setActivePath(path);
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Platform Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePath === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : item.adminOnly ? 'text-amber-500' : 'text-slate-400 group-hover:text-indigo-500'
                  }`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.adminOnly && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500">
                      ADMIN
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: Target & Goal Quick Glance */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-500/10 border border-indigo-500/20 text-xs">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 mb-1">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              <span>Target: {user?.placementGoals?.split(' ')[0] || 'Tier-1 FAANG'}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              {user ? `${user.collegeName || 'Engineering College'} • ${user.yearOfStudy || '3rd Year'}` : 'Guest Student'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
