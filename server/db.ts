// In-memory persistent datastore for FocusClass AI with realistic seed data
// Provides normalized data collections, role checks, session code generation, and Class Pulse metrics.

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  institution: string;
  department?: string;
  streakDays?: number;
}

export interface Classroom {
  id: string;
  code: string; // e.g. "CS-301"
  name: string;
  courseTitle: string;
  teacherId: string;
  teacherName: string;
  activeSessionCode?: string;
  topics: string[];
  description: string;
  studentCount: number;
}

export interface ClassSession {
  id: string;
  classroomCode: string;
  sessionCode: string; // 6-digit code for quick student join e.g. "FOCUS-8492"
  title: string;
  currentTopic: string;
  learningObjective: string;
  status: 'scheduled' | 'active' | 'paused' | 'ended';
  startedAt: string;
  endedAt?: string;
  activeQuestionId?: string;
  announcement?: string;
  materials: {
    id: string;
    title: string;
    type: 'slides' | 'notes' | 'diagram' | 'code';
    content: string;
  }[];
}

export interface SessionParticipant {
  sessionId: string;
  studentId: string;
  studentName: string;
  joinedAt: string;
  status: 'active' | 'away' | 'focus_mode';
  focusScore: number; // 0-100%
  completedChecks: number;
}

export interface Question {
  id: string;
  sessionId?: string;
  classroomCode?: string;
  topic: string;
  conceptTag: string;
  question: string;
  type: 'mcq' | 'teachback' | 'misconception' | 'exit_ticket';
  options?: string[];
  correctAnswer?: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPublished: boolean;
}

export interface StudentResponse {
  id: string;
  sessionId: string;
  questionId: string;
  studentId: string;
  studentName: string;
  answer: string;
  isCorrect?: boolean;
  score?: number;
  submittedAt: string;
  conceptTag: string;
  teachBackFeedback?: any;
}

export interface LearningMemoryItem {
  id: string;
  studentId: string;
  sessionId: string;
  topic: string;
  course: string;
  date: string;
  masteryPercentage: number;
  masteryLevel: string;
  summary: string;
  strengths: string[];
  knowledgeGaps: string[];
  revisionTasks: {
    id: string;
    title: string;
    action: string;
    dueInDays: number;
    completed: boolean;
  }[];
}

export interface TelemetryMetric {
  endpoint: string;
  method: string;
  statusCode: number;
  durationMs: number;
  timestamp: string;
  isError: boolean;
}

// -------------------------------------------------------------
// Database In-Memory Store
// -------------------------------------------------------------
class DatabaseStore {
  users: Map<string, UserProfile> = new Map();
  classrooms: Map<string, Classroom> = new Map();
  sessions: Map<string, ClassSession> = new Map();
  participants: Map<string, SessionParticipant[]> = new Map(); // sessionId -> participants
  questions: Map<string, Question> = new Map();
  responses: StudentResponse[] = [];
  learningMemories: Map<string, LearningMemoryItem[]> = new Map(); // studentId -> memories
  telemetryLogs: TelemetryMetric[] = [];

  constructor() {
    this.seedDefaultData();
  }

