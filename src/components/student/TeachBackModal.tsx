import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { TeachBackFeedback } from '../../types/index.ts';
import confetti from 'canvas-confetti';
import {
  Mic,
  MicOff,
  Sparkles,
  Send,
  X,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface TeachBackModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  concept: string;
}

export const TeachBackModal: React.FC<TeachBackModalProps> = ({
  isOpen,
  onClose,
  topic,
  concept,
}) => {
  const { addToast } = useApp();
  const [explanation, setExplanation] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<TeachBackFeedback | null>(null);

  // Initialize SpeechRecognition if available in browser
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  if (!isOpen) return null;

  const toggleRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addToast('warning', 'Speech Recognition Unavailable', 'Microphone speech recognition is not supported in this browser. Please type your explanation below.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        addToast('info', 'Listening...', 'Speak clearly into your microphone.');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setExplanation(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        addToast('warning', 'Voice Input Note', 'Microphone capture stopped. You can continue typing in the text box.');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      setIsRecording(false);
      addToast('warning', 'Permission Required', 'Microphone access could not be initialized. Please type your answer.');
    }
  };

  const handleQuickSample = () => {
    setExplanation(
      "Deadlock is when multiple threads or processes each hold a resource that another needs, and wait for each other in a circle. Because nobody can preempt or release their lock without finishing, all of them get stuck forever unless the OS terminates one or reclaims a resource."
    );
  };

  const handleSubmit = async () => {
    if (!explanation.trim()) {
      addToast('warning', 'Input Needed', 'Please speak or type your explanation before submitting.');
      return;
    }

    setIsEvaluating(true);
    try {
      const res = await fetch('/api/ai/teachback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          concept,
          studentExplanation: explanation,
        }),
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        setFeedback(data.evaluation);
        addToast('success', 'Evaluation Complete', `Teach-Back score: ${data.evaluation.score}/100`);

        if (data.evaluation.score >= 80) {
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
            });
          } catch (e) {
            // ignore confetti in unsupported environments
          }
        }
      } else {
        addToast('error', 'Evaluation Failed', data.message || 'Could not evaluate response.');
      }
    } catch (err) {
      addToast('error', 'Connection Error', 'Failed to reach AI evaluation service.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setFeedback(null);
    setExplanation('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">AI Teach-Back Companion</h3>
              <p className="text-xs text-slate-400">Explain the concept in your own words to verify true mastery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-bold mb-1">Target Concept</div>
          <div className="text-white font-semibold text-sm mb-1">{concept}</div>
          <p className="text-xs text-slate-400 italic">
            "Imagine explaining this to a classmate who missed today's lecture. What happens? Why? What causes the system to halt?"
          </p>
        </div>

        {!feedback ? (
          /* Input State */
          <div>
            <div className="relative mb-4">
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={5}
                placeholder="Type your explanation here, or click the microphone to speak..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
              />

              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-rose-950/90 border border-rose-500/50 text-rose-200 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>Recording Audio...</span>
                  <div className="flex items-end gap-0.5 h-3 ml-1">
                    <span className="w-1 bg-rose-400 rounded-full animate-wave-1" />
                    <span className="w-1 bg-rose-400 rounded-full animate-wave-2" />
                    <span className="w-1 bg-rose-400 rounded-full animate-wave-3" />
                  </div>
                </div>
              )}
            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                  title={speechSupported ? 'Record with microphone' : 'Microphone speech recognition not available'}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-400" />}
                  <span>{isRecording ? 'Stop Recording' : 'Voice Input'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickSample}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium px-2 py-1"
                >
                  Load sample student answer
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={isEvaluating || !explanation.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {isEvaluating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Evaluating Rubric...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Teach-Back</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 text-center">
              Evaluated against 5 pedagogical criteria: conceptual correctness, key coverage, logical clarity, misconceptions, and intuition.
            </div>
          </div>
        ) : (
          /* Structured Rubric Feedback State */
          <div className="space-y-4">
            
            {/* Score & Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/90 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-extrabold text-lg border ${
                  feedback.score >= 80
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : feedback.score >= 60
                    ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}>
                  <span>{feedback.score}</span>
                  <span className="text-[9px] font-normal opacity-70">/ 100</span>
                </div>
                <div>
                  <div className="text-white font-bold text-sm">
                    {feedback.score >= 80 ? 'Strong Conceptual Grasp' : feedback.score >= 60 ? 'Developing Understanding' : 'Needs Reinforcement'}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-800 text-slate-300">
                      Clarity: {feedback.logicalClarity}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-800 text-slate-300">
                      Correctness: {feedback.conceptualCorrectness.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-400">
                <div>Confidence: {feedback.confidenceEstimate}%</div>
                <div className="text-[10px] text-indigo-400 font-mono mt-0.5">{feedback.isDemo ? 'Pedagogical Heuristic' : 'Gemini 3.8 Flash Rubric'}</div>
              </div>
            </div>

            {/* Strengths & Missing Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3.5 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>What You Understood Well</span>
                </div>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  {feedback.coverageOfKeyIdeas.covered.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                  {feedback.strengths.slice(0, 1).map((s, i) => (
                    <li key={`s-${i}`}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3.5 text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Key Nuances to Include</span>
                </div>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  {feedback.coverageOfKeyIdeas.missing.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                  {feedback.misconceptions.map((mis, i) => (
                    <li key={`mis-${i}`} className="text-amber-200 font-medium">{mis}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Simple Explanation & Analogy */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Clear Concept Nuance</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{feedback.simpleExplanation}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold mb-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Relatable Everyday Analogy</span>
                </div>
                <p className="text-slate-300 leading-relaxed italic">{feedback.concreteExample}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-purple-400 font-bold mb-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Follow-Up Reflection Question</span>
                </div>
                <p className="text-slate-200 font-medium">{feedback.followUpQuestion}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry & Refine</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-colors"
              >
                Save & Continue Class
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
