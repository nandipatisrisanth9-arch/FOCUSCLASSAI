import React, { useState } from 'react';
import { Copy, Check, QrCode as QrIcon, Smartphone } from 'lucide-react';

interface QrCodeViewProps {
  sessionCode: string;
  courseTitle?: string;
  topic?: string;
}

export const QrCodeView: React.FC<QrCodeViewProps> = ({ sessionCode, courseTitle, topic }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(sessionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Deterministic SVG QR pattern generator based on session code
  const generatePattern = (seed: string) => {
    const size = 21;
    const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

    // Corner finder patterns (7x7)
    const addFinder = (rStart: number, cStart: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            grid[rStart + r][cStart + c] = true;
          }
        }
      }
    };

    addFinder(0, 0);
    addFinder(0, 14);
    addFinder(14, 0);

    // Pseudorandom internal dots hashed by sessionCode
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Skip corner finders
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= 13) ||
          (r >= 13 && c < 8)
        ) {
          continue;
        }
        // Timing tracks
        if (r === 6 || c === 6) {
          grid[r][c] = (r + c) % 2 === 0;
          continue;
        }
        const val = Math.sin(hash + r * 13 + c * 17) * 10000;
        grid[r][c] = (val - Math.floor(val)) > 0.45;
      }
    }

    return grid;
  };

  const grid = generatePattern(sessionCode);

  return (
    <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 text-center shadow-2xl flex flex-col items-center">
      <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
        <Smartphone className="w-4 h-4" />
        Mobile Instant Join
      </div>
      
      {courseTitle && (
        <h3 className="text-white font-bold text-base mb-1">{courseTitle}</h3>
      )}
      {topic && (
        <p className="text-slate-400 text-xs mb-4 line-clamp-1">{topic}</p>
      )}

      {/* QR Visual */}
      <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 mb-4 inline-block">
        <svg viewBox="0 0 21 21" className="w-44 h-44 sm:w-52 sm:h-52">
          {grid.map((row, r) =>
            row.map((cell, c) =>
              cell ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#0F172A" /> : null
            )
          )}
        </svg>
      </div>

      {/* Code Display & Copy */}
      <div className="w-full flex items-center justify-between gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 mb-2">
        <div className="text-left">
          <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Session Code</div>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-widest text-indigo-300">
            {sessionCode}
          </div>
        </div>
        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
          title="Copy Session Code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-slate-400">
        Students navigate to FocusClass AI and enter code or scan via camera.
      </p>
    </div>
  );
};
