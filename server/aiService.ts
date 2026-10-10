import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client when API key is provided
const geminiApiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

export function isAiConnected(): boolean {
  return !!ai && !!geminiApiKey;
}

function withTimeout<T>(promise: Promise<T>, ms: number = 6000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`AI generation timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// -------------------------------------------------------------
// 1. TEACH-BACK EVALUATION
// -------------------------------------------------------------
export interface TeachBackInput {
  topic: string;
  concept: string;
  studentExplanation: string;
  lessonContext?: string;
}

export interface TeachBackEvaluation {
  isDemo: boolean;
  score: number; // 0 - 100
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
  confidenceEstimate: number; // e.g. 88%
  methodNote: string;
}

export async function evaluateTeachBack(input: TeachBackInput): Promise<TeachBackEvaluation> {
  const { topic, concept, studentExplanation, lessonContext } = input;

  if (ai) {
    try {
      const prompt = `You are FocusClass AI, a compassionate and expert classroom pedagogy engine.
Evaluate a student's Teach-Back explanation where the student explains a concept in their own words.

Topic: ${topic}
Target Concept: ${concept}
Lesson Context: ${lessonContext || 'Standard undergraduate computer science / engineering curriculum'}
Student's Teach-Back Explanation: "${studentExplanation}"

Respond ONLY with valid JSON conforming to this structure:
{
  "score": <number between 30 and 100>,
  "conceptualCorrectness": "<accurate | partially_accurate | needs_work>",
  "logicalClarity": "<high | medium | needs_structure>",
  "coverageOfKeyIdeas": {
    "covered": ["<point 1>", "<point 2>"],
    "missing": ["<point 1>"]
  },
  "strengths": ["<what the student got right>"],
  "misconceptions": ["<any false assumptions detected>"],
  "simpleExplanation": "<clear, jargon-free 2-3 sentence explanation of the missing or key nuance>",
  "concreteExample": "<a vivid real-world analogy or everyday example>",
  "followUpQuestion": "<a single thoughtful question to deepen their intuition>",
  "confidenceEstimate": <number 70-98>
}`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
        6000
      );

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);
      return {
        isDemo: false,
        score: typeof parsed.score === 'number' ? parsed.score : 82,
        conceptualCorrectness: parsed.conceptualCorrectness || 'partially_accurate',
        logicalClarity: parsed.logicalClarity || 'medium',
        coverageOfKeyIdeas: parsed.coverageOfKeyIdeas || {
          covered: ['Identified main concept intuition'],
          missing: ['Formal boundary conditions'],
        },
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Good intuitive grasp.'],
        misconceptions: Array.isArray(parsed.misconceptions) ? parsed.misconceptions : [],
        simpleExplanation: parsed.simpleExplanation || 'Good start. Remember to highlight the underlying state transitions.',
        concreteExample: parsed.concreteExample || 'Think of a circular dining table where everyone waits for the adjacent fork.',
        followUpQuestion: parsed.followUpQuestion || 'What single condition would you eliminate first to break this cycle?',
        confidenceEstimate: parsed.confidenceEstimate || 85,
        methodNote: 'Evaluated using Gemini 3.8 Flash multi-rubric assessment.',
      };
    } catch (err) {
      console.warn('Gemini teach-back evaluation failed, falling back to pedagogical heuristic:', err);
    }
  }

  // Realistic Fallback heuristic
  const words = studentExplanation.trim().split(/\s+/).length;
  const lower = studentExplanation.toLowerCase();
  const hasKeywords = lower.includes('resource') || lower.includes('wait') || lower.includes('cycle') || lower.includes('node') || lower.includes('tree') || lower.includes('memory') || lower.includes('deadlock');

  const baseScore = Math.min(94, Math.max(55, Math.round(words * 2.2 + (hasKeywords ? 28 : 10))));

  return {
    isDemo: true,
    score: baseScore,
    conceptualCorrectness: baseScore > 78 ? 'accurate' : baseScore > 60 ? 'partially_accurate' : 'needs_work',
    logicalClarity: words > 25 ? 'high' : 'medium',
    coverageOfKeyIdeas: {
      covered: [
        'Recognized mutual waiting and dependent tasks',
        'Communicated the high-level impact on system progression',
      ],
      missing: [
        'Explicit mention of resource preemption or hold-and-wait condition',
      ],
    },
    strengths: [
      'Used conversational phrasing suitable for explaining to a peer',
      'Captured the core deadlock paradox without getting bogged in syntax',
    ],
    misconceptions: baseScore < 70 ? [
      'Be careful not to confuse deadlock (permanent block) with simple starvation (delay due to priority scheduling).'
    ] : [],
    simpleExplanation:
      'A deadlock occurs when a set of processes are permanently blocked because each is holding a resource needed by another in a circular chain. None can finish without the other yielding.',
    concreteExample:
      'Imagine a single-lane four-way intersection where four cars arrive simultaneously at each corner; each car waits for the car to its right to proceed first, so none can move.',
    followUpQuestion:
      'If you were designing an operating system scheduler, how would an ordering on resource IDs prevent this scenario?',
    confidenceEstimate: 88,
    methodNote: 'Heuristic demo evaluation (Connect GEMINI_API_KEY for live generative rubric analysis).',
  };
}

// -------------------------------------------------------------
// 2. QUESTION GENERATION
// -------------------------------------------------------------
export interface QuestionGenInput {
  topic: string;
  lessonMaterial: string;
  count?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface GeneratedQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'short_answer' | 'concept' | 'misconception' | 'exit_ticket';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  conceptTag: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isApproved: boolean;
}

export async function generateDraftQuestions(input: QuestionGenInput): Promise<{
  isDemo: boolean;
  questions: GeneratedQuestion[];
}> {
  const count = input.count || 4;

  if (ai) {
    try {
      const prompt = `You are FocusClass AI question generator for college & high-school teachers.
Generate ${count} classroom comprehension questions grounded strictly in the provided topic and material.
Include a variety of types: MCQ, misconception-checking question, and an exit ticket check.

Topic: ${input.topic}
Difficulty: ${input.difficulty || 'intermediate'}
Lesson Material:
${input.lessonMaterial}

Output ONLY valid JSON in this structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "type": "mcq",
      "options": ["A: ...", "B: ...", "C: ...", "D: ..."],
      "correctAnswer": "A: ...",
      "explanation": "Clear reason why this is correct and others are wrong",
      "conceptTag": "Specific concept tag",
      "difficulty": "intermediate"
    }
  ]
}`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        }),
        6000
      );

      const parsed = JSON.parse(response.text?.trim() || '{"questions": []}');
      if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return {
          isDemo: false,
          questions: parsed.questions.map((q: any, idx: number) => ({
            id: `gen-q-${Date.now()}-${idx}`,
            question: q.question,
            type: q.type || 'mcq',
            options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: q.correctAnswer || (q.options ? q.options[0] : 'Correct answer'),
            explanation: q.explanation || 'Detailed pedagogical explanation grounded in the text.',
            conceptTag: q.conceptTag || input.topic,
            difficulty: q.difficulty || input.difficulty || 'intermediate',
            isApproved: false,
          })),
        };
      }
    } catch (err) {
      console.warn('Gemini question generation failed, falling back:', err);
    }
  }

  // Realistic sample drafted questions
  return {
    isDemo: true,
    questions: [
      {
        id: `gen-q-${Date.now()}-1`,
        question: `Which of the following conditions is NOT strictly required for a Coffman deadlock to occur?`,
        type: 'mcq',
        options: [
          'A: Mutual exclusion on shared resources',
          'B: Hold and wait for additional resources',
          'C: Preemption of currently held resources',
          'D: Circular wait chain among processes',
        ],
        correctAnswer: 'C: Preemption of currently held resources',
        explanation: 'Deadlock requires NO preemption; allowing preemption actually solves or breaks deadlock conditions.',
        conceptTag: 'Coffman Conditions',
        difficulty: 'intermediate',
        isApproved: false,
      },
      {
        id: `gen-q-${Date.now()}-2`,
        question: `Common Misconception Check: If CPU utilization drops to near zero during high concurrency, is the system definitely in deadlock?`,
        type: 'misconception',
        options: [
          'A: Yes, zero CPU always signals a circular deadlock',
          'B: No, thrashing or all threads sleeping can also cause low utilization',
          'C: Yes, only deadlocks cause thread suspension',
          'D: No, operating systems automatically reboot on deadlock',
        ],
        correctAnswer: 'B: No, thrashing or all threads sleeping can also cause low utilization',
        explanation: 'Low utilization can arise from page thrashing, blocking I/O, or thread sleep locks without circular deadlock.',
        conceptTag: 'Diagnostic Misconceptions',
        difficulty: 'intermediate',
        isApproved: false,
      },
      {
        id: `gen-q-${Date.now()}-3`,
        question: `In resource allocation graphs, what does a cycle indicate when every resource type has exactly ONE single instance?`,
        type: 'mcq',
        options: [
          'A: A deadlock is possible, but not guaranteed',
          'B: A deadlock has definitely occurred',
          'C: The system is completely starvation-free',
          'D: Graph reduction is impossible',
        ],
        correctAnswer: 'B: A deadlock has definitely occurred',
        explanation: 'If each resource type has exactly one instance, a cycle is both necessary and sufficient condition for deadlock.',
        conceptTag: 'Resource Allocation Graph',
        difficulty: 'advanced',
        isApproved: false,
      },
      {
        id: `gen-q-${Date.now()}-4`,
        question: `Exit Ticket: Name one strategy that modern database engines use to break a detected deadlock cycle.`,
        type: 'exit_ticket',
        options: [
          'A: Terminate all database server processes immediately',
          'B: Select a victim transaction with lowest cost and roll it back',
          'C: Ignore locks and overwrite conflicting rows concurrently',
          'D: Wait indefinitely until the operating system steps in',
        ],
        correctAnswer: 'B: Select a victim transaction with lowest cost and roll it back',
        explanation: 'Database engines run cycle-detection (wait-for graphs) and choose a victim transaction to abort and roll back.',
        conceptTag: 'Deadlock Recovery',
        difficulty: 'beginner',
        isApproved: false,
      },
    ],
  };
}

// -------------------------------------------------------------
// 3. CONTEXTUAL AI LEARNING ASSISTANT
// -------------------------------------------------------------
export interface AssistantInput {
  question: string;
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  lessonContext?: string;
}

export interface AssistantResponse {
  isDemo: boolean;
  answer: string;
  analogy: string;
  keyTakeaways: string[];
  practiceChallenge: string;
}

export async function askLearningAssistant(input: AssistantInput): Promise<AssistantResponse> {
  const { question, topic, level, lessonContext } = input;

  if (ai) {
    try {
      const prompt = `You are the FocusClass AI in-class learning tutor.
