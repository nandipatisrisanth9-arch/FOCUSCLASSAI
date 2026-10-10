import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { QrCodeView } from '../common/QrCodeView.tsx';
import { QuestionGeneratorModal } from './QuestionGeneratorModal.tsx';
import {
  Activity,
  Users,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  StopCircle,
  Megaphone,
  QrCode,
  Sparkles,
  BarChart3,
  RefreshCw,
  Send,
  X,
  BookOpen,
} from 'lucide-react';

export const LiveClassroomControl: React.FC = () => {
  const {
    sessionCode,
    activeSession,
    pulseData,
    refreshPulse,
    refreshActiveSession,
    addToast,
  } = useApp();

  const [announcementText, setAnnouncementText] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isQuestionGenOpen, setIsQuestionGenOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    refreshPulse();
  }, []);

  const handleSessionAction = async (action: 'pause' | 'resume' | 'end') => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/sessions/${sessionCode}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        addToast(
          'info',
          'Session Updated',
          action === 'pause' ? 'Session paused for students.' : action === 'resume' ? 'Session resumed.' : 'Session ended.'
        );
        refreshActiveSession();
        refreshPulse();
      }
    } catch (err) {
      addToast('error', 'Update Failed', 'Could not update session status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    try {
      const res = await fetch(`/api/sessions/${sessionCode}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcement: announcementText }),
      });

      if (res.ok) {
        addToast('success', 'Announcement Broadcast', 'Ticker updated on student companion screens.');
        setAnnouncementText('');
        refreshActiveSession();
      }
    } catch (err) {
      addToast('error', 'Broadcast Failed', 'Could not broadcast announcement.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Control Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Live Classroom Control Panel
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-mono font-bold text-indigo-300">Room: {sessionCode}</span>
            </div>
            <h1 className="text-2xl font-black text-white">CS 301: Operating Systems & Concurrency</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Current Topic: <strong>{activeSession?.currentTopic || 'Coffman Deadlock Conditions & Resource Graphs'}</strong>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
            >
              <QrCode className="w-4 h-4 text-indigo-400" />
              <span>Projector QR Code</span>
            </button>

            <button
              onClick={() => setIsQuestionGenOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Question Builder</span>
            </button>

            {/* Session State Switcher */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
              {activeSession?.status === 'active' ? (
                <button
                  onClick={() => handleSessionAction('pause')}
                  disabled={isUpdatingStatus}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300 hover:bg-amber-950/40 flex items-center gap-1.5 transition-colors"
                  title="Pause Session"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={() => handleSessionAction('resume')}
                  disabled={isUpdatingStatus}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-300 hover:bg-emerald-950/40 flex items-center gap-1.5 transition-colors"
                  title="Resume Session"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </button>
              )}

              <button
                onClick={() => handleSessionAction('end')}
                disabled={isUpdatingStatus}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-950/40 flex items-center gap-1.5 transition-colors"
                title="End Session"
              >
                <StopCircle className="w-3.5 h-3.5" />
                <span>End</span>
              </button>
            </div>

            <button
              onClick={refreshPulse}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              title="Refresh Real-Time Pulse"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Broadcast Announcer */}
        <form onSubmit={handleBroadcastAnnouncement} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Megaphone className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="Broadcast live prompt to student screens (e.g. 'Turn to slide 14 and open your Teach-Back companion')..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast</span>
          </button>
        </form>

        {/* Class Pulse Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Active in Class</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {pulseData?.activeInClass || 6} <span className="text-xs text-slate-500 font-normal">/ 38 enrolled</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">
              {pulseData?.participationRate || 85}% participation rate
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>In Focus Mode</span>
              <Eye className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {pulseData?.focusModeActiveCount || 4} <span className="text-xs text-slate-500 font-normal">students</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Zero distraction feed active
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Class-Wide Accuracy</span>
              <Activity className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">
              {pulseData?.accuracy || 67}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {pulseData?.totalResponses || 6} total checked responses
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Avg Focus Score</span>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">
              {pulseData?.averageFocusScore || 92}%
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">
              High classroom engagement
            </div>
          </div>

        </div>

        {/* 2-Column Pulse Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Concept Understanding Heatmap */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-extrabold text-white text-base">Class Pulse: Concept Understanding Heatmap</h3>
                  <p className="text-xs text-slate-400">Aggregated live from verified quiz submissions and Teach-Back evidence</p>
                </div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-500/30">
                  Adaptive Teaching Radar
                </span>
              </div>

              <div className="space-y-4">
                {pulseData?.conceptHeatmap && pulseData.conceptHeatmap.length > 0 ? (
                  pulseData.conceptHeatmap.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        item.recommendReteach
                          ? 'bg-rose-950/30 border-rose-500/40'
                          : item.accuracyPercentage >= 80
                          ? 'bg-slate-950/80 border-emerald-500/30'
                          : 'bg-slate-950/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div>
                          <div className="text-sm font-bold text-white">{item.concept}</div>
                          <div className="text-[11px] text-slate-400">{item.total} responses collected</div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                            item.recommendReteach
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                              : item.accuracyPercentage >= 80
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          }`}>
                            {item.accuracyPercentage}%
                          </span>

                          {item.recommendReteach && (
                            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Recommend Reteach</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.recommendReteach
                              ? 'bg-rose-500'
                              : item.accuracyPercentage >= 80
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${item.accuracyPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500">Not enough responses collected yet.</div>
                )}
              </div>
            </div>

            {/* Diagnostic Missed Questions Alert */}
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm mb-4">
                <AlertTriangle className="w-5 h-5" />
                <span>Pedagogical Diagnostic Alert</span>
              </div>

              {pulseData?.frequentlyMissedItems?.map((item, idx) => (
                <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between text-white font-semibold">
                    <span>{item.questionText}</span>
                    <span className="text-rose-400 font-mono font-bold">{item.missRate} Miss Rate</span>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/20 text-amber-200">
                    <strong className="text-amber-400">Recommended Instructional Fix: </strong>
                    {item.suggestedRemedy}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Live Responses Feed */}
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-sm">Real-Time Response Feed</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="space-y-3">
                {pulseData?.liveFeed && pulseData.liveFeed.length > 0 ? (
                  pulseData.liveFeed.map((resp) => (
                    <div
                      key={resp.id}
                      className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{resp.studentName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          resp.isCorrect
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                        }`}>
                          {resp.isCorrect ? 'Correct' : 'Missed'}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] truncate">
                        "{resp.answer}"
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(resp.submittedAt).toLocaleTimeString()} • {resp.conceptTag}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500">Waiting for live answers...</div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Projector QR Code Big Display Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg">
          <div className="relative max-w-lg w-full">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>
            <QrCodeView
              sessionCode={sessionCode}
              courseTitle="CS 301: Operating Systems & Concurrency"
              topic="Coffman Deadlock Conditions & Resource Graphs"
            />
          </div>
        </div>
      )}

      {/* AI Question Generator Modal */}
      <QuestionGeneratorModal
        isOpen={isQuestionGenOpen}
        onClose={() => setIsQuestionGenOpen(false)}
        defaultTopic={activeSession?.currentTopic}
      />

    </div>
  );
};
