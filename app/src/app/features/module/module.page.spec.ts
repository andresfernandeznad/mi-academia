import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { indexFixture } from '../../content/content.fixtures';
import { CardState } from '../../review/leitner';
import { InMemoryReviewRepository, ReviewRepository } from '../../review/review.repository';
import { ReviewService } from '../../review/review.service';
import { ModulePage } from './module.page';

const answered = (...ids: string[]): CardState[] => ids.map((questionId) => ({ questionId, box: 1, due: '2026-11-01' }));

describe('ModulePage', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  const open = async (url: string, cards: CardState[] = []) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'm/:moduleId', component: ModulePage }], withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ReviewRepository, useValue: new InMemoryReviewRepository(cards) },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    await TestBed.inject(ReviewService).ready;
    harness = await RouterTestingHarness.create(url);
    http.expectOne('content/index.json').flush(indexFixture);
    await harness.fixture.whenStable();
    return harness.routeNativeElement!;
  };

  afterEach(() => http.verify());

  it('marks completed lessons and shows the module progress', async () => {
    const page = await open('/m/curso-0-java', answered('java-hoy-1', 'java-hoy-2', 'tipos-1'));

    const rows = Array.from(page.querySelectorAll('ol a.row'));
    expect(rows.map((row) => row.classList.contains('done'))).toEqual([true, false]);
    expect(rows[0].textContent).toContain('Completada');
    expect(page.querySelector('.progress-label')?.textContent?.trim()).toBe('1 de 2 lecciones completadas');
  });

  it('shows the module title, description and lessons in order', async () => {
    const page = await open('/m/curso-0-java');

    expect(page.querySelector('h1')?.textContent).toContain('Java esencial');
    expect(page.textContent).toContain('Repaso de Java moderno.');
    const links = Array.from(page.querySelectorAll('ol a'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/m/curso-0-java/java-hoy', '/m/curso-0-java/tipos']);
    expect(links[0].textContent).toContain('8 min');
  });

  it('tells the user when the module does not exist', async () => {
    const page = await open('/m/no-existe');

    expect(page.textContent).toContain('Ese módulo no existe');
  });
});