A student asked: "${question}"
Current Class Topic: ${topic}
Student Comprehension Level: ${level}
Lesson Material: ${lessonContext || 'Classroom lecture context'}

Provide a clear, engaging explanation tailored for ${level} level.
Avoid fluff. Keep formatting structured and scannable.

Return ONLY JSON:
{
  "answer": "Clear explanation of 2-3 short paragraphs",
  "analogy": "A simple, creative analogy that clarifies the concept intuitively",
  "keyTakeaways": ["bullet 1", "bullet 2", "bullet 3"],
  "practiceChallenge": "One quick micro-question to check if they got it"
}`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        }),
        6000
      );

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return {
        isDemo: false,
        answer: parsed.answer || 'Here is the breakdown of the concept based on your lecture.',
        analogy: parsed.analogy || 'Imagine sharing tools on a workbench.',
        keyTakeaways: parsed.keyTakeaways || ['Core intuition', 'Practical implementation'],
        practiceChallenge: parsed.practiceChallenge || 'How would you explain this in one sentence?',
      };
    } catch (err) {
      console.warn('Gemini tutor failed, falling back:', err);
    }
  }

  return {
    isDemo: true,
    answer: `In **${topic}**, when you encounter "${question}", the fundamental intuition comes down to resource ordering and synchronization barriers. In high-performance software, we aim to prevent concurrent tasks from blocking each other without sacrificing thread safety.`,
    analogy: `Think of a library checkout desk with a single popular reference textbook: if Student A holds Book 1 waiting for Book 2, and Student B holds Book 2 waiting for Book 1, nobody leaves the library desk until someone sets a book down.`,
    keyTakeaways: [
      'Circular dependency is the root cause of systemic stall.',
      'Always enforce an established global ordering when acquiring multiple locks or shared resources.',
      'Timeouts and preemption policies keep systems responsive under unexpected loads.',
    ],
    practiceChallenge: `If three threads want locks {A, B, C}, what simple rule ensures they never form a circular cycle?`,
  };
}

// -------------------------------------------------------------
// 4. VISION / WHITEBOARD / NOTES EXPLANATION
// -------------------------------------------------------------
export interface VisionInput {
  imageBase64: string;
  prompt?: string;
  topic?: string;
}

export interface VisionExplanation {
  isDemo: boolean;
  detectedContent: string;
  stepByStepExplanation: string[];
  keyEquationsOrDiagrams: string[];
  learningTips: string[];
}

export async function explainVisionNotes(input: VisionInput): Promise<VisionExplanation> {
  const { imageBase64, prompt, topic } = input;

  if (ai && imageBase64) {
    try {
      // Clean base64 header if present
      const cleanData = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanData,
                },
              },
              {
                text: `You are FocusClass AI Vision Assistant. Analyze this photo taken by a student (board diagram, handwritten notes, textbook page, code, or math equations).
