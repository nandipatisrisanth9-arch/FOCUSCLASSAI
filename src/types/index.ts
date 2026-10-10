export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  institution: string;
  department?: string;
  streakDays?: number;
}

export interface LessonMaterial {
  id: string;
  title: string;
  type: 'slides' | 'notes' | 'diagram' | 'code';
  content: string;
}

export interface ClassSession {
  id: string;
  classroomCode: string;
  sessionCode: string;
  title: string;
  currentTopic: string;
  learningObjective: string;
  status: 'scheduled' | 'active' | 'paused' | 'ended';
  startedAt: string;
  endedAt?: string;
  activeQuestionId?: string;
  announcement?: string;
  materials: LessonMaterial[];
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

export interface TeachBackFeedback {
  isDemo: boolean;
  score: number;
  conceptualCorrectness: 'accurate' | 'partially_accurate' | 'needs_work';
  logicalClarity: 'high' | 'medium' | 'needs_structure';
  coverageOfKeyIdeas: {
    covered: string[];
    missing: string[];
  };
  strengths: string[];
  misconceptions: string[];
  simpleExplanation: string;
  concreteExample: string;
  followUpQuestion: string;
  confidenceEstimate: number;
  methodNote: string;
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
  teachBackFeedback?: TeachBackFeedback;
}

export interface ConceptHeatmapItem {
  concept: string;
  total: number;
  accuracyPercentage: number;
  status: 'Mastered' | 'Developing' | 'Attention Needed';
  recommendReteach: boolean;
}

export interface ClassPulseData {
  sessionCode: string;
  status: 'scheduled' | 'active' | 'paused' | 'ended';
  currentTopic: string;
  totalEnrolled: number;
  activeInClass: number;
  focusModeActiveCount: number;
  averageFocusScore: number;
  participationRate: number;
  totalResponses: number;
  correctResponses: number;
  incorrectResponses: number;
  accuracy: number;
  conceptHeatmap: ConceptHeatmapItem[];
  frequentlyMissedItems: {
    questionText: string;
    missRate: string;
    suggestedRemedy: string;
  }[];
  liveFeed: StudentResponse[];
}

export interface RevisionTask {
  id: string;
  title: string;
  action: string;
  dueInDays: number;
  completed: boolean;
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
  revisionTasks: RevisionTask[];
}

export interface TelemetryData {
  totalRequests: number;
  totalErrors: number;
  errorRatePercentage: number;
  averageLatencyMs: number;
  activeSessions: number;
  activeUsers: number;
  endpointTraffic: Record<string, number>;
  uptimeSeconds: number;
}
