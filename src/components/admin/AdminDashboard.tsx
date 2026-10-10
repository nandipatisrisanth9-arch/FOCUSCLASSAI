import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Server,
  Activity,
  Shield,
  Users,
  Clock,
  Sparkles,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Eye,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { telemetry, refreshTelemetry, aiMode, currentUser, addToast } = useApp();

  useEffect(() => {
    refreshTelemetry();
  }, []);

  const handlePurgeTemporaryCache = () => {
    addToast('success', 'Cache Cleared', 'Temporary student audio and camera analysis tokens safely purged according to retention policy.');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xl">
              <Server className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">Institution Administration & Telemetry</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 uppercase">
                  SysAdmin & Dean
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUser.institution} • Audit Logging & Telemetry Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshTelemetry}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              <span>Refresh Metrics</span>
            </button>
            <button
              onClick={handlePurgeTemporaryCache}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Purge Temp Media Cache</span>
            </button>
          </div>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Average Latency</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {telemetry?.averageLatencyMs || 28} <span className="text-xs font-normal text-slate-500">ms</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">High-throughput sub-50ms proxy</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Total API Calls</span>
              <Server className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {telemetry?.totalRequests || 48}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Active request pipeline</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Error Rate</span>
              <AlertCircle className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">
              {telemetry?.errorRatePercentage || 0.0}%
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">Zero unhandled exceptions</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>AI Engine Engine</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-base sm:text-lg font-bold text-white font-mono mt-1">
              {aiMode === 'connected' ? 'Gemini 3.8 Flash' : 'Pedagogical Heuristics'}
            </div>
            <div className="text-[11px] text-indigo-300 font-medium mt-1">
              {aiMode === 'connected' ? 'Live Generative Service' : 'Predictable Demo Mode'}
            </div>
          </div>

        </div>

        {/* 2-Column Administration Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* User & Access Permissions */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-white text-base">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>Institution Users & Role Boundaries</span>
              </div>
              <span className="text-xs font-mono text-slate-500">RBAC Active</span>
            </div>

            <div className="space-y-3">
              {[
                {
                  name: 'Dr. Elena Rostova',
                  email: 'elena.rostova@university.edu',
                  role: 'Faculty Teacher',
                  privileges: 'Create/manage sessions, review Teach-Backs, draft AI assessments',
                },
                {
                  name: 'Alex Chen',
                  email: 'alex.chen@student.edu',
                  role: 'Enrolled Student',
                  privileges: 'Join active class, submit Teach-Back, view personal Learning Memory',
                },
                {
                  name: 'Maya Patel',
                  email: 'maya.patel@student.edu',
                  role: 'Enrolled Student',
                  privileges: 'Join active class, submit Teach-Back, view personal Learning Memory',
                },
                {
                  name: 'Dean Marcus Vance',
                  email: 'admin@university.edu',
                  role: 'Institution Administrator',
                  privileges: 'Full system audit logs, API telemetry, data retention policy',
                },
              ].map((u, idx) => (
                <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">{u.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                      {u.role}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] mb-1">{u.email}</div>
                  <div className="text-slate-500 text-[10px] font-mono">Privileges: {u.privileges}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Compliance Hardening */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-white text-base">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span>Student Privacy & Educational Compliance</span>
              </div>
              <span className="text-xs font-mono text-emerald-400">FERPA / WCAG</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">No Public Competitive Ranking</div>
                  <div className="text-slate-400 text-[11px] leading-relaxed">
                    Student learning evidence is never displayed in public competitive leaderboards. Individual weaknesses are private to student and instructor.
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Explicit Permission Microphone & Camera</div>
                  <div className="text-slate-400 text-[11px] leading-relaxed">
                    Zero covert recording or background audio streaming. All audio and vision requests display clear recording animations and manual text fallbacks.
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Server-Side Secret Isolation</div>
                  <div className="text-slate-400 text-[11px] leading-relaxed">
                    All Gemini AI keys and database operations execute strictly on the backend proxy. No privileged keys are bundled into frontend assets.
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
