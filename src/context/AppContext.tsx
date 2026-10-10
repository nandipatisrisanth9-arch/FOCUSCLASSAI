import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserProfile,
  UserRole,
  ClassSession,
  ClassPulseData,
  LearningMemoryItem,
  TelemetryData,
} from '../types/index.ts';

interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  currentUser: UserProfile;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  sessionCode: string;
  setSessionCode: (code: string) => void;
  activeSession: ClassSession | null;
  refreshActiveSession: () => Promise<void>;
  pulseData: ClassPulseData | null;
  refreshPulse: () => Promise<void>;
  isFocusMode: boolean;
  toggleFocusMode: () => void;
  toasts: ToastMessage[];
  addToast: (type: 'info' | 'success' | 'warning' | 'error', title: string, message: string) => void;
  removeToast: (id: string) => void;
  aiMode: 'connected' | 'demo';
  telemetry: TelemetryData | null;
  refreshTelemetry: () => Promise<void>;
}

const defaultStudent: UserProfile = {
  id: 'student-1',
  name: 'Alex Chen',
  email: 'alex.chen@student.edu',
  role: 'student',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  institution: 'Stanford Institute of Technology',
  streakDays: 8,
};

const defaultTeacher: UserProfile = {
  id: 'teacher-1',
  name: 'Dr. Elena Rostova',
  email: 'elena.rostova@university.edu',
  role: 'teacher',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  institution: 'Stanford Institute of Technology',
  department: 'Computer Science & Engineering',
};

const defaultAdmin: UserProfile = {
  id: 'admin-1',
  name: 'Dean Marcus Vance',
  email: 'admin@university.edu',
  role: 'admin',
  institution: 'Stanford Institute of Technology',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('student');
  const [currentUser, setCurrentUser] = useState<UserProfile>(defaultStudent);
  const [activeView, setActiveView] = useState<string>('landing');
  const [sessionCode, setSessionCode] = useState<string>('FOCUS-8492');
  const [activeSession, setActiveSession] = useState<ClassSession | null>(null);
  const [pulseData, setPulseData] = useState<ClassPulseData | null>(null);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [aiMode, setAiMode] = useState<'connected' | 'demo'>('demo');
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);

  const addToast = (type: 'info' | 'success' | 'warning' | 'error', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'student') {
      setCurrentUser(defaultStudent);
      setActiveView('student_dashboard');
    } else if (newRole === 'teacher') {
      setCurrentUser(defaultTeacher);
      setActiveView('teacher_dashboard');
    } else {
      setCurrentUser(defaultAdmin);
      setActiveView('admin_dashboard');
    }
    addToast('info', `Switched Role to ${newRole.toUpperCase()}`, `Now previewing as ${newRole === 'student' ? defaultStudent.name : newRole === 'teacher' ? defaultTeacher.name : defaultAdmin.name}`);
  };

  const refreshActiveSession = async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionCode}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.session) {
          setActiveSession(data.session);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch active session:', err);
    }
  };

  const refreshPulse = async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionCode}/pulse`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.pulse) {
          setPulseData(data.pulse);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch pulse:', err);
    }
  };

  const refreshTelemetry = async () => {
    try {
      const res = await fetch('/api/telemetry');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setTelemetry(data.data);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch telemetry:', err);
    }
  };

  // Check backend health and AI mode
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setAiMode(data.mode === 'connected' ? 'connected' : 'demo');
        }
      } catch (err) {
        setAiMode('demo');
      }
    };
    checkHealth();
    refreshActiveSession();
    refreshPulse();
    refreshTelemetry();
  }, [sessionCode]);

  // Periodic lightweight poll for active session pulse when in teacher or student room
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeView === 'active_classroom' || activeView === 'live_control') {
        refreshPulse();
        refreshActiveSession();
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [activeView, sessionCode]);

  const toggleFocusMode = () => {
    setIsFocusMode((prev) => {
      const next = !prev;
      if (next) {
        addToast('success', 'Focus Mode Activated', 'Distractions hidden. In-class companion is primed for active comprehension.');
      } else {
        addToast('info', 'Focus Mode Exited', 'Full navigation restored.');
      }
      return next;
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        role,
        switchRole,
        activeView,
        setActiveView,
        sessionCode,
        setSessionCode,
        activeSession,
        refreshActiveSession,
        pulseData,
        refreshPulse,
        isFocusMode,
        toggleFocusMode,
        toasts,
        addToast,
        removeToast,
        aiMode,
        telemetry,
        refreshTelemetry,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
