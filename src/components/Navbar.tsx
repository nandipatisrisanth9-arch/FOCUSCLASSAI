import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  GraduationCap,
  Sparkles,
  Users,
  Eye,
  Activity,
  Brain,
  ShieldCheck,
  Server,
  Layers,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    role,
    switchRole,
    currentUser,
    activeView,
    setActiveView,
    isFocusMode,
    toggleFocusMode,
    aiMode,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Mode */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('landing')}
            className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 shadow-lg shadow-indigo-500/25">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Brain className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">FocusClass</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Smart Classroom Learning Engine</p>
            </div>
          </button>

          {/* AI Mode Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-900 border-slate-800">
            <span className={`w-2 h-2 rounded-full ${aiMode === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-slate-300">
              {aiMode === 'connected' ? 'Connected (Gemini 3.8 Flash)' : 'Demo Mode (Pedagogical Heuristics)'}
            </span>
          </div>
        </div>

        {/* Role Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {role === 'student' && (
            <>
              <button
                onClick={() => setActiveView('student_dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeView === 'student_dashboard'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('active_classroom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeView === 'active_classroom'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Live Classroom
              </button>
              <button
                onClick={() => setActiveView('learning_memory')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeView === 'learning_memory'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Brain className="w-3.5 h-3.5 text-emerald-400" />
                Learning Memory
              </button>
            </>
          )}

          {role === 'teacher' && (
            <>
              <button
                onClick={() => setActiveView('teacher_dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeView === 'teacher_dashboard'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Courses & Classes
              </button>
              <button
                onClick={() => setActiveView('live_control')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeView === 'live_control'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Live Pulse & Controls
              </button>
            </>
          )}

          {role === 'admin' && (
            <button
              onClick={() => setActiveView('admin_dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeView === 'admin_dashboard'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              Institution & Telemetry
            </button>
          )}
        </nav>

        {/* Actions & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Focus Mode Button for Students */}
          {role === 'student' && (
            <button
              onClick={toggleFocusMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                isFocusMode
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
              title="Toggle In-Classroom Distraction-Free Focus Mode"
            >
              <Eye className={`w-3.5 h-3.5 ${isFocusMode ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Focus Mode</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isFocusMode ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            </button>
          )}

          {/* Role Selector Pills */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => switchRole('student')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                role === 'student'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => switchRole('teacher')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                role === 'teacher'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Teacher
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                role === 'admin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin
            </button>
          </div>

          {/* User Profile Thumbnail */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-900/60 text-indigo-300 flex items-center justify-center text-xs font-bold ring-2 ring-indigo-500/30">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-white leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400 capitalize">{currentUser.role}</div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
