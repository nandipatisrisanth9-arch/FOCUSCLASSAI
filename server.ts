import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import {
  evaluateTeachBack,
  generateDraftQuestions,
  askLearningAssistant,
  explainVisionNotes,
  generateLearningMemory,
  isAiConnected,
} from './server/aiService.ts';
import { db } from './server/db.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Allow payload sizes for vision image uploads (up to 15mb)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Telemetry & Timing Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    if (req.path.startsWith('/api')) {
      const duration = Date.now() - start;
      db.logTelemetry({
        endpoint: req.baseUrl + req.path,
        method: req.method,
        statusCode: res.statusCode,
        durationMs: duration,
        timestamp: new Date().toISOString(),
        isError: res.statusCode >= 400,
      });
    }
  });
  next();
});

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// 1. Health & Mode Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    mode: isAiConnected() ? 'connected' : 'demo',
    isAiConnected: isAiConnected(),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    name: 'FocusClass AI Platform',
  });
});

// 2. Telemetry and System Metrics
app.get('/api/telemetry', (req: Request, res: Response) => {
  const stats = db.getTelemetryStats();
  res.json({
    success: true,
    data: stats,
    aiEngine: isAiConnected() ? 'Gemini 3.8 Flash (Active)' : 'Pedagogical Heuristics Engine (Demo Mode)',
  });
});

// 3. User & Auth Profile
app.get('/api/auth/me', (req: Request, res: Response) => {
  const role = req.query.role as string || 'student';
  const userId = role === 'teacher' ? 'teacher-1' : role === 'admin' ? 'admin-1' : 'student-1';
  const user = db.getUser(userId);
  res.json({ success: true, user });
});

// 4. Classrooms
app.get('/api/classrooms', (req: Request, res: Response) => {
  const classrooms = Array.from(db.classrooms.values());
  res.json({ success: true, classrooms });
});

// 5. Session Details by Code
app.get('/api/sessions/:code', (req: Request, res: Response) => {
  const code = req.params.code;
  const session = db.getSession(code);
  if (!session) {
    return res.status(404).json({ success: false, message: 'Classroom session code not found.' });
  }

  const participants = db.getParticipants(code);
  const questions = Array.from(db.questions.values()).filter(
    (q) => q.classroomCode === session.classroomCode || q.sessionId === session.id
  );

  res.json({
    success: true,
    session,
    participantsCount: participants.length,
    questions,
  });
});

// 6. Join Session (Student)
app.post('/api/sessions/:code/join', (req: Request, res: Response) => {
  const code = req.params.code;
  const { studentId, studentName } = req.body;

  const session = db.getSession(code);
  if (!session) {
    return res.status(404).json({ success: false, message: 'Invalid session code. Please verify with your instructor.' });
  }

  const participant = {
    sessionId: session.id,
    studentId: studentId || `student-${Date.now()}`,
    studentName: studentName || 'Guest Student',
    joinedAt: new Date().toISOString(),
    status: 'focus_mode' as const,
    focusScore: 98,
    completedChecks: 0,
  };

  db.addParticipant(code, participant);

  res.json({
    success: true,
    message: 'Successfully joined classroom session.',
    session,
    participant,
  });
});

// 7. Teacher Session Controls (Start, Pause, Resume, End, Change Topic)
app.post('/api/sessions/:code/action', (req: Request, res: Response) => {
  const code = req.params.code;
  const { action, currentTopic, announcement, activeQuestionId } = req.body;
  const session = db.getSession(code);

  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found.' });
  }

  if (action === 'pause') session.status = 'paused';
  if (action === 'resume') session.status = 'active';
  if (action === 'end') {
    session.status = 'ended';
    session.endedAt = new Date().toISOString();
  }
  if (currentTopic) session.currentTopic = currentTopic;
  if (announcement !== undefined) session.announcement = announcement;
  if (activeQuestionId !== undefined) session.activeQuestionId = activeQuestionId;

  res.json({ success: true, session });
});

