import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseLesson, validateQuestions } from './validators.ts';

const validLesson = `---
id: java-hoy
title: "Java hoy"
minutes: 8
sources:
  - https://dev.java/learn/
---
## Por qué importa
Texto.
## Idea central
Texto.
## Error típico
Texto.
## Fuentes
- https://dev.java/learn/
`;

describe('parseLesson', () => {
  it('parses frontmatter and keeps the markdown body', () => {
    const { lesson, errors } = parseLesson('01-java-hoy', validLesson);

    assert.deepEqual(errors, []);
    assert.equal(lesson?.id, 'java-hoy');
    assert.equal(lesson?.title, 'Java hoy');
    assert.equal(lesson?.minutes, 8);
    assert.deepEqual(lesson?.sources, ['https://dev.java/learn/']);
    assert.match(lesson?.markdown ?? '', /^## Por qué importa/);
  });

  it('rejects a file without frontmatter', () => {
    const { lesson, errors } = parseLesson('01-java-hoy', '## Por qué importa\n');

    assert.equal(lesson, undefined);
    assert.match(errors[0], /frontmatter/);
  });

  it('requires the slug to be NN-<id>', () => {
    const { errors } = parseLesson('01-otra-cosa', validLesson);

    assert.ok(errors.some((e) => e.includes('NN-java-hoy.md')));
  });

  it('requires minutes between 5 and 10', () => {
    const { errors } = parseLesson('01-java-hoy', validLesson.replace('minutes: 8', 'minutes: 25'));

    assert.ok(errors.some((e) => e.includes('minutes')));
  });

  it('requires 1 to 3 https sources', () => {
    const noSources = validLesson.replace('sources:\n  - https://dev.java/learn/\n', 'sources: []\n');
    const httpSource = validLesson.replace('https://dev.java/learn/\n---', 'http://dev.java/learn/\n---');

    assert.ok(parseLesson('01-java-hoy', noSources).errors.some((e) => e.includes('sources')));
    assert.ok(parseLesson('01-java-hoy', httpSource).errors.some((e) => e.includes('https')));
  });

  it('requires every mandatory section', () => {
    const { errors } = parseLesson('01-java-hoy', validLesson.replace('## Error típico', '## Otra cosa'));

    assert.ok(errors.some((e) => e.includes('## Error típico')));
  });
});

describe('validateQuestions', () => {
  const quiz = {
    id: 'java-hoy-1',
    type: 'quiz',
    prompt: '¿Qué es JShell?',
    options: ['Un REPL', 'Un IDE'],
    answer: 0,
    explanation: 'Es el REPL del JDK.',
  };
  const bug = {
    id: 'java-hoy-2',
    type: 'find-the-bug',
    prompt: '¿Qué línea falla?',
    code: 'int a = 1;\nString b = 2;',
    answer: 2,
    explanation: 'Tipos incompatibles.',
  };
  const decision = {
    id: 'java-hoy-3',
    type: 'design-decision',
    prompt: '¿Maven o Gradle?',
    options: ['Maven', 'Gradle'],
    answer: 0,
    explanation: 'Convención del roadmap.',
  };

  it('accepts the three question types', () => {
    const { questions, errors } = validateQuestions([quiz, bug, decision]);

    assert.deepEqual(errors, []);
    assert.equal(questions.length, 3);
  });

  it('requires at least 3 questions', () => {
    const { errors } = validateQuestions([quiz, bug]);

    assert.ok(errors.some((e) => e.includes('3')));
  });

  it('rejects an answer index outside the options', () => {
    const { errors } = validateQuestions([{ ...quiz, answer: 2 }, bug, decision]);

    assert.ok(errors.some((e) => e.includes('java-hoy-1')));
  });

  it('rejects a find-the-bug answer outside the code lines', () => {
    const { errors } = validateQuestions([quiz, { ...bug, answer: 3 }, decision]);

    assert.ok(errors.some((e) => e.includes('java-hoy-2')));
  });

  it('rejects unknown types and missing explanations', () => {
    const { errors } = validateQuestions([{ ...quiz, type: 'essay' }, bug, { ...decision, explanation: '' }]);

    assert.ok(errors.some((e) => e.includes('type')));
    assert.ok(errors.some((e) => e.includes('explanation')));
  });

  it('rejects a payload that is not an array', () => {
    const { errors } = validateQuestions({ questions: [] });

    assert.match(errors[0], /array/);
  });
});
