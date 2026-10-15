import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import StudyMaterials from './pages/StudyMaterials';
import StudyDetail from './pages/StudyDetail';
import AptitudePractice from './pages/AptitudePractice';
import CodingPractice from './pages/CodingPractice';
import CodingProblemDetail from './pages/CodingProblemDetail';
import MockTests from './pages/MockTests';
import MockTestTake from './pages/MockTestTake';
import AIPositionCoach from './pages/AIPositionCoach';
import SkillAnalysis from './pages/SkillAnalysis';
import LearningRoadmap from './pages/LearningRoadmap';
import InterviewPrep from './pages/InterviewPrep';
import StudyPlanner from './pages/StudyPlanner';
import MyNotes from './pages/MyNotes';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

function AppContent() {
  const { user, isAdmin, loading } = useAuth();
  const [activePath, setActivePath] = useState('/');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState('two-sum');
  const [selectedStudyId, setSelectedStudyId] = useState('time-and-work-concepts');
  const [selectedMockTestId, setSelectedMockTestId] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19]">
        <div className="space-y-3 text-center">
          <div className="w-10 h-10 mx-auto border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Initializing SkillTrack Placement AI...</p>
        </div>
      </div>
    );
  }

  // Render current view
  const renderView = () => {
    switch (activePath) {
      case '/':
        return (
          <Dashboard
            setActivePath={setActivePath}
            setSelectedQuestionId={setSelectedQuestionId}
            setSelectedStudyId={setSelectedStudyId}
          />
        );
      case '/study':
        return (
          <StudyMaterials
            setActivePath={setActivePath}
            setSelectedStudyId={setSelectedStudyId}
          />
        );
      case '/study-detail':
        return (
          <StudyDetail
            studyId={selectedStudyId}
            setActivePath={setActivePath}
          />
        );
      case '/aptitude':
        return <AptitudePractice setActivePath={setActivePath} />;
      case '/coding':
        return (
          <CodingPractice
            setActivePath={setActivePath}
            setSelectedQuestionId={setSelectedQuestionId}
          />
        );
      case '/coding-problem':
        return (
          <CodingProblemDetail
            questionId={selectedQuestionId}
            setActivePath={setActivePath}
          />
        );
      case '/mock-tests':
        return (
          <MockTests
            setActivePath={setActivePath}
            setSelectedMockTestId={setSelectedMockTestId}
          />
        );
      case '/mock-test-take':
        return (
          <MockTestTake
            testId={selectedMockTestId}
            setActivePath={setActivePath}
          />
        );
      case '/ai-coach':
        return <AIPositionCoach />;
      case '/skill-analysis':
        return <SkillAnalysis setActivePath={setActivePath} />;
      case '/roadmap':
        return <LearningRoadmap setActivePath={setActivePath} />;
      case '/interview-prep':
        return <InterviewPrep setActivePath={setActivePath} />;
      case '/planner':
        return <StudyPlanner />;
      case '/notes':
        return <MyNotes />;
      case '/profile':
        return <Profile />;
      case '/admin':
        return isAdmin ? (
          <AdminDashboard setActivePath={setActivePath} />
        ) : (
          <div className="p-8 text-center space-y-3">
            <h2 className="text-lg font-bold text-rose-500">Access Restricted</h2>
            <p className="text-xs text-slate-500">Administrator role required to access this control panel.</p>
            <button
              onClick={() => setActivePath('/')}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        );
      case '/login':
        return <Login setActivePath={setActivePath} />;
      case '/register':
        return <Register setActivePath={setActivePath} />;
      default:
        return (
          <Dashboard
            setActivePath={setActivePath}
            setSelectedQuestionId={setSelectedQuestionId}
            setSelectedStudyId={setSelectedStudyId}
          />
        );
    }
  };

  const isAuthPage = activePath === '/login' || activePath === '/register';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activePath={activePath}
        setActivePath={setActivePath}
      />

      <div className="flex-1 flex">
        {!isAuthPage && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            activePath={activePath}
            setActivePath={setActivePath}
          />
        )}

        <main className={`flex-1 transition-all p-4 sm:p-6 lg:p-8 ${!isAuthPage ? 'lg:pl-72' : ''}`}>
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
