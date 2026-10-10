import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Brain,
  Sparkles,
  Smartphone,
  Eye,
  Activity,
  CheckCircle,
  ArrowRight,
  Shield,
  Layers,
  Flame,
  Camera,
  Mic,
  BarChart3,
  BookOpen,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { switchRole, setActiveView, setSessionCode, aiMode } = useApp();

  const handleLaunchStudent = () => {
    switchRole('student');
    setSessionCode('FOCUS-8492');
    setActiveView('student_dashboard');
  };

  const handleLaunchTeacher = () => {
    switchRole('teacher');
    setSessionCode('FOCUS-8492');
    setActiveView('teacher_dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 mb-6 shadow-inner">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI-Powered Smart Classroom Companion</span>
            <span className="w-1 h-1 rounded-full bg-indigo-400" />
            <span className="text-slate-400">{aiMode === 'connected' ? 'Gemini 3.8 Flash Active' : 'Pedagogical Heuristics'}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight">
            Turn Smartphones From <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">Distractions</span> Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-teal-300">Learning Companions</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            FocusClass AI captures real-time evidence of comprehension during the lecture.
            Students explain concepts through <strong>Voice Teach-Back</strong>, while teachers view live <strong>Class Pulse</strong> heatmaps to adapt their instruction on the fly.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-12">
            <button
              onClick={handleLaunchStudent}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all transform active:scale-95"
            >
              <Smartphone className="w-4 h-4" />
              <span>Join as Student (Alex Chen)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleLaunchTeacher}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Open Teacher Live Pulse</span>
            </button>
          </div>

          {/* Quick Session Indicator */}
          <div className="inline-flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Demo Session:</span>
            <span className="text-indigo-300 font-bold">FOCUS-8492</span>
            <span>(CS-301: Operating Systems & Deadlocks)</span>
          </div>
        </div>
      </section>

      {/* Core Learning & AI Flow Comparison */}
      <section className="py-16 bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-2">The Pedagogical Foundation</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">How FocusClass AI Guides True Understanding</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student Learning Cycle */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">Student Learning Cycle</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">4 Steps</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                  <div className="text-indigo-400 font-bold text-base mb-1">1. FOCUS</div>
                  <p className="text-[11px] text-slate-400">Minimalist in-browser companion blocks distractions</p>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                  <div className="text-sky-400 font-bold text-base mb-1">2. UNDERSTAND</div>
                  <p className="text-[11px] text-slate-400">Follow grounded slides & contextual analogies</p>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                  <div className="text-emerald-400 font-bold text-base mb-1">3. PROVE</div>
                  <p className="text-[11px] text-slate-400">Teach-Back explanation evaluated against rubrics</p>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                  <div className="text-purple-400 font-bold text-base mb-1">4. REMEMBER</div>
                  <p className="text-[11px] text-slate-400">Spaced recall tasks stored in Learning Memory</p>
                </div>
              </div>
            </div>

            {/* Supporting AI Workflow */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold">Supporting AI Engine Workflow</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/20">Multimodal</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                {[
                  { title: 'SEE', desc: 'Board & Notes', color: 'text-indigo-400' },
                  { title: 'LISTEN', desc: 'Voice Teach-Back', color: 'text-sky-400' },
                  { title: 'ANALYZE', desc: 'Rubric Criteria', color: 'text-cyan-400' },
                  { title: 'IDENTIFY', desc: 'Gaps & Traps', color: 'text-amber-400' },
                  { title: 'RECOMMEND', desc: 'Targeted Fix', color: 'text-emerald-400' },
                  { title: 'IMPROVE', desc: 'Adaptive Pulse', color: 'text-purple-400' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                    <div className={`font-bold font-mono text-xs ${item.color}`}>{item.title}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-2">Platform Capabilities</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">Built for Genuine In-Class Learning</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Teach-Back */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Voice & Text Teach-Back</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Students explain concepts as if teaching a peer. The AI evaluates conceptual correctness, identifies omissions, points out misconceptions, and responds with a memorable analogy.
            </p>
            <div className="flex items-center gap-2 text-xs text-indigo-300 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Multi-rubric educational scoring</span>
            </div>
          </div>

          {/* Card 2: Class Pulse */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 transition-all">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-5">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Real-Time Class Pulse</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Teachers see active student numbers, focus metrics, and a concept-level heatmap. If 40% of the class misses preemption vs non-preemption, an instant "Recommend Reteach" alert guides the lecture.
            </p>
            <div className="flex items-center gap-2 text-xs text-sky-300 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Instant instructional feedback</span>
            </div>
          </div>

          {/* Card 3: Vision Notes Scanner */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Vision Whiteboard Scanner</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Students photograph complex board diagrams, state machines, or handwritten equations. Multimodal Gemini vision breaks down the diagram step-by-step and highlights common exam pitfalls.
            </p>
            <div className="flex items-center gap-2 text-xs text-purple-300 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Multimodal classroom grounding</span>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-slate-400">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span>FocusClass AI</span>
            <span>—</span>
            <span>Hackathon & Production Smart Classroom Web Platform</span>
          </div>
          <div className="text-slate-500">
            No public student rankings • Privacy by design • Transparent AI estimations
          </div>
        </div>
      </footer>
    </div>
  );
};