// 8. Submit Quiz / Teach-Back Response
app.post('/api/sessions/:code/responses', async (req: Request, res: Response) => {
  const code = req.params.code;
  const { questionId, studentId, studentName, answer, conceptTag } = req.body;

  const session = db.getSession(code);
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found.' });
  }

  const question = db.questions.get(questionId);
  const isMcq = question?.type === 'mcq' || question?.type === 'misconception';
  const isCorrect = isMcq && question?.correctAnswer ? answer.trim().startsWith(question.correctAnswer.slice(0, 2)) : true;

  const newResponse = {
    id: `resp-${Date.now()}`,
    sessionId: session.id,
    questionId,
    studentId: studentId || 'student-1',
    studentName: studentName || 'Alex Chen',
    answer,
    isCorrect,
    score: isCorrect ? 100 : 0,
    submittedAt: new Date().toISOString(),
    conceptTag: conceptTag || question?.conceptTag || 'General Concept',
  };

  db.recordResponse(newResponse);

  res.json({
    success: true,
    response: newResponse,
    explanation: question?.explanation,
  });
});

// 9. Class Pulse (Live Real-Time Analytics for Teachers)
app.get('/api/sessions/:code/pulse', (req: Request, res: Response) => {
  const code = req.params.code;
  const pulse = db.getClassPulse(code);
  res.json({ success: true, pulse });
});

// 10. AI Teach-Back Evaluation Endpoint
app.post('/api/ai/teachback', async (req: Request, res: Response) => {
  try {
    const { topic, concept, studentExplanation, lessonContext } = req.body;
    if (!studentExplanation || typeof studentExplanation !== 'string') {
      return res.status(400).json({ success: false, message: 'Student explanation text is required.' });
    }

    const evaluation = await evaluateTeachBack({
      topic: topic || 'Operating Systems: Deadlocks',
      concept: concept || 'Deadlock Definition & Circular Wait',
      studentExplanation,
      lessonContext,
    });

    res.json({ success: true, evaluation });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Teach-back evaluation failed.' });
  }
});

// 11. AI Question Generator for Teachers
app.post('/api/ai/generate-questions', async (req: Request, res: Response) => {
  try {
    const { topic, lessonMaterial, count, difficulty } = req.body;
    if (!lessonMaterial || typeof lessonMaterial !== 'string') {
      return res.status(400).json({ success: false, message: 'Lesson material content is required for grounding.' });
    }

    const result = await generateDraftQuestions({
      topic: topic || 'Operating Systems: Concurrency & Locks',
      lessonMaterial,
      count: count || 4,
      difficulty: difficulty || 'intermediate',
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Question generation failed.' });
  }
});

// 12. Contextual AI Learning Assistant
app.post('/api/ai/assistant', async (req: Request, res: Response) => {
  try {
    const { question, topic, level, lessonContext } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, message: 'Question prompt is required.' });
    }

    const result = await askLearningAssistant({
      question,
      topic: topic || 'Operating Systems',
      level: level || 'intermediate',
      lessonContext,
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'AI assistant request failed.' });
  }
});

// 13. Vision Notes & Whiteboard Explainer
app.post('/api/ai/vision-notes', async (req: Request, res: Response) => {
  try {
    const { imageBase64, prompt, topic } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Image base64 data is required.' });
    }

    const result = await explainVisionNotes({
      imageBase64,
      prompt,
      topic,
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Vision analysis failed.' });
  }
});

// 14. Learning Memory & Summary Synthesis
app.post('/api/ai/learning-summary', async (req: Request, res: Response) => {
  try {
    const { studentName, topic, quizScore, teachBackScore, demonstratedStrengths, missedConcepts } = req.body;

    const result = await generateLearningMemory({
      studentName: studentName || 'Alex Chen',
      topic: topic || 'Deadlocks & Concurrency',
      quizScore: quizScore || 85,
      teachBackScore: teachBackScore || 82,
      demonstratedStrengths: demonstratedStrengths || ['Mutual exclusion concept'],
      missedConcepts: missedConcepts || ['Preemption vs Non-preemption rule'],
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Learning summary failed.' });
  }
});

// 15. Student Learning Memory Items
app.get('/api/students/:id/memory', (req: Request, res: Response) => {
  const studentId = req.params.id;
  const memories = db.learningMemories.get(studentId) || db.learningMemories.get('student-1') || [];
  res.json({ success: true, memories });
});

// -------------------------------------------------------------
// FRONTEND SERVER SETUP (Vite middleware in dev / static in prod)
// -------------------------------------------------------------
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FocusClass AI] Server running on http://0.0.0.0:${PORT} (Mode: ${isProduction ? 'Production' : 'Development'})`);
  });
}

startServer().catch((err) => {
  console.error('[FocusClass AI] Failed to start server:', err);
  process.exit(1);
});
