import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { indexFixture } from '../../content/content.fixtures';
import { ReviewQuestion } from '../../content/content.model';
import { CardState } from '../../review/leitner';
import { InMemoryReviewRepository, ReviewRepository } from '../../review/review.repository';
import { ReviewService } from '../../review/review.service';
import { TODAY } from '../../review/today';
import { ReviewPage } from './review.page';

const origin = { moduleId: 'curso-0-java', lessonId: 'java-hoy', lessonTitle: 'Java hoy' };
const questions: ReviewQuestion[] = [
  { ...origin, id: 'q1', type: 'quiz', prompt: 'Pregunta uno', options: ['Sí', 'No'], answer: 0, explanation: '.' },
  { ...origin, id: 'q2', type: 'design-decision', prompt: 'Pregunta dos', options: ['A', 'B'], answer: 0, explanation: '.' },
];

describe('ReviewPage', () => {
  let http: HttpTestingController;
  let repository: InMemoryReviewRepository;
  let harness: RouterTestingHarness;

  const open = async (cards: CardState[]) => {
    repository = new InMemoryReviewRepository(cards);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'repaso', component: ReviewPage }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ReviewRepository, useValue: repository },
        { provide: TODAY, useValue: () => '2026-10-30' },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    await TestBed.inject(ReviewService).ready;
    harness = await RouterTestingHarness.create('/repaso');
    http.expectOne('content/questions.json').flush(questions);
    // ContentService loads the index eagerly; a pending request would keep the app from becoming stable.
    http.expectOne('content/index.json').flush(indexFixture);
    await harness.fixture.whenStable();
    return harness.routeNativeElement!;
  };

  const click = async (el: HTMLElement, label: string) => {
    Array.from(el.querySelectorAll('button'))
      .find((b) => b.textContent?.trim() === label)!
      .click();
    await harness.fixture.whenStable();
  };

  afterEach(() => http.verify());

  it('says there is nothing to review when no card is due', async () => {
    const el = await open([{ questionId: 'q1', box: 2, due: '2026-11-01' }]);

    expect(el.textContent).toContain('No tienes preguntas pendientes');
  });

  it('shows the first due question with its lesson and the remaining count', async () => {
    const el = await open([
      { questionId: 'q1', box: 1, due: '2026-10-30' },
      { questionId: 'q2', box: 2, due: '2026-10-30' },
    ]);

    expect(el.textContent).toContain('Pregunta uno');
    expect(el.textContent).toContain('Java hoy');
    expect(el.textContent).toContain('Quedan 2');
  });

  it('offers easy or unsure after a correct answer and moves to the next card', async () => {
    const el = await open([
      { questionId: 'q1', box: 1, due: '2026-10-30' },
      { questionId: 'q2', box: 2, due: '2026-10-30' },
    ]);

    await click(el, 'Sí');
    expect(Array.from(el.querySelectorAll('.rating button')).map((b) => b.textContent?.trim())).toEqual([
      'Fácil',
      'Dudoso',
    ]);
    await click(el, 'Fácil');

    expect(el.textContent).toContain('Pregunta dos');
    expect((await repository.load()).find((c) => c.questionId === 'q1')).toEqual({
      questionId: 'q1',
      box: 2,
      due: '2026-11-01',
    });
  });

  it('only lets a wrong answer count as failed', async () => {
    const el = await open([{ questionId: 'q1', box: 3, due: '2026-10-30' }]);

    await click(el, 'No');
    expect(Array.from(el.querySelectorAll('.rating button')).map((b) => b.textContent?.trim())).toEqual(['Siguiente']);
    await click(el, 'Siguiente');

    expect(await repository.load()).toEqual([{ questionId: 'q1', box: 1, due: '2026-10-31' }]);
    expect(el.textContent).toContain('No tienes preguntas pendientes');
  });

  it('lets the learner rate a design decision with the three options', async () => {
    const el = await open([{ questionId: 'q2', box: 1, due: '2026-10-30' }]);

    await click(el, 'B');

    expect(Array.from(el.querySelectorAll('.rating button')).map((b) => b.textContent?.trim())).toEqual([
      'Fácil',
      'Dudoso',
      'Fallado',
    ]);
  });
});
