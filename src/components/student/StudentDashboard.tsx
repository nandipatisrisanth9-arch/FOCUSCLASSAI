import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Brain,
  Sparkles,
  Flame,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  Smartphone,
  ChevronRight,
  Activity,
  QrCode,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    sessionCode,
    setSessionCode,
    setActiveView,
    addToast,
    refreshActiveSession,
  } = useApp();

  const [inputCode, setInputCode] = useState(sessionCode || 'FOCUS-8492');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      addToast('warning', 'Enter Code', 'Please enter a valid 6-character session code.');
      return;
    }

    setIsJoining(true);
    setSessionCode(inputCode.trim().toUpperCase());

    try {
      const res = await fetch(`/api/sessions/${inputCode.trim().toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser.id,
          studentName: currentUser.name,
        }),
      });

      const data = await res.json();
      if (data.success) {
        addToast('success', 'Joined Session', `Connected to ${data.session?.title || 'Classroom'}`);
        await refreshActiveSession();
        setActiveView('active_classroom');
      } else {
        addToast('error', 'Join Failed', data.message || 'Invalid session code.');
      }
    } catch (err) {
      addToast('error', 'Network Error', 'Could not connect to classroom session.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Profile & Streak Header */}
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
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">Welcome back, {currentUser.name}</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 uppercase">Student</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentUser.institution}</p>
            </div>
          </div>

          {/* Learning Streak Pill */}
          <div className="flex items-center gap-3 bg-slate-950/80 border border-amber-500/30 rounded-xl px-4 py-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Learning Streak</div>
              <div className="text-sm font-black text-amber-300 font-mono">
                {currentUser.streakDays || 8} Days Active
              </div>
            </div>
          </div>
        </div>

        {/* Live Classroom Invitation Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>INSTRUCTOR LIVE NOW</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">CS 301: Operating Systems & Concurrency</h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Topic: <strong>Coffman Deadlock Conditions & Resource Graphs</strong>. Dr. Elena Rostova is taking comprehension checks and voice teach-backs.
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                <span>Room Code: <strong className="text-indigo-300 font-mono">FOCUS-8492</strong></span>
                <span>•</span>
                <span>Active Students: <strong>38</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <form onSubmit={handleJoinClass} className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="CODE (e.g. FOCUS-8492)"
                  className="bg-slate-950 border border-indigo-500/50 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-44 text-center tracking-widest"
                />
                <button
                  type="submit"
                  disabled={isJoining}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all shrink-0"
                >
                  {isJoining ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Enter Class</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Dashboard 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Today's Revision Action & Learning Memory */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Revision Task Alert */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Spaced Repetition Task</h3>
                    <p className="text-[11px] text-slate-400">Personalized revision generated from your last session</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveView('learning_memory')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <span>View Memory</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 font-semibold">
                      CS 202: Data Structures
                    </span>
                    <span className="text-xs text-slate-400">Due Today</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">AVL Tree Double-Rotation Trace</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Hand-trace inserting {'{10, 30, 20}'} into an empty AVL tree to practice the Left-Right double-rotation boundary.
                  </p>
                </div>
                <button
                  onClick={() => {
                    addToast('success', 'Task Completed', 'Marked AVL double-rotation practice as complete.');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold shrink-0 border border-slate-700 transition-colors"
                >
                  Mark Done
                </button>
              </div>
            </div>

            {/* Concept Knowledge-Gap Map */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-sm">Concept Knowledge-Gap Map</h3>
                  <p className="text-[11px] text-slate-400">Calculated strictly from verified quiz answers and Teach-Back evidence</p>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Transparent Rubrics</span>
              </div>

              <div className="space-y-4">
                {[
                  {
                    concept: 'Coffman Deadlock Conditions',
                    course: 'CS-301 Operating Systems',
                    mastery: 92,
                    status: 'Mastered',
                    color: 'bg-emerald-500',
                  },
                  {
                    concept: 'Wait-For Resource Graphs (WFG)',
                    course: 'CS-301 Operating Systems',
                    mastery: 84,
                    status: 'Proficient',
                    color: 'bg-indigo-500',
                  },
                  {
                    concept: 'Deadlock Recovery & Victim Selection',
                    course: 'CS-301 Operating Systems',
                    mastery: 64,
                    status: 'Developing',
                    color: 'bg-amber-500',
                  },
                  {
                    concept: 'AVL Tree Double Rotations',
                    course: 'CS-202 Data Structures',
                    mastery: 72,
                    status: 'Proficient',
                    color: 'bg-sky-500',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div>
                        <span className="font-bold text-white">{item.concept}</span>
                        <span className="text-slate-400 text-[10px] ml-2">({item.course})</span>
                      </div>
                      <span className="font-mono font-bold text-slate-300">{item.mastery}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all`}
                        style={{ width: `${item.mastery}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Column 2: Recent Courses & Quick Join Info */}
          <div className="space-y-6">
            
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-white text-sm mb-4">Enrolled Classrooms</h3>
              
              <div className="space-y-3">
                <div className="bg-slate-950/70 border border-indigo-500/30 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">CS 301: Operating Systems</div>
                    <div className="text-[11px] text-slate-400">Dr. Elena Rostova</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    Live
                  </span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">CS 202: Data Structures</div>
                    <div className="text-[11px] text-slate-400">Dr. Elena Rostova</div>
                  </div>
                  <span className="text-[10px] text-slate-500">Tue / Thu</span>
                </div>
              </div>
            </div>

            {/* In-Browser Focus Mode Info */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-xs text-slate-300 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Brain className="w-4 h-4" />
                <span>FocusClass AI Promise</span>
              </div>
              <p className="leading-relaxed text-slate-400 text-[11px]">
                No social feed, no unsolicited notifications. Your phone becomes a clean, active companion for peer teaching and instant feedback.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
