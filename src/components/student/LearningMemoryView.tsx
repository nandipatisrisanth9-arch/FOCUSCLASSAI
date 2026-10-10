import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { LearningMemoryItem } from '../../types/index.ts';
import {
  Brain,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  Trash2,
} from 'lucide-react';

export const LearningMemoryView: React.FC = () => {
  const { currentUser, addToast } = useApp();
  const [memories, setMemories] = useState<LearningMemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const fetchMemories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/students/${currentUser.id}/memory`);
      const data = await res.json();
      if (data.success && data.memories) {
        setMemories(data.memories);
      }
    } catch (err) {
      console.warn('Failed to load memory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [currentUser.id]);

  const handleSynthesizeToday = async () => {
    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/ai/learning-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: currentUser.name,
          topic: 'Deadlocks & Coffman Conditions',
          quizScore: 90,
          teachBackScore: 84,
          demonstratedStrengths: [
            'Mutual exclusion understanding',
            'Wait-for graph cycle identification',
          ],
          missedConcepts: ['Preemption policy mechanics'],
        }),
      });

      const data = await res.json();
      if (data.success) {
        const newItem: LearningMemoryItem = {
          id: `mem-${Date.now()}`,
          studentId: currentUser.id,
          sessionId: 'sess-today',
          topic: 'Deadlocks & Coffman Conditions',
          course: 'CS 301: Operating Systems & Concurrency',
          date: new Date().toISOString().split('T')[0],
          masteryPercentage: data.masteryPercentage,
          masteryLevel: data.masteryLevel,
          summary: data.highlightSummary,
          strengths: data.strengths,
          knowledgeGaps: data.knowledgeGaps,
          revisionTasks: data.recommendedRevisionActions.map((a: any, i: number) => ({
            id: `rev-task-${Date.now()}-${i}`,
            title: a.title,
            action: a.action,
            dueInDays: a.dueInDays,
            completed: false,
          })),
        };

        setMemories((prev) => [newItem, ...prev]);
        addToast('success', 'Learning Memory Updated', 'Synthesized evidence from today\'s lecture.');
      }
    } catch (err) {
      addToast('error', 'Synthesis Failed', 'Could not synthesize learning summary.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const toggleTask = (memoryId: string, taskId: string) => {
    setMemories((prev) =>
      prev.map((mem) => {
        if (mem.id !== memoryId) return mem;
        return {
          ...mem,
          revisionTasks: mem.revisionTasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          ),
        };
      })
    );
    addToast('info', 'Task Updated', 'Revision progress recorded.');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Brain className="w-4 h-4" />
              <span>Personalized Learning Memory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Your Understanding History</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Synthesized from in-class quiz checks and your AI Teach-Back explanations.
            </p>
          </div>

          <button
            onClick={handleSynthesizeToday}
            disabled={isSynthesizing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
          >
            {isSynthesizing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Synthesizing Memory...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Synthesize Today's Class</span>
              </>
            )}
          </button>
        </div>

        {/* Memory Cards */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-500 text-sm">Loading learning memory...</div>
        ) : memories.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <Brain className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-white font-bold text-base mb-1">No Learning Memory Records Yet</h3>
            <p className="text-xs max-w-md mx-auto mb-4">
              Attend a class session, answer check questions, and complete a Teach-Back to build your personalized retention map.
            </p>
            <button
              onClick={handleSynthesizeToday}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Generate Demo Memory Card
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {memories.map((mem) => (
              <div
                key={mem.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 sm:p-8 space-y-6 transition-all"
              >
                {/* Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-mono uppercase text-indigo-400 font-bold">{mem.course}</span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">{mem.topic}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{mem.date}</span>
                    </div>
                  </div>

                  {/* Mastery Gauge */}
                  <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Mastery Level</div>
                      <div className="text-xs font-bold text-emerald-400">{mem.masteryLevel}</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-black font-mono text-sm">
                      {mem.masteryPercentage}%
                    </div>
                  </div>
                </div>

                {/* Summary narrative */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Session Synthesis: </strong>
                  {mem.summary}
                </div>

                {/* Strengths & Gaps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4">
                    <div className="text-emerald-400 font-bold mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Demonstrated Strengths</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                      {mem.strengths.map((str, idx) => (
                        <li key={idx}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4">
                    <div className="text-amber-400 font-bold mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Knowledge Gaps to Fortify</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                      {mem.knowledgeGaps.map((gap, idx) => (
                        <li key={idx}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Revision Actions */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>Targeted Spaced Repetition Tasks</span>
                  </div>

                  <div className="space-y-2.5">
                    {mem.revisionTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(mem.id, task.id)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                          task.completed
                            ? 'bg-slate-950/50 border-slate-800/60 opacity-60'
                            : 'bg-slate-950 border-slate-800 hover:border-indigo-500/40'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                            task.completed ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600'
                          }`}>
                            {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <div className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                              {task.title}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{task.action}</div>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          Due in {task.dueInDays}d
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
