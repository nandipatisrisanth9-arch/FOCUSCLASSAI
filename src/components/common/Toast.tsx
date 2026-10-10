import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const bgBorder =
          toast.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100'
            : toast.type === 'error'
            ? 'bg-rose-950/90 border-rose-500/50 text-rose-100'
            : toast.type === 'warning'
            ? 'bg-amber-950/90 border-amber-500/50 text-amber-100'
            : 'bg-indigo-950/90 border-indigo-500/50 text-indigo-100';

        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'error'
            ? AlertCircle
            : toast.type === 'warning'
            ? AlertTriangle
            : Info;

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto backdrop-blur-md border rounded-xl p-3.5 shadow-2xl flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-2 ${bgBorder}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <div className="font-semibold text-sm mb-0.5">{toast.title}</div>
              <div className="opacity-90 leading-relaxed">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white transition-colors p-1"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
