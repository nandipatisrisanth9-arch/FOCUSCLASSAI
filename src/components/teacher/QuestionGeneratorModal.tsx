import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { GeneratedQuestion } from '../../../server/aiService.ts';
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Edit2,
  Trash2,
  Upload,
  Send,
  FileText,
} from 'lucide-react';

interface QuestionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
}

export const QuestionGeneratorModal: React.FC<QuestionGeneratorModalProps> = ({
  isOpen,
  onClose,
  defaultTopic = 'Operating Systems: Deadlocks & Coffman Conditions',
}) => {
  const { addToast, refreshActiveSession } = useApp();
  const [topic, setTopic] = useState(defaultTopic);
  const [material, setMaterial] = useState(
    `Coffman Deadlock Conditions:\n1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.\n2. Hold and Wait: A process must hold at least one resource and be waiting to acquire additional resources held by other processes.\n3. No Preemption: Resources cannot be preempted; a resource can be released only voluntarily by the process holding it.\n4. Circular Wait: A closed chain of processes exists such that each process holds at least one resource needed by the next process in the chain.\n\nDeadlock Avoidance:\nBanker's Algorithm tests for safety by simulating resource allocation for maximum possible pending requests before deciding whether allocation can proceed without deadlock.`
  );
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftQuestions, setDraftQuestions] = useState<GeneratedQuestion[]>([]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!material.trim()) {
      addToast('warning', 'Material Required', 'Please provide lecture text or paste slide content.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          lessonMaterial: material,
          count: 4,
          difficulty,
        }),
      });

      const data = await res.json();
      if (data.success && data.questions) {
        setDraftQuestions(data.questions);
        addToast('success', 'Draft Questions Generated', `${data.questions.length} questions prepared for teacher review.`);
      } else {
        addToast('error', 'Generation Failed', data.message || 'Could not draft questions.');
      }
    } catch (err) {
      addToast('error', 'Network Error', 'Failed to connect to question generation service.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleApprove = (id: string) => {
    setDraftQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isApproved: !q.isApproved } : q))
    );
  };

  const handlePublishApproved = () => {
    const approved = draftQuestions.filter((q) => q.isApproved);
    if (approved.length === 0) {
      addToast('warning', 'None Approved', 'Please approve at least one question before publishing.');
      return;
    }

    addToast('success', 'Questions Published', `${approved.length} questions published to active session live feed.`);
    refreshActiveSession();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg">AI Classroom Question Generator</h3>
              <p className="text-xs text-slate-400">Generate drafted comprehension checks grounded in your lecture notes</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {draftQuestions.length === 0 ? (
          /* Input Form */
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Lecture Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="beginner">Beginner (Foundational definitions)</option>
                  <option value="intermediate">Intermediate (Conceptual application)</option>
                  <option value="advanced">Advanced (Corner cases & algorithms)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Question Mix</label>
                <div className="text-xs text-slate-400 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
                  MCQ + Misconception Check + Exit Ticket
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Lecture Slides / Lesson Source Material
                </label>
                <span className="text-[10px] text-slate-400">Grounded AI generation</span>
              </div>
              <textarea
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                rows={7}
                placeholder="Paste lecture notes, slide transcripts, or textbook excerpts..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !material.trim()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Grounding & Generating Drafts...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Draft Assessments</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Review Screen */
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Teacher Review: </span>
                <strong className="text-white">Review and approve questions before publishing to students.</strong>
              </div>
              <button
                onClick={() => setDraftQuestions([])}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Regenerate
              </button>
            </div>

            <div className="space-y-4">
              {draftQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`bg-slate-950/80 border rounded-2xl p-5 space-y-3 transition-all ${
                    q.isApproved
                      ? 'border-emerald-500/50 bg-emerald-950/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 font-semibold">
                        {q.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">Tag: {q.conceptTag}</span>
                    </div>

                    <button
                      onClick={() => handleToggleApprove(q.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        q.isApproved
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{q.isApproved ? 'Approved' : 'Approve'}</span>
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-white">{q.question}</h4>

                  {q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg border text-[11px] ${
                            opt === q.correctAnswer
                              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200 font-semibold'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300">
                    <span className="font-bold text-indigo-400">Explanation: </span>
                    {q.explanation}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                {draftQuestions.filter((q) => q.isApproved).length} of {draftQuestions.length} approved
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublishApproved}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-colors"
                >
                  Publish to Active Class
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
