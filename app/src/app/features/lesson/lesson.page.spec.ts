import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { indexFixture, lessonFixture } from '../../content/content.fixtures';
import { InMemoryReviewRepository, ReviewRepository } from '../../review/review.repository';
import { TODAY } from '../../review/today';
import { StudyDaysService } from '../../study-days/study-days.service';
import { LessonPage } from './lesson.page';

describe('LessonPage', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;
  let repository: InMemoryReviewRepository;

  const open = async (moduleId: string, lessonId: string) => {
    harness = await RouterTestingHarness.create(`/m/${moduleId}/${lessonId}`);
    http.expectOne('content/index.json').flush(indexFixture);
    http.expectOne(`content/${moduleId}/${lessonId}.json`).flush({ ...lessonFixture, id: lessonId });
    await harness.fixture.whenStable();
    return harness.routeNativeElement!;
  };

  beforeEach(() => {
    repository = new InMemoryReviewRepository();
    TestBed.configureTestingModule({
      providers: [
        { provide: ReviewRepository, useValue: repository },
        { provide: TODAY, useValue: () => '2026-11-04' },
        provideRouter([{ path: 'm/:moduleId/:lessonId', component: LessonPage }], withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('renders the lesson title, reading time and HTML body', async () => {
    const page = await open('curso-0-java', 'java-hoy');

    expect(page.querySelector('h1')?.textContent).toContain('Java hoy');
    expect(page.textContent).toContain('8 min');
    expect(page.querySelector('article h2')?.textContent).toBe('Por qué importa');
    expect(page.querySelector('article pre code')?.textContent).toBe('int a = 1;');
  });

  it('ends the lesson with its questions', async () => {
    const page = await open('curso-0-java', 'java-hoy');

    expect(page.querySelectorAll('app-lesson-quiz app-question-card').length).toBe(lessonFixture.questions.length);
  });

  it('adds the first answer of each question to the daily review', async () => {
    const page = await open('curso-0-java', 'java-hoy');

    (page.querySelector('button[aria-label="Línea 2"]') as HTMLButtonElement).click();
    await harness.fixture.whenStable();

    const cards = await repository.load();
    expect(cards.map((c) => [c.questionId, c.box])).toEqual([['java-hoy-2', 2]]);
  });

  it('marks today as a study day on any answer, even to a question answered before', async () => {
    await repository.save({ questionId: 'java-hoy-2', box: 3, due: '2026-12-01' });
    const page = await open('curso-0-java', 'java-hoy');

    (page.querySelector('button[aria-label="Línea 2"]') as HTMLButtonElement).click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(StudyDaysService).allDays()).toEqual(['2026-11-04']);
  });

  it('links back to the module and to the next lesson only on the first lesson', async () => {
    const page = await open('curso-0-java', 'java-hoy');

    const hrefs = Array.from(page.querySelectorAll('nav a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/m/curso-0-java', '/m/curso-0-java/tipos']);
  });

  it('links to the previous lesson on the last lesson', async () => {
    const page = await open('curso-0-java', 'tipos');

    const hrefs = Array.from(page.querySelectorAll('nav a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/m/curso-0-java', '/m/curso-0-java/java-hoy']);
  });

  it('shows a message when the lesson cannot be loaded', async () => {
    harness = await RouterTestingHarness.create('/m/curso-0-java/no-existe');
    http.expectOne('content/index.json').flush(indexFixture);
    http.expectOne('content/curso-0-java/no-existe.json').flush(null, { status: 404, statusText: 'Not Found' });
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement!.textContent).toContain('Lección no encontrada');
  });
});
