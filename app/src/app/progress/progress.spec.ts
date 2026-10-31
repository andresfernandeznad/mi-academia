import { describe, expect, it } from 'vitest';
import { indexFixture } from '../content/content.fixtures';
import { isLessonCompleted, moduleProgress, nextLesson } from './progress';

const [javaModule] = indexFixture.phases[0].modules;
const [javaHoy, tipos] = javaModule.lessons;

describe('isLessonCompleted', () => {
  it('is false while some question of the lesson has no card', () => {
    expect(isLessonCompleted(javaHoy, new Set(['java-hoy-1']))).toBe(false);
  });

  it('is true once every question of the lesson has a card', () => {
    expect(isLessonCompleted(javaHoy, new Set(['java-hoy-1', 'java-hoy-2', 'tipos-1']))).toBe(true);
  });
});

describe('moduleProgress', () => {
  it('counts completed lessons out of the total', () => {
    expect(moduleProgress(javaModule, new Set(['java-hoy-1', 'java-hoy-2']))).toEqual({ done: 1, total: 2 });
  });
});

describe('nextLesson', () => {
  it('starts with the first lesson when nothing is answered', () => {
    expect(nextLesson(indexFixture, new Set())).toEqual({ module: javaModule, lesson: javaHoy });
  });

  it('skips completed lessons, in roadmap order', () => {
    expect(nextLesson(indexFixture, new Set(['java-hoy-1', 'java-hoy-2']))).toEqual({ module: javaModule, lesson: tipos });
  });

  it('returns a half-answered lesson before later ones', () => {
    expect(nextLesson(indexFixture, new Set(['java-hoy-1', 'tipos-1', 'tipos-2'])))
      .toEqual({ module: javaModule, lesson: javaHoy });
  });

  it('is undefined when every available lesson is completed', () => {
    const all = new Set(javaModule.lessons.flatMap((l) => l.questionIds));
    expect(nextLesson(indexFixture, all)).toBeUndefined();
  });
});
