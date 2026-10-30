import { Question } from '../content/content.model';

/** Design decisions have no single right answer, so the learner grades them in the review. */
export type Grade = 'correct' | 'incorrect' | 'self-assessed';

/**
 * @param choice option index for quiz and design-decision; 1-based line number for find-the-bug.
 */
export function grade(question: Question, choice: number): Grade {
  if (question.type === 'design-decision') {
    return 'self-assessed';
  }
  return choice === question.answer ? 'correct' : 'incorrect';
}

/** Fisher-Yates shuffle. Content authors tend to put the right answer first; this hides that pattern. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
