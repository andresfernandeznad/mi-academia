import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ContentIndex } from '../../content/content.model';
import { indexFixture } from '../../content/content.fixtures';
import { CardState } from '../../review/leitner';
import { InMemoryReviewRepository, ReviewRepository } from '../../review/review.repository';
import { ReviewService } from '../../review/review.service';
import { RoadmapPage } from './roadmap.page';

const answered = (...ids: string[]): CardState[] => ids.map((questionId) => ({ questionId, box: 1, due: '2026-11-01' }));

describe('RoadmapPage', () => {
  let http: HttpTestingController;

  /** Opens the page with these review cards stored and responds index.json with `index`. */
  const open = async (cards: CardState[] = [], index: ContentIndex | null = indexFixture) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '', component: RoadmapPage }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ReviewRepository, useValue: new InMemoryReviewRepository(cards) },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    await TestBed.inject(ReviewService).ready;
    const harness = await RouterTestingHarness.create('/');
    const request = http.expectOne('content/index.json');
    if (index) request.flush(index);
    else request.flush(null, { status: 404, statusText: 'Not Found' });
    await harness.fixture.whenStable();
    return harness.routeNativeElement!;
  };

  afterEach(() => http.verify());

  it('lists every phase with its modules', async () => {
    const text = (await open()).textContent ?? '';

    expect(text).toContain('0. Arranque');
    expect(text).toContain('1. Fundamentos');
    expect(text).toContain('Java esencial');
    expect(text).toContain('HTTP y APIs a fondo');
  });

  it('links available modules and marks the rest as coming soon', async () => {
    const page = await open();

    const links = Array.from(page.querySelectorAll('a.row'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/m/curso-0-java']);
    expect(page.textContent).toContain('Próximamente');
  });

  it('pluralizes the lesson count', async () => {
    const [phase] = indexFixture.phases;
    const single = { ...phase.modules[0], lessons: phase.modules[0].lessons.slice(0, 1) };
    const page = await open([], { ...indexFixture, phases: [{ ...phase, modules: [single] }] });

    const row = page.querySelector('a.row')!;
    expect(row.querySelector('.sub')?.textContent?.trim()).toBe('0 de 1 lección');
    expect(row.querySelector('.aside')?.textContent?.trim()).toBe('15 h');
  });

  it('numbers modules by phase, as in the roadmap', async () => {
    const page = await open();

    const codes = Array.from(page.querySelectorAll('.row .index')).map((e) => e.textContent?.trim());
    expect(codes).toEqual(['0.1', '1.1']);
  });

  it('shows how many lessons of each module are completed', async () => {
    const page = await open(answered('java-hoy-1', 'java-hoy-2'));

    expect(page.querySelector('a.row .sub')?.textContent?.trim()).toBe('1 de 2 lecciones');
  });

  it('offers to continue with the next pending lesson', async () => {
    const page = await open(answered('java-hoy-1', 'java-hoy-2'));

    const button = page.querySelector('a.continue')!;
    expect(button.getAttribute('href')).toBe('/m/curso-0-java/tipos');
    expect(button.textContent).toContain('Tipos y texto');
  });

  it('hides the continue button once every lesson is completed', async () => {
    const page = await open(answered('java-hoy-1', 'java-hoy-2', 'tipos-1', 'tipos-2'));

    expect(page.querySelector('a.continue')).toBeNull();
  });

  it('shows an error message when the content cannot be loaded', async () => {
    const page = await open([], null);

    expect(page.textContent).toContain('No se pudo cargar el contenido');
  });
});
