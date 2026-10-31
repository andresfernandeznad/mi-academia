import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { compileContent } from './compile-content.ts';

const lesson = (id: string) => `---
id: ${id}
title: "Lección ${id}"
minutes: 6
sources:
  - https://dev.java/learn/
---
## Por qué importa
## Idea central
## Error típico
## Fuentes
`;

const questions = (prefix: string) =>
  JSON.stringify(
    [1, 2, 3].map((n) => ({
      id: `${prefix}-${n}`,
      type: 'quiz',
      prompt: '¿?',
      options: ['a', 'b'],
      answer: 0,
      explanation: 'Porque sí.',
    })),
  );

describe('compileContent', () => {
  let dir: string;

  const write = (path: string, data: string) => {
    const full = join(dir, path);
    mkdirSync(join(full, '..'), { recursive: true });
    writeFileSync(full, data);
  };

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'content-'));
    write(
      'roadmap.json',
      JSON.stringify({
        title: 'Roadmap 1',
        phases: [
          {
            id: 'arranque',
            title: 'Arranque',
            modules: [
              { id: 'curso-0-java', title: 'Java esencial', hours: 15 },
              { id: 'http', title: 'HTTP', hours: 15 },
            ],
          },
        ],
      }),
    );
    write(
      'curso-0-java/module.json',
      JSON.stringify({ id: 'curso-0-java', description: 'Repaso.', lessons: ['01-java-hoy', '02-tipos'] }),
    );
    write('curso-0-java/lessons/01-java-hoy.md', lesson('java-hoy'));
    write('curso-0-java/questions/01-java-hoy.json', questions('java-hoy'));
    write('curso-0-java/lessons/02-tipos.md', lesson('tipos'));
    write('curso-0-java/questions/02-tipos.json', questions('tipos'));
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('builds the index with lesson summaries in module order', () => {
    const { index, errors } = compileContent(dir);

    assert.deepEqual(errors, []);
    const [java, http] = index.phases[0].modules;
    assert.equal(java.available, true);
    assert.equal(java.description, 'Repaso.');
    assert.deepEqual(
      java.lessons.map((l) => l.id),
      ['java-hoy', 'tipos'],
    );
    assert.equal(http.available, false);
    assert.deepEqual(http.lessons, []);
  });

  it('lists the question ids of each lesson in the index, to derive progress', () => {
    const { index } = compileContent(dir);

    assert.deepEqual(index.phases[0].modules[0].lessons[1].questionIds, ['tipos-1', 'tipos-2', 'tipos-3']);
  });

  it('returns full lessons with their questions', () => {
    const { lessons } = compileContent(dir);

    assert.equal(lessons.length, 2);
    assert.equal(lessons[0].moduleId, 'curso-0-java');
    assert.equal(lessons[0].questions.length, 3);
  });

  it('collects every question with its lesson for the daily review', () => {
    const { questions } = compileContent(dir);

    assert.equal(questions.length, 6);
    assert.deepEqual(
      { id: questions[3].id, moduleId: questions[3].moduleId, lessonId: questions[3].lessonId, lessonTitle: questions[3].lessonTitle },
      { id: 'tipos-1', moduleId: 'curso-0-java', lessonId: 'tipos', lessonTitle: 'Lección tipos' },
    );
  });

  it('renders the lesson Markdown to HTML at build time', () => {
    write(
      'curso-0-java/lessons/01-java-hoy.md',
      lesson('java-hoy').replace('## Idea central', '## Idea central\nUsa `jshell`.\n```java\nint a = 1;\n```'),
    );

    const [first] = compileContent(dir).lessons;

    assert.match(first.html, /<h2[^>]*>Por qué importa<\/h2>/);
    assert.match(first.html, /<code>jshell<\/code>/);
    assert.match(first.html, /<pre><code class="language-java">int a = 1;/);
    assert.equal('markdown' in first, false);
  });

  it('reports a lesson listed in module.json but missing on disk', () => {
    rmSync(join(dir, 'curso-0-java/lessons/02-tipos.md'));

    const { errors } = compileContent(dir);

    assert.ok(errors.some((e) => e.includes('02-tipos.md')));
  });

  it('reports a lesson without its questions file', () => {
    rmSync(join(dir, 'curso-0-java/questions/02-tipos.json'));

    const { errors } = compileContent(dir);

    assert.ok(errors.some((e) => e.includes('questions/02-tipos.json')));
  });

  it('reports question ids repeated across lessons', () => {
    write('curso-0-java/questions/02-tipos.json', questions('java-hoy'));

    const { errors } = compileContent(dir);

    assert.ok(errors.some((e) => e.includes('java-hoy-1') && e.includes('duplicated')));
  });

  it('reports a module.json whose id does not match its folder', () => {
    write('curso-0-java/module.json', JSON.stringify({ id: 'otro', lessons: ['01-java-hoy'] }));

    const { errors } = compileContent(dir);

    assert.ok(errors.some((e) => e.includes('curso-0-java/module.json')));
  });

  it('prefixes every error with the offending file', () => {
    write('curso-0-java/lessons/01-java-hoy.md', lesson('java-hoy').replace('minutes: 6', 'minutes: 60'));

    const { errors } = compileContent(dir);

    assert.ok(errors.some((e) => e.startsWith('curso-0-java/lessons/01-java-hoy.md:')));
  });
});