Topic context: ${topic || 'Classroom Lecture'}
Student question: ${prompt || 'Explain what is on the board and verify if there are any mistakes.'}

Return ONLY valid JSON:
{
  "detectedContent": "Summary of what is visually shown (e.g. State Machine Diagram, Binary Search Tree, Mathematical proof)",
  "stepByStepExplanation": ["Step 1 / Component 1 description", "Step 2 description", "Step 3 description"],
  "keyEquationsOrDiagrams": ["Key symbol/formula/node relationship identified"],
  "learningTips": ["Helpful revision advice or correction for what is written"]
}`,
              },
            ],
          },
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
        7000
      );

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return {
        isDemo: false,
        detectedContent: parsed.detectedContent || 'Identified classroom diagram and handwritten lecture notes.',
        stepByStepExplanation: parsed.stepByStepExplanation || ['Parsed diagram flow', 'Extracted logical components'],
        keyEquationsOrDiagrams: parsed.keyEquationsOrDiagrams || ['Visual node relationships'],
        learningTips: parsed.learningTips || ['Review the directional arrows carefully.'],
      };
    } catch (err) {
      console.warn('Gemini vision analysis failed, falling back:', err);
    }
  }

  return {
    isDemo: true,
    detectedContent: 'Handwritten Board Diagram: Resource Allocation Wait-For Graph with P1, P2 and Resources R1, R2.',
    stepByStepExplanation: [
      'Node P1 has an allocation edge directed from R1, indicating Process 1 currently holds an instance of Resource 1.',
      'Node P1 has a request edge pointing toward R2, meaning Process 1 is currently blocked awaiting Resource 2.',
      'Node P2 holds Resource 2 and requests Resource 1, creating a closed directed cycle {P1 -> R2 -> P2 -> R1 -> P1}.',
      'Because each resource has exactly 1 unit available, this graph confirms an active deadlock state.',
    ],
    keyEquationsOrDiagrams: [
      'Cycle: P1 → R2 → P2 → R1 → P1',
      'Available Resources Vector A = [0, 0]',
      'Request Matrix Q > Available Matrix A',
    ],
    learningTips: [
      'When copying graphs from the board, double-check arrow directions: Resource-to-Process means allocated, Process-to-Resource means requesting.',
      'Try breaking the cycle on paper by redirecting P2 to release R2 first before requesting R1.',
    ],
  };
}

// -------------------------------------------------------------
// 5. PERSONALIZED LEARNING MEMORY SYNTHESIS
// -------------------------------------------------------------
export interface SummaryInput {
  studentName: string;
  topic: string;
  quizScore: number; // e.g. 80%
  teachBackScore: number; // e.g. 85%
  demonstratedStrengths: string[];
  missedConcepts: string[];
}

export interface LearningSummaryResult {
  isDemo: boolean;
  masteryLevel: 'Novice' | 'Developing' | 'Proficient' | 'Mastery';
  masteryPercentage: number;
  highlightSummary: string;
  strengths: string[];
  knowledgeGaps: string[];
  recommendedRevisionActions: {
    title: string;
    action: string;
    estimatedMinutes: number;
    dueInDays: number;
  }[];
  spacedRepetitionDate: string;
}

export async function generateLearningMemory(input: SummaryInput): Promise<LearningSummaryResult> {
  const { studentName, topic, quizScore, teachBackScore, demonstratedStrengths, missedConcepts } = input;

  const combinedMastery = Math.round((quizScore * 0.45) + (teachBackScore * 0.55));

  if (ai) {
    try {
      const prompt = `You are FocusClass AI Learning Memory synthesizer.
