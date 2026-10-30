import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Question } from '../content/content.model';
import { QuestionAnswer, QuestionCard } from './question-card';

const quiz: Question = {
  id: 'java-hoy-1',
  type: 'quiz',
  prompt: '¿Qué es JShell?',
  options: ['Un REPL', 'Un IDE', 'Un servidor'],
  answer: 0,
  explanation: 'Es el REPL del JDK.',
};
const bug: Question = {
  id: 'java-hoy-2',
  type: 'find-the-bug',
  prompt: '¿Qué línea falla?',
  code: 'mi-cli/\n  pom.xml\n  src/main/test/AppTest.java',
  answer: 3,
  explanation: 'Los tests van en src/test/java.',
};
const decision: Question = {
  id: 'java-hoy-3',
  type: 'design-decision',
  prompt: '¿Qué usas?',
  options: ['JShell', 'Maven'],
  answer: 0,
  explanation: 'Para explorar, JShell.',
};

describe('QuestionCard', () => {
  let fixture: ComponentFixture<QuestionCard>;
  let answers: QuestionAnswer[];

  const render = async (question: Question) => {
    fixture = TestBed.createComponent(QuestionCard);
    fixture.componentRef.setInput('question', question);
    answers = [];
    fixture.componentInstance.answered.subscribe((a) => answers.push(a));
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  const button = (el: HTMLElement, label: string) =>
    Array.from(el.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === label || b.getAttribute('aria-label') === label,
    )!;

  const choose = async (el: HTMLElement, label: string) => {
    button(el, label).click();
    await fixture.whenStable();
  };

  it('shows the prompt and every option', async () => {
    const el = await render(quiz);

    expect(el.textContent).toContain('¿Qué es JShell?');
    expect(
      Array.from(el.querySelectorAll('button'))
        .map((b) => b.textContent?.trim())
        .sort(),
    ).toEqual(['Un IDE', 'Un REPL', 'Un servidor']);
  });

  it('confirms a correct answer and explains it', async () => {
    const el = await render(quiz);

    await choose(el, 'Un REPL');

    expect(el.querySelector('[role=status]')?.textContent).toContain('Correcto');
    expect(el.textContent).toContain('Es el REPL del JDK.');
    expect(answers).toEqual([{ questionId: 'java-hoy-1', grade: 'correct' }]);
  });

  it('marks a wrong answer, highlights the right one and locks the options', async () => {
    const el = await render(quiz);

    await choose(el, 'Un IDE');

    expect(el.querySelector('[role=status]')?.textContent).toContain('Incorrecto');
    expect(button(el, 'Un REPL').classList).toContain('is-answer');
    expect(button(el, 'Un IDE').classList).toContain('is-wrong');
    expect(Array.from(el.querySelectorAll('button')).every((b) => b.disabled)).toBe(true);
    expect(answers).toEqual([{ questionId: 'java-hoy-1', grade: 'incorrect' }]);
  });

  it('lets the learner pick a code line in find-the-bug', async () => {
    const el = await render(bug);

    expect(el.querySelectorAll('button').length).toBe(3);
    await choose(el, 'Línea 3');

    expect(el.querySelector('[role=status]')?.textContent).toContain('Correcto');
    expect(answers).toEqual([{ questionId: 'java-hoy-2', grade: 'correct' }]);
  });

  it('reveals the recommended option of a design decision without grading it', async () => {
    const el = await render(decision);

    await choose(el, 'Maven');

    const status = el.querySelector('[role=status]')?.textContent ?? '';
    expect(status).toContain('Respuesta recomendada');
    expect(status).not.toContain('Incorrecto');
    expect(button(el, 'JShell').classList).toContain('is-answer');
    expect(el.textContent).toContain('Para explorar, JShell.');
    expect(answers).toEqual([{ questionId: 'java-hoy-3', grade: 'self-assessed' }]);
  });
});
