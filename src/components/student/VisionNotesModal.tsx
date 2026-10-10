import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Camera, Upload, Sparkles, X, CheckCircle, Image as ImageIcon, BookOpen } from 'lucide-react';

interface VisionNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic?: string;
}

export const VisionNotesModal: React.FC<VisionNotesModalProps> = ({
  isOpen,
  onClose,
  topic = 'Deadlocks & Resource Graphs',
}) => {
  const { addToast } = useApp();
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Explain what is on the board and identify if this resource allocation graph is deadlocked.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);

  if (!isOpen) return null;

  // Generate a chalkboard SVG diagram as a realistic base64 sample
  const loadChalkboardSample = () => {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350" style="background:#1e293b;font-family:monospace;fill:#ffffff;">
      <text x="30" y="40" font-size="20" fill="#38bdf8" font-weight="bold">LECTURE 14: WAIT-FOR GRAPH</text>
      <!-- Process 1 -->
      <circle cx="150" cy="180" r="40" fill="#0f172a" stroke="#818cf8" stroke-width="4"/>
      <text x="140" y="185" font-size="18" fill="#ffffff" font-weight="bold">P1</text>
      <!-- Process 2 -->
      <circle cx="450" cy="180" r="40" fill="#0f172a" stroke="#818cf8" stroke-width="4"/>
      <text x="440" y="185" font-size="18" fill="#ffffff" font-weight="bold">P2</text>
      <!-- Resource 1 -->
      <rect x="270" y="80" width="60" height="50" rx="8" fill="#0f172a" stroke="#34d399" stroke-width="3"/>
      <text x="285" y="112" font-size="16" fill="#34d399" font-weight="bold">R1</text>
      <!-- Resource 2 -->
      <rect x="270" y="240" width="60" height="50" rx="8" fill="#0f172a" stroke="#34d399" stroke-width="3"/>
      <text x="285" y="272" font-size="16" fill="#34d399" font-weight="bold">R2</text>
      <!-- Edges -->
      <path d="M 270 100 L 190 160" stroke="#f43f5e" stroke-width="3" marker-end="url(#arrow)"/>
      <path d="M 170 215 L 270 255" stroke="#f59e0b" stroke-width="3"/>
      <path d="M 330 260 L 415 205" stroke="#f43f5e" stroke-width="3"/>
      <path d="M 430 150 L 330 110" stroke="#f59e0b" stroke-width="3"/>
      <text x="30" y="325" font-size="14" fill="#94a3b8">Note: R1 assigned to P1; P1 requesting R2; P2 assigned to R2; P2 requesting R1.</text>
    </svg>`;

    const base64 = `data:image/svg+xml;base64,${btoa(svgString)}`;
    setImageBase64(base64);
    addToast('info', 'Loaded Board Diagram', 'Chalkboard Wait-For Graph loaded.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageBase64(reader.result as string);
        addToast('success', 'Image Uploaded', 'Board image ready for AI vision analysis.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      addToast('warning', 'Photo Needed', 'Please upload or choose a chalkboard diagram photo first.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/vision-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          prompt,
          topic,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAnalysis(data);
        addToast('success', 'Vision Analysis Complete', 'Diagram and notes successfully parsed.');
      } else {
        addToast('error', 'Vision Analysis Failed', data.message || 'Error parsing image.');
      }
    } catch (err) {
      addToast('error', 'Connection Error', 'Could not reach vision analysis service.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Vision Board & Notes Scanner</h3>
              <p className="text-xs text-slate-400">Capture chalkboard equations or diagrams for instant AI breakdown</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload or Sample Selector */}
        {!analysis ? (
          <div className="space-y-4">
            {imageBase64 ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex flex-col items-center p-3">
                <img
                  src={imageBase64}
                  alt="Captured board diagram"
                  className="max-h-60 rounded-lg object-contain"
                />
                <button
                  onClick={() => setImageBase64(null)}
                  className="mt-3 text-xs text-rose-400 hover:text-rose-300 font-medium"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-700 hover:border-purple-500/50 rounded-2xl p-8 text-center bg-slate-950/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-purple-900/30 text-purple-400 mx-auto flex items-center justify-center mb-3">
                  <Camera className="w-6 h-6" />
                </div>
                <h4 className="text-white font-bold text-sm mb-1">Take or Upload Board Photo</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                  Works with handwritten formulas, architectural charts, and blackboard diagrams.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload from Device</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <button
                    onClick={loadChalkboardSample}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Use Sample Chalkboard Graph</span>
                  </button>
                </div>
              </div>
            )}

            {/* Prompt input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">What would you like explained?</label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Check if this graph has a deadlock cycle..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !imageBase64}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-colors"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Multimodal Vision...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze Notes with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Analysis Result */
          <div className="space-y-4 text-xs">
            <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-4">
              <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold mb-1">Detected Content</div>
              <p className="text-white font-medium text-sm">{analysis.detectedContent}</p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="text-indigo-400 font-bold mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Step-by-Step Breakdown</span>
              </div>
              <ul className="space-y-2 text-slate-300">
                {analysis.stepByStepExplanation?.map((step: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {analysis.keyEquationsOrDiagrams && analysis.keyEquationsOrDiagrams.length > 0 && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <div className="text-emerald-400 font-bold mb-2">Key Identified Relationships / Cycles</div>
                <div className="flex flex-wrap gap-2">
                  {analysis.keyEquationsOrDiagrams.map((eq: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.learningTips && analysis.learningTips.length > 0 && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <div className="text-amber-400 font-bold mb-1">Common Pitfalls to Avoid</div>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  {analysis.learningTips.map((tip: string, i: number) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setAnalysis(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Scan another photo
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