  seedDefaultData() {
    // 1. Seed Users
    const teacher: UserProfile = {
      id: 'teacher-1',
      name: 'Dr. Elena Rostova',
      email: 'elena.rostova@university.edu',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      institution: 'Stanford Institute of Technology',
      department: 'Computer Science & Engineering',
    };

    const student1: UserProfile = {
      id: 'student-1',
      name: 'Alex Chen',
      email: 'alex.chen@student.edu',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      institution: 'Stanford Institute of Technology',
      streakDays: 8,
    };

    const student2: UserProfile = {
      id: 'student-2',
      name: 'Maya Patel',
      email: 'maya.patel@student.edu',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      institution: 'Stanford Institute of Technology',
      streakDays: 14,
    };

    const admin: UserProfile = {
      id: 'admin-1',
      name: 'Dean Marcus Vance',
      email: 'admin@university.edu',
      role: 'admin',
      institution: 'Stanford Institute of Technology',
    };

    this.users.set(teacher.id, teacher);
    this.users.set(student1.id, student1);
    this.users.set(student2.id, student2);
    this.users.set(admin.id, admin);

    // 2. Seed Classroom
    const classroom1: Classroom = {
      id: 'cls-1',
      code: 'CS-301',
      name: 'Advanced Systems & OS Kernel',
      courseTitle: 'CS 301: Operating Systems & Concurrency',
      teacherId: teacher.id,
      teacherName: teacher.name,
      activeSessionCode: 'FOCUS-8492',
      topics: ['Deadlocks & Coffman Conditions', 'Virtual Memory Paging', 'Thread Scheduling & Spinlocks'],
      description: 'Undergraduate core engineering course examining multi-threaded synchronization and synchronization primitives.',
      studentCount: 38,
    };

    const classroom2: Classroom = {
      id: 'cls-2',
      code: 'CS-202',
      name: 'Data Structures & Algorithms',
      courseTitle: 'CS 202: Self-Balancing Trees & Graphs',
      teacherId: teacher.id,
      teacherName: teacher.name,
      topics: ['Red-Black Trees', 'Dijkstra Shortest Path', 'Topological Sort'],
      description: 'Fundamental algorithmic techniques with asymptotic proofs and real-time visualization.',
      studentCount: 42,
    };

    this.classrooms.set(classroom1.code, classroom1);
    this.classrooms.set(classroom2.code, classroom2);

    // 3. Seed Live Session
    const liveSession: ClassSession = {
      id: 'sess-1',
      classroomCode: 'CS-301',
      sessionCode: 'FOCUS-8492',
      title: 'Deadlock Detection, Prevention & Banker\'s Algorithm',
      currentTopic: 'Coffman Deadlock Conditions & Resource Graphs',
      learningObjective: 'Master the 4 Coffman conditions, identify circular wait graph cycles, and explain deadlock avoidance in multi-threaded code.',
      status: 'active',
      startedAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
      activeQuestionId: 'q-live-1',
      announcement: 'Class Comprehension Check #2 is now live! Open your Teach-Back companion.',
      materials: [
        {
          id: 'mat-1',
          title: 'Lecture Slide 14: Coffman Conditions Matrix',
          type: 'slides',
          content: '1. Mutual Exclusion: non-shareable resource. 2. Hold and Wait: thread holds R1 while asking for R2. 3. No Preemption: resources cannot be forcibly seized. 4. Circular Wait: closed directed cycle of dependency.',
        },
        {
          id: 'mat-2',
          title: 'Code Example: Mutex Deadlock in C/POSIX',
          type: 'code',
          content: 'pthread_mutex_lock(&lockA);\npthread_mutex_lock(&lockB);\n// ... conflicting order in Thread 2 triggers circular hold',
        },
        {
          id: 'mat-3',
          title: 'Architecture Diagram: Wait-For Graph (WFG)',
          type: 'diagram',
          content: 'Vertices represent threads. Directed edge T1 -> T2 signifies T1 waits for resource held by T2. Cycle indicates deadlock.',
        },
      ],
    };

    this.sessions.set(liveSession.sessionCode, liveSession);

    // 4. Seed Questions
    const q1: Question = {
      id: 'q-live-1',
      sessionId: liveSession.id,
      classroomCode: 'CS-301',
      topic: 'Deadlocks',
      conceptTag: 'Coffman Conditions',
      question: 'Which of the following conditions is NOT required for a Coffman deadlock to manifest?',
      type: 'mcq',
      options: [
        'A: Mutual exclusion of resources',
        'B: Hold and wait condition',
        'C: Preemption of currently locked resources',
        'D: Circular wait chain among processes',
      ],
      correctAnswer: 'C: Preemption of currently locked resources',
      explanation: 'A deadlock strictly requires NO PREEMPTION. If the OS can forcibly preempt held resources, the circular wait cycle is automatically broken.',
      difficulty: 'intermediate',
      isPublished: true,
    };

    const q2: Question = {
      id: 'q-live-2',
      sessionId: liveSession.id,
      classroomCode: 'CS-301',
      topic: 'Deadlocks',
      conceptTag: 'Teach-Back Explanation',
      question: 'Explain Coffman deadlock in your own words, as if explaining it to a fellow engineering classmate.',
      type: 'teachback',
      explanation: 'Focus on mutual waiting, resource locking, and why no process can proceed without external intervention.',
      difficulty: 'intermediate',
      isPublished: true,
    };

    const q3: Question = {
      id: 'q-live-3',
      sessionId: liveSession.id,
      classroomCode: 'CS-301',
      topic: 'Deadlocks',
      conceptTag: 'Resource Graphs',
      question: 'In a Resource Allocation Graph, if each resource type has MULTIPLE instances and there is a cycle, does that guarantee a deadlock?',
      type: 'misconception',
      options: [
        'A: Yes, any cycle guarantees a deadlock under all conditions',
        'B: No, with multiple instances, a cycle is a necessary condition but not sufficient',
        'C: No, cycles only matter in single-threaded processes',
        'D: Yes, but only in Linux kernels',
      ],
      correctAnswer: 'B: No, with multiple instances, a cycle is a necessary condition but not sufficient',
      explanation: 'If other threads hold free instances of the resource and finish without entering the cycle, the resources can be released and the cycle clears.',
      difficulty: 'advanced',
      isPublished: true,
    };

    this.questions.set(q1.id, q1);
    this.questions.set(q2.id, q2);
    this.questions.set(q3.id, q3);

    // 5. Seed Participants for Session
    const sessionParticipants: SessionParticipant[] = [
      {
        sessionId: liveSession.id,
        studentId: student1.id,
        studentName: student1.name,
        joinedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        status: 'focus_mode',
        focusScore: 96,
        completedChecks: 2,
      },
      {
        sessionId: liveSession.id,
        studentId: student2.id,
        studentName: student2.name,
        joinedAt: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
        status: 'active',
        focusScore: 92,
        completedChecks: 2,
      },
      {
        sessionId: liveSession.id,
        studentId: 'student-3',
        studentName: 'Devon Vance',
        joinedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        status: 'focus_mode',
        focusScore: 98,
        completedChecks: 2,
      },
      {
        sessionId: liveSession.id,
        studentId: 'student-4',
        studentName: 'Zoe Thorne',
        joinedAt: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
        status: 'active',
        focusScore: 84,
        completedChecks: 1,
      },
      {
        sessionId: liveSession.id,
        studentId: 'student-5',
        studentName: 'Liam Morales',
        joinedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'focus_mode',
        focusScore: 90,
        completedChecks: 2,
      },
      {
        sessionId: liveSession.id,
        studentId: 'student-6',
        studentName: 'Aria Takahashi',
        joinedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        status: 'away',
        focusScore: 78,
        completedChecks: 1,
      },
    ];

    this.participants.set(liveSession.sessionCode, sessionParticipants);

    // 6. Seed In-Class Responses
    this.responses.push(
      {
        id: 'resp-1',
        sessionId: liveSession.id,
        questionId: q1.id,
        studentId: student1.id,
        studentName: student1.name,
        answer: 'C: Preemption of currently locked resources',
        isCorrect: true,
        score: 100,
        submittedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        conceptTag: 'Coffman Conditions',
      },
      {
        id: 'resp-2',
        sessionId: liveSession.id,
        questionId: q1.id,
        studentId: student2.id,
        studentName: student2.name,
        answer: 'C: Preemption of currently locked resources',
        isCorrect: true,
        score: 100,
        submittedAt: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
        conceptTag: 'Coffman Conditions',
      },
      {
        id: 'resp-3',
        sessionId: liveSession.id,
        questionId: q1.id,
        studentId: 'student-3',
        studentName: 'Devon Vance',
        answer: 'C: Preemption of currently locked resources',
        isCorrect: true,
        score: 100,
        submittedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        conceptTag: 'Coffman Conditions',
      },
      {
        id: 'resp-4',
        sessionId: liveSession.id,
        questionId: q1.id,
        studentId: 'student-4',
        studentName: 'Zoe Thorne',
        answer: 'B: Hold and wait condition', // incorrect
        isCorrect: false,
        score: 0,
        submittedAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
        conceptTag: 'Coffman Conditions',
      },
      {
        id: 'resp-5',
        sessionId: liveSession.id,
        questionId: q1.id,
        studentId: 'student-5',
        studentName: 'Liam Morales',
        answer: 'C: Preemption of currently locked resources',
        isCorrect: true,
        score: 100,
        submittedAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
        conceptTag: 'Coffman Conditions',
      },
      {
        id: 'resp-6',
        sessionId: liveSession.id,
        questionId: q1.id,
        studentId: 'student-6',
        studentName: 'Aria Takahashi',
        answer: 'A: Mutual exclusion of resources', // incorrect
        isCorrect: false,
        score: 0,
        submittedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
        conceptTag: 'Coffman Conditions',
      }
    );

    // 7. Seed Student Learning Memory
    const memoryAlex: LearningMemoryItem = {
      id: 'mem-alex-1',
      studentId: student1.id,
      sessionId: 'sess-prev',
      topic: 'Binary Search Trees & Balancing',
      course: 'CS 202: Data Structures',
      date: '2026-10-07',
      masteryPercentage: 86,
      masteryLevel: 'Proficient',
      summary: 'Demonstrated solid grasp of node rotation and recursive binary search, with slight hesitation during double-rotation AVL balancing cases.',
      strengths: [
        'Tree insertion boundary checks',
        'Asymptotic O(log n) search proofs',
      ],
      knowledgeGaps: [
        'Left-Right (LR) double rotations in AVL trees',
        'Proper deletion of nodes with two children',
      ],
      revisionTasks: [
        {
          id: 'rev-1',
          title: 'Double-Rotation Trace',
          action: 'Hand-trace inserting {10, 30, 20} into an empty AVL tree on paper.',
          dueInDays: 1,
          completed: false,
        },
        {
          id: 'rev-2',
          title: 'Inorder Successor Quiz',
          action: 'Explain why the in-order successor always has at most one child.',
          dueInDays: 3,
          completed: true,
        },
      ],
    };

    this.learningMemories.set(student1.id, [memoryAlex]);
  }

