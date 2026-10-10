import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { StudentDashboard } from './components/student/StudentDashboard.tsx';
import { ActiveClassroom } from './components/student/ActiveClassroom.tsx';
import { LearningMemoryView } from './components/student/LearningMemoryView.tsx';
import { TeacherDashboard } from './components/teacher/TeacherDashboard.tsx';
import { LiveClassroomControl } from './components/teacher/LiveClassroomControl.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { ToastContainer } from './components/common/Toast.tsx';

const AppContent: React.FC = () => {
  const { activeView } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {activeView === 'landing' && <LandingPage />}
        {activeView === 'student_dashboard' && <StudentDashboard />}
        {activeView === 'active_classroom' && <ActiveClassroom />}
        {activeView === 'learning_memory' && <LearningMemoryView />}
        {activeView === 'teacher_dashboard' && <TeacherDashboard />}
        {activeView === 'live_control' && <LiveClassroomControl />}
        {activeView === 'admin_dashboard' && <AdminDashboard />}
      </main>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
