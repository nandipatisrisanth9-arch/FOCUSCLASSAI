import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { QuestionGeneratorModal } from './QuestionGeneratorModal.tsx';
import {
  BookOpen,
  Activity,
  Users,
  Sparkles,
  ArrowRight,
  Plus,
  QrCode,
  Calendar,
  Layers,
  Download,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const {
    currentUser,
    setActiveView,
    setSessionCode,
    addToast,
  } = useApp();

  const [isQuestionGenOpen, setIsQuestionGenOpen] = useState(false);

  const handleLaunchSession = (code: string) => {
    setSessionCode(code);
    setActiveView('live_control');
    addToast('info', 'Live Session Loaded', `Opening real-time control room for ${code}`);
  };

  const handleExportReport = () => {
    addToast('success', 'Report Exported', 'CS-301 Class Pulse & Teach-Back mastery summary exported to CSV.');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/40"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-lg">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">{currentUser.name}</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 uppercase">
                  Faculty Instructor
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUser.department} • {currentUser.institution}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsQuestionGenOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Draft AI Assessments</span>
            </button>
            <button
              onClick={handleExportReport}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Reports</span>
            </button>
          </div>
        </div>

        {/* Live Active Session Highlight */}
        <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>SESSION IN PROGRESS</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">CS 301: Advanced Systems & OS Kernel</h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Topic: <strong>Coffman Deadlock Conditions & Resource Graphs</strong>. 38 students enrolled, 85% participation in live checks.
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono pt-1">
                <span>Session Code: <strong className="text-indigo-300">FOCUS-8492</strong></span>
                <span>•</span>
                <span>Average Focus: <strong className="text-emerald-400">92%</strong></span>
              </div>
            </div>

            <button
              onClick={() => handleLaunchSession('FOCUS-8492')}
              className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all self-start lg:self-auto"
            >
              <Activity className="w-4 h-4" />
              <span>Open Class Pulse & Controls</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Managed Classrooms Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-white text-base">Your Active Courses</h3>
            <span className="text-xs text-slate-400">Fall Semester 2026</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Class 1 */}
            <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 space-y-4 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-400 uppercase">CS-301</span>
                  <h4 className="text-base font-bold text-white mt-0.5">Advanced Systems & OS Kernel</h4>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Active
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Undergraduate core examining multi-threaded synchronization, semaphores, deadlock algorithms, and memory paging.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400">38 Enrolled</span>
                <button
                  onClick={() => handleLaunchSession('FOCUS-8492')}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <span>Control Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Class 2 */}
            <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 space-y-4 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-sky-400 uppercase">CS-202</span>
                  <h4 className="text-base font-bold text-white mt-0.5">Data Structures & Algorithms</h4>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-400">
                  Next: Thursday 10:00 AM
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fundamental algorithmic analysis, self-balancing binary search trees (AVL/Red-Black), and graph traversals.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400">42 Enrolled</span>
                <button
                  onClick={() => {
                    addToast('info', 'Class Schedule', 'Session scheduled for Thursday.');
                  }}
                  className="text-slate-400 hover:text-white font-semibold flex items-center gap-1"
                >
                  <span>Manage Materials</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      <QuestionGeneratorModal
        isOpen={isQuestionGenOpen}
        onClose={() => setIsQuestionGenOpen(false)}
      />
    </div>
  );
};
