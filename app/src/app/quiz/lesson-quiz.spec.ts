import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Question } from '../content/content.model';
import { LessonQuiz } from './lesson-quiz';

const questions: Question[] = [
  { id: 'q1', type: 'quiz', prompt: 'Uno', options: ['Sí', 'No'], answer: 0, explanation: '.' },
  { id: 'q2', type: 'quiz', prompt: 'Dos', options: ['Verde', 'Rojo'], answer: 0, explanation: '.' },
  { id: 'q3', type: 'design-decision', prompt: 'Tres', options: ['A', 'B'], answer: 0, explanation: '.' },
];

describe('LessonQuiz', () => {
  let fixture: ComponentFixture<LessonQuiz>;
  let el: HTMLElement;

  const click = async (label: string) => {
    Array.from(el.querySelectorAll('button'))
      .find((b) => b.textContent?.trim() === label)!
      .click();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(LessonQuiz);
    fixture.componentRef.setInput('questions', questions);
    await fixture.whenStable();
    el = fixture.nativeElement;
  });

  it('renders a "Comprueba" section with one card per question', () => {
    expect(el.querySelector('h2')?.textContent).toContain('Comprueba');
    expect(el.querySelectorAll('app-question-card').length).toBe(3);
  });

  it('shows the score only once every question is answered', async () => {
    await click('Sí');
    await click('Rojo');
    expect(el.querySelector('.summary')).toBeNull();

    await click('B');

    expect(el.querySelector('.summary')?.textContent).toContain('1 de 2 correctas');
    expect(el.querySelector('.summary')?.textContent).toContain('1 de autoevaluación');
  });

  it('re-emits every answer so the page can feed the review', async () => {
    const answers: unknown[] = [];
    fixture.componentInstance.answered.subscribe((a) => answers.push(a));

    await click('No');

    expect(answers).toEqual([{ questionId: 'q1', grade: 'incorrect' }]);
  });

  it('renders nothing when the lesson has no questions', async () => {
    fixture.componentRef.setInput('questions', []);
    await fixture.whenStable();

    expect(el.querySelector('section')).toBeNull();
  });
});
