import { Question } from '../content/content.model';
import { grade, shuffle } from './grading';

const quiz: Question = { id: 'q', type: 'quiz', prompt: '?', options: ['a', 'b', 'c'], answer: 1, explanation: '.' };
const bug: Question = { id: 'b', type: 'find-the-bug', prompt: '?', code: 'x\ny\nz', answer: 3, explanation: '.' };
const decision: Question = { id: 'd', type: 'design-decision', prompt: '?', options: ['a', 'b'], answer: 0, explanation: '.' };

describe('grade', () => {
  it('grades a quiz by option index', () => {
    expect(grade(quiz, 1)).toBe('correct');
    expect(grade(quiz, 0)).toBe('incorrect');
  });

  it('grades find-the-bug by 1-based line number', () => {
    expect(grade(bug, 3)).toBe('correct');
    expect(grade(bug, 2)).toBe('incorrect');
  });

  it('never auto-grades a design decision', () => {
    expect(grade(decision, 0)).toBe('self-assessed');
    expect(grade(decision, 1)).toBe('self-assessed');
  });
});

describe('shuffle', () => {
  it('returns a permutation without mutating the input', () => {
    const input = [0, 1, 2, 3, 4];

    const result = shuffle(input);

    expect([...result].sort()).toEqual(input);
    expect(input).toEqual([0, 1, 2, 3, 4]);
  });

  it('is deterministic for a given random source', () => {
    const alwaysZero = () => 0;

    // Fisher-Yates with j = 0 at every step rotates the first element to the end.
    expect(shuffle(['a', 'b', 'c'], alwaysZero)).toEqual(['b', 'c', 'a']);
  });
});
