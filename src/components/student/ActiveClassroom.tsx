import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { TeachBackModal } from './TeachBackModal.tsx';
import { VisionNotesModal } from './VisionNotesModal.tsx';
import { Question } from '../../types/index.ts';
import {
  Brain,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Mic,
  Camera,
  Layers,
  ChevronRight,
  LogOut,
  Send,
  Lightbulb,
  Radio,
  FileText,
  Code,
  Image as ImageIcon,
} from 'lucide-react';

export const ActiveClassroom: React.FC = () => {
  const {
    currentUser,
    sessionCode,
    activeSession,
    isFocusMode,
    toggleFocusMode,
    setActiveView,
    addToast,
    refreshPulse,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'lecture' | 'check' | 'assistant'>('lecture');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('mat-1');
  const [isTeachBackOpen, setIsTeachBackOpen] = useState(false);
  const [isVisionOpen, setIsVisionOpen] = useState(false);

  // Quiz state
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [hasSubmittedQuiz, setHasSubmittedQuiz] = useState<boolean>(false);
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; explanation: string } | null>(null);

  // In-class AI assistant state
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorLevel, setTutorLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isAskingTutor, setIsAskingTutor] = useState(false);
  const [tutorAnswer, setTutorAnswer] = useState<any | null>(null);

  const materials = activeSession?.materials || [
    {
      id: 'mat-1',
      title: 'Slide 14: Coffman Deadlock Conditions',
      type: 'slides' as const,
      content:
        '1. Mutual Exclusion: non-shareable resources.\n2. Hold and Wait: thread holds R1 while asking for R2.\n3. No Preemption: resources cannot be forcibly seized.\n4. Circular Wait: closed directed cycle of dependency.',
    },
    {
      id: 'mat-2',
      title: 'POSIX Mutex Lock Sequence',
      type: 'code' as const,
      content:
        '// Thread 1:\npthread_mutex_lock(&lock_A);\npthread_mutex_lock(&lock_B);\n\n// Thread 2 (Inverted lock acquisition order):\npthread_mutex_lock(&lock_B);\npthread_mutex_lock(&lock_A); // Circular block occurs here!',
    },
    {
      id: 'mat-3',
      title: 'Architecture Diagram: Wait-For Graph',
      type: 'diagram' as const,
      content:
        'Directed graph where vertices V = Threads, Edges E = Blocked-on dependencies.\nCycle: T1 -> T2 -> T1 confirms deadlock in single-unit resource systems.',
    },
  ];

  const currentMaterial = materials.find((m) => m.id === selectedMaterialId) || materials[0];

  const currentQuestion: Question = {
    id: 'q-live-1',
    topic: 'Deadlocks',
    conceptTag: 'Coffman Conditions',
    question: 'Which of the following conditions is NOT required for a Coffman deadlock to manifest?',
    type: 'mcq',
    options: [
      'A: Mutual exclusion of shared resources',
      'B: Hold and wait condition',
      'C: Preemption of currently locked resources',
      'D: Circular wait chain among processes',
    ],
    correctAnswer: 'C: Preemption of currently locked resources',
    explanation:
      'Deadlocks require NO PREEMPTION. If the operating system or scheduler can forcibly preempt locked resources, the circular chain is broken.',
    difficulty: 'intermediate',
    isPublished: true,
  };

  const handleQuizSubmit = async () => {
    if (!selectedOption) {
      addToast('warning', 'Select an Answer', 'Please choose an option before submitting.');
      return;
    }

    const isCorrect = selectedOption.startsWith('C:');
    try {
      const res = await fetch(`/api/sessions/${sessionCode}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          studentId: currentUser.id,
          studentName: currentUser.name,
          answer: selectedOption,
          conceptTag: currentQuestion.conceptTag,
        }),
      });

      if (res.ok) {
        setHasSubmittedQuiz(true);
        setQuizFeedback({
          isCorrect,
          explanation: currentQuestion.explanation,
        });
        refreshPulse();
        addToast(
          isCorrect ? 'success' : 'info',
          isCorrect ? 'Correct Answer!' : 'Check Completed',
          isCorrect ? 'Your response was recorded in Class Pulse.' : 'Review the concept explanation.'
        );
      }
    } catch (err) {
      addToast('error', 'Submission Error', 'Could not record quiz response.');
    }
  };

  const handleAskTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorQuestion.trim()) return;

    setIsAskingTutor(true);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: tutorQuestion,
          topic: activeSession?.currentTopic || 'Deadlocks',
          level: tutorLevel,
          lessonContext: currentMaterial.content,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTutorAnswer(data);
      } else {
        addToast('error', 'Tutor Failed', data.message || 'Unable to generate response.');
      }
    } catch (err) {
      addToast('error', 'Connection Error', 'Failed to reach AI learning tutor.');
    } finally {
      setIsAskingTutor(false);
    }
  };

  return (
    <div className={`min-h-[calc(100vh-4rem)] bg-slate-950 pb-16 ${isFocusMode ? 'focus-active-glow' : ''}`}>
      
      {/* Distraction-Free Focus Mode Header Bar */}
      <div className={`w-full py-2.5 px-4 sm:px-6 border-b transition-colors ${
        isFocusMode
          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
          : 'bg-slate-900 border-slate-800 text-slate-300'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE: {sessionCode}</span>
            </span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="font-medium text-white truncate max-w-xs sm:max-w-md">
              {activeSession?.title || 'CS-301: Operating Systems & Concurrency'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-semibold">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Focus Score: <strong className="text-emerald-300">96%</strong></span>
            </div>

            <button
              onClick={() => setActiveView('student_dashboard')}
              className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              title="Leave Classroom"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>

        </div>
      </div>

      {/* Classroom Announcement Banner */}
      {activeSession?.announcement && (
        <div className="bg-indigo-950/60 border-b border-indigo-500/30 px-4 py-2 text-xs text-indigo-200 flex items-center justify-center gap-2 text-center">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span><strong>Instructor Broadcast:</strong> {activeSession.announcement}</span>
        </div>
      )}

      {/* Main Classroom Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Navigation Tabs (Mobile-friendly pills) */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('lecture')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'lecture'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Lecture Materials</span>
          </button>

          <button
            onClick={() => setActiveTab('check')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'check'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Comprehension Check</span>
            {!hasSubmittedQuiz && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'assistant'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4 text-emerald-400" />
            <span>AI Tutor</span>
          </button>
        </div>

        {/* Action Highlights: Teach-Back & Vision Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          
          {/* Card 1: Teach-Back */}
          <div className="bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Voice Teach-Back Check</h4>
                <p className="text-xs text-slate-400">Explain deadlock to test your comprehension</p>
              </div>
            </div>
            <button
              onClick={() => setIsTeachBackOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all shrink-0"
            >
              Start Teach-Back
            </button>
          </div>

          {/* Card 2: Vision Notes Scanner */}
          <div className="bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Scan Board & Notes</h4>
                <p className="text-xs text-slate-400">Capture chalkboard graphs or formulas</p>
              </div>
            </div>
            <button
              onClick={() => setIsVisionOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all shrink-0"
            >
              Scan Photo
            </button>
          </div>

        </div>

        {/* Tab 1: Lecture Materials Viewer */}
        {activeTab === 'lecture' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Material Selector List */}
            <div className="lg:col-span-1 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Lesson Artifacts</div>
              {materials.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMaterialId(m.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                    selectedMaterialId === m.id
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {m.type === 'slides' && <FileText className="w-4 h-4 text-sky-400" />}
                    {m.type === 'code' && <Code className="w-4 h-4 text-emerald-400" />}
                    {m.type === 'diagram' && <ImageIcon className="w-4 h-4 text-purple-400" />}
                    <span className="truncate max-w-[160px]">{m.title}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              ))}
            </div>

            {/* Material Content View */}
            <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 font-semibold">
                    {currentMaterial.type}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{currentMaterial.title}</h3>
                </div>
                <div className="text-xs text-slate-400 font-mono">Topic: Coffman Deadlock Conditions</div>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {currentMaterial.content}
              </div>

              <div className="mt-5 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-start gap-3 text-xs text-indigo-200">
                <Lightbulb className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Active Learning Cue:</strong> Remember that breaking any ONE of the four Coffman conditions prevents deadlock entirely. Notice how preemption breaks the cycle!
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Interactive Comprehension Check */}
        {activeTab === 'check' && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600/30 text-indigo-300 border border-indigo-500/40">
                  Question #1
                </span>
                <span className="text-xs text-slate-400">Concept: {currentQuestion.conceptTag}</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                In-Class Pulse Active
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white mb-6 leading-relaxed">
              {currentQuestion.question}
            </h3>

            <div className="space-y-3 mb-6">
              {currentQuestion.options?.map((option, idx) => {
                const isSelected = selectedOption === option;
                return (
                  <button
                    key={idx}
                    disabled={hasSubmittedQuiz}
                    onClick={() => setSelectedOption(option)}
                    className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    } ${hasSubmittedQuiz ? 'cursor-default opacity-90' : ''}`}
                  >
                    <span>{option}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-indigo-400 bg-indigo-600' : 'border-slate-600'
                    }`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {!hasSubmittedQuiz ? (
              <button
                onClick={handleQuizSubmit}
                disabled={!selectedOption}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all"
              >
                Submit Answer to Instructor
              </button>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border ${
                  quizFeedback?.isCorrect
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-100'
                    : 'bg-amber-950/50 border-amber-500/40 text-amber-100'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm mb-1">
                    {quizFeedback?.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Correct! Great comprehension.</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span>Review Opportunity</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">{quizFeedback?.explanation}</p>
                </div>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-400 mb-3">Next step: Reinforce this concept by explaining it in your own words.</p>
                  <button
                    onClick={() => setIsTeachBackOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
                  >
                    Open AI Teach-Back
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 3: Contextual AI Assistant */}
        {activeTab === 'assistant' && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <h3 className="font-bold text-white text-base">In-Class Learning Assistant</h3>
                <p className="text-xs text-slate-400">Ask questions grounded directly in Dr. Rostova's lecture</p>
              </div>

              {/* Comprehension Level Toggle */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
                {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setTutorLevel(lvl)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                      tutorLevel === lvl ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAskTutor} className="space-y-4 mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={tutorQuestion}
                  onChange={(e) => setTutorQuestion(e.target.value)}
                  placeholder="e.g. Why is circular wait different from simple queue waiting?"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-200 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isAskingTutor || !tutorQuestion.trim()}
                  className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1"
                >
                  {isAskingTutor ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                <span>Suggested prompts:</span>
                <button
                  type="button"
                  onClick={() => setTutorQuestion('Explain hold-and-wait with an everyday dining analogy')}
                  className="text-indigo-400 hover:underline"
                >
                  "Dining analogy for hold-and-wait"
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setTutorQuestion('How does resource ordering eliminate cycles in code?')}
                  className="text-indigo-400 hover:underline"
                >
                  "How resource ordering fixes cycles"
                </button>
              </div>
            </form>

            {/* Answer Display */}
            {tutorAnswer && (
              <div className="space-y-4 text-xs bg-slate-950/80 border border-indigo-500/30 rounded-xl p-5 animate-in fade-in-50">
                <div>
                  <div className="text-white font-semibold text-sm leading-relaxed mb-2">{tutorAnswer.answer}</div>
                </div>

                <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-500/20 text-sky-200">
                  <div className="font-bold text-sky-400 mb-1 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Intuitive Analogy</span>
                  </div>
                  <p className="italic leading-relaxed">{tutorAnswer.analogy}</p>
                </div>

                {tutorAnswer.keyTakeaways && (
                  <div>
                    <div className="font-bold text-indigo-400 mb-1.5">Core Takeaways</div>
                    <ul className="space-y-1 text-slate-300 list-disc list-inside">
                      {tutorAnswer.keyTakeaways.map((point: string, i: number) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {tutorAnswer.practiceChallenge && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="font-bold text-purple-400">Quick Self-Check: </span>
                    <span className="text-slate-300">{tutorAnswer.practiceChallenge}</span>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>

      {/* Modals */}
      <TeachBackModal
        isOpen={isTeachBackOpen}
        onClose={() => setIsTeachBackOpen(false)}
        topic={activeSession?.currentTopic || 'Deadlocks & Coffman Conditions'}
        concept="Coffman Deadlock Definition & Circular Wait"
      />

      <VisionNotesModal
        isOpen={isVisionOpen}
        onClose={() => setIsVisionOpen(false)}
        topic={activeSession?.currentTopic}
      />

    </div>
  );
};
