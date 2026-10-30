// Shape of the compiled content that the app reads from /content/*.json.
// Produced by scripts/build-content.ts from the repo-level content/ folder.

export type QuestionType = 'quiz' | 'find-the-bug' | 'design-decision';

interface QuestionBase {
  id: string;
  prompt: string;
  code?: string;
  explanation: string;
}

/** Multiple choice; `answer` is the index of the correct option. */
export interface QuizQuestion extends QuestionBase {
  type: 'quiz';
  options: string[];
  answer: number;
}

/** The learner picks the faulty line; `answer` is a 1-based line number of `code`. */
export interface FindTheBugQuestion extends QuestionBase {
  type: 'find-the-bug';
  code: string;
  answer: number;
}

/** Self-assessed; `answer` is the index of the recommended option. */
export interface DesignDecisionQuestion extends QuestionBase {
  type: 'design-decision';
  options: string[];
  answer: number;
}

export type Question = QuizQuestion | FindTheBugQuestion | DesignDecisionQuestion;

export interface LessonSummary {
  id: string;
  title: string;
  minutes: number;
}

export interface Lesson extends LessonSummary {
  moduleId: string;
  sources: string[];
  /** Lesson body, rendered from Markdown at build time. */
  html: string;
  questions: Question[];
}

export interface ModuleSummary {
  id: string;
  title: string;
  hours: number;
  /** False when the module is planned in the roadmap but has no content yet. */
  available: boolean;
  description?: string;
  lessons: LessonSummary[];
}

export interface Phase {
  id: string;
  title: string;
  modules: ModuleSummary[];
}

/** Compiled to /content/index.json. */
export interface ContentIndex {
  title: string;
  phases: Phase[];
}