Generate an honest, actionable learning summary for student: ${studentName}.
Topic: ${topic}
Quiz Score: ${quizScore}%
Teach-Back Score: ${teachBackScore}%
Mastery: ${combinedMastery}%
Strengths: ${demonstratedStrengths.join(', ')}
Gaps Identified: ${missedConcepts.join(', ')}

Return ONLY JSON:
{
  "masteryLevel": "${combinedMastery >= 85 ? 'Mastery' : combinedMastery >= 70 ? 'Proficient' : combinedMastery >= 50 ? 'Developing' : 'Novice'}",
  "masteryPercentage": ${combinedMastery},
  "highlightSummary": "Encouraging, precise 2-sentence summary of today's classroom performance",
  "strengths": ["string", "string"],
  "knowledgeGaps": ["string"],
  "recommendedRevisionActions": [
    {
      "title": "Action title",
      "action": "Concrete 1-sentence exercise",
      "estimatedMinutes": 5,
      "dueInDays": 2
    }
  ]
}`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        }),
        6000
      );

      const parsed = JSON.parse(response.text?.trim() || '{}');
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 2);

      return {
        isDemo: false,
        masteryLevel: parsed.masteryLevel || 'Proficient',
        masteryPercentage: combinedMastery,
        highlightSummary: parsed.highlightSummary || `Strong comprehension demonstrated in ${topic}. Solid conceptual explanation during Teach-Back.`,
        strengths: parsed.strengths || demonstratedStrengths,
        knowledgeGaps: parsed.knowledgeGaps || missedConcepts,
        recommendedRevisionActions: parsed.recommendedRevisionActions || [
          {
            title: 'Active Recall Check',
            action: `Write down the 4 Coffman conditions without checking lecture slides.`,
            estimatedMinutes: 5,
            dueInDays: 2,
          },
        ],
        spacedRepetitionDate: nextDate.toISOString().split('T')[0],
      };
    } catch (err) {
      console.warn('Gemini summary generation failed, falling back:', err);
    }
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 2);

  return {
    isDemo: true,
    masteryLevel: combinedMastery >= 85 ? 'Mastery' : combinedMastery >= 70 ? 'Proficient' : combinedMastery >= 50 ? 'Developing' : 'Novice',
    masteryPercentage: combinedMastery,
    highlightSummary: `You demonstrated solid intuition during today's session on ${topic}. Your Teach-Back showed clear peer-teaching phrasing with minor room to sharpen boundary definitions.`,
    strengths: demonstratedStrengths.length > 0 ? demonstratedStrengths : [
      'Grasped mutual dependency in multi-threaded workflows',
      'Recognized cyclic deadlock graphs accurately during quick checks',
    ],
    knowledgeGaps: missedConcepts.length > 0 ? missedConcepts : [
      'Preemption vs Non-preemption policy differences',
      'Calculating safe sequences in Dijkstra Banker\'s Algorithm',
    ],
    recommendedRevisionActions: [
      {
        title: 'Micro-Recall Flash Check',
        action: 'Review the 4 Coffman conditions and recite each one with a 10-second real-world analogy.',
        estimatedMinutes: 4,
        dueInDays: 2,
      },
      {
        title: 'Graph Trace Exercise',
        action: 'Trace a 3-process, 2-resource allocation graph to verify if a cycle is reachable.',
        estimatedMinutes: 8,
        dueInDays: 4,
      },
    ],
    spacedRepetitionDate: nextDate.toISOString().split('T')[0],
  };
}