  // Helper Methods
  getUser(id: string): UserProfile | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): UserProfile | undefined {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) return user;
    }
    return undefined;
  }

  getSession(code: string): ClassSession | undefined {
    return this.sessions.get(code.toUpperCase());
  }

  getParticipants(sessionCode: string): SessionParticipant[] {
    return this.participants.get(sessionCode.toUpperCase()) || [];
  }

  addParticipant(sessionCode: string, participant: SessionParticipant) {
    const list = this.getParticipants(sessionCode);
    const existingIdx = list.findIndex((p) => p.studentId === participant.studentId);
    if (existingIdx >= 0) {
      list[existingIdx] = participant;
    } else {
      list.push(participant);
    }
    this.participants.set(sessionCode.toUpperCase(), list);
  }

  recordResponse(response: StudentResponse) {
    this.responses.push(response);
  }

  getClassPulse(sessionCode: string) {
    const session = this.getSession(sessionCode);
    const participants = this.getParticipants(sessionCode);
    const activeParticipants = participants.filter((p) => p.status !== 'away');
    const responses = this.responses.filter((r) => r.sessionId === session?.id || r.sessionId === 'sess-1');

    const totalResponses = responses.length;
    const correctResponses = responses.filter((r) => r.isCorrect === true).length;
    const incorrectResponses = responses.filter((r) => r.isCorrect === false).length;
    const accuracy = totalResponses > 0 ? Math.round((correctResponses / totalResponses) * 100) : 0;

    // Concept breakdown
    const conceptMap: Record<string, { total: number; correct: number; needReteach: boolean }> = {};
    for (const r of responses) {
      const tag = r.conceptTag || 'General';
      if (!conceptMap[tag]) {
        conceptMap[tag] = { total: 0, correct: 0, needReteach: false };
      }
      conceptMap[tag].total += 1;
      if (r.isCorrect) conceptMap[tag].correct += 1;
    }

    const conceptHeatmap = Object.entries(conceptMap).map(([concept, data]) => {
      const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
      return {
        concept,
        total: data.total,
        accuracyPercentage: pct,
        status: pct >= 80 ? 'Mastered' : pct >= 60 ? 'Developing' : 'Attention Needed',
        recommendReteach: pct < 70,
      };
    });

    const averageFocusScore = participants.length > 0
      ? Math.round(participants.reduce((acc, p) => acc + p.focusScore, 0) / participants.length)
      : 92;

    return {
      sessionCode,
      status: session?.status || 'active',
      currentTopic: session?.currentTopic || 'Operating Systems: Deadlocks',
      totalEnrolled: 38,
      activeInClass: participants.length,
      focusModeActiveCount: participants.filter((p) => p.status === 'focus_mode').length,
      averageFocusScore,
      participationRate: participants.length > 0 ? Math.round((participants.length / 38) * 100) : 85,
      totalResponses,
      correctResponses,
      incorrectResponses,
      accuracy,
      conceptHeatmap,
      frequentlyMissedItems: [
        {
          questionText: 'Preemption policy vs non-preemption in Coffman Conditions',
          missRate: '33%',
          suggestedRemedy: 'Highlight that Preemption breaks deadlock, whereas No-Preemption causes it.',
        },
      ],
      liveFeed: responses.slice(-6).reverse(),
    };
  }

  logTelemetry(metric: TelemetryMetric) {
    this.telemetryLogs.push(metric);
    if (this.telemetryLogs.length > 1000) {
      this.telemetryLogs.shift();
    }
  }

  getTelemetryStats() {
    const total = this.telemetryLogs.length;
    const errors = this.telemetryLogs.filter((l) => l.isError).length;
    const avgDuration = total > 0
      ? Math.round(this.telemetryLogs.reduce((acc, l) => acc + l.durationMs, 0) / total)
      : 24;

    const endpointCounts: Record<string, number> = {};
    for (const l of this.telemetryLogs) {
      endpointCounts[l.endpoint] = (endpointCounts[l.endpoint] || 0) + 1;
    }

    return {
      totalRequests: total,
      totalErrors: errors,
      errorRatePercentage: total > 0 ? Number(((errors / total) * 100).toFixed(2)) : 0,
      averageLatencyMs: avgDuration,
      activeSessions: this.sessions.size,
      activeUsers: this.users.size,
      endpointTraffic: endpointCounts,
      uptimeSeconds: Math.round(process.uptime()),
    };
  }
}

export const db = new DatabaseStore();
