import { ContentIndex, LessonSummary, ModuleSummary } from '../content/content.model';

/**
 * Lesson progress is derived, never stored: a lesson is completed once every one of its questions
 * has a review card, because the first answer inside a lesson is what creates the card.
 * That way progress syncs between devices for free and can never disagree with the review data.
 */
export interface Progress {
  done: number;
  total: number;
}

export interface LessonRef {
  module: ModuleSummary;
  lesson: LessonSummary;
}

export function isLessonCompleted(lesson: LessonSummary, answered: ReadonlySet<string>): boolean {
  return lesson.questionIds.every((id) => answered.has(id));
}

export function moduleProgress(module: ModuleSummary, answered: ReadonlySet<string>): Progress {
  const done = module.lessons.filter((lesson) => isLessonCompleted(lesson, answered)).length;
  return { done, total: module.lessons.length };
}

/** First lesson not yet completed, in roadmap order. */
export function nextLesson(index: ContentIndex, answered: ReadonlySet<string>): LessonRef | undefined {
  for (const module of index.phases.flatMap((phase) => phase.modules)) {
    const lesson = module.lessons.find((l) => !isLessonCompleted(l, answered));
    if (lesson) return { module, lesson };
  }
  return undefined;
}
