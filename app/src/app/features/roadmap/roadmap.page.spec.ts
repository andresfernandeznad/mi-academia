import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { indexFixture } from '../../content/content.fixtures';
import { RoadmapPage } from './roadmap.page';

describe('RoadmapPage', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '', component: RoadmapPage }]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create('/');
  });

  afterEach(() => http.verify());

  it('lists every phase with its modules', async () => {
    http.expectOne('content/index.json').flush(indexFixture);
    await harness.fixture.whenStable();

    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('0. Arranque');
    expect(text).toContain('1. Fundamentos');
    expect(text).toContain('Java esencial');
    expect(text).toContain('HTTP y APIs a fondo');
  });

  it('links available modules and marks the rest as coming soon', async () => {
    http.expectOne('content/index.json').flush(indexFixture);
    await harness.fixture.whenStable();

    const links = Array.from(harness.routeNativeElement!.querySelectorAll('a'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/m/curso-0-java']);
    expect(harness.routeNativeElement!.textContent).toContain('Próximamente');
  });

  it('pluralizes the lesson count', async () => {
    const [phase] = indexFixture.phases;
    const single = { ...phase.modules[0], lessons: phase.modules[0].lessons.slice(0, 1) };
    http.expectOne('content/index.json').flush({ ...indexFixture, phases: [{ ...phase, modules: [single] }] });
    await harness.fixture.whenStable();

    const row = harness.routeNativeElement!.querySelector('a.row')!;
    expect(row.querySelector('.sub')?.textContent?.trim()).toBe('1 lección');
    expect(row.querySelector('.aside')?.textContent?.trim()).toBe('15 h');
  });

  it('numbers modules by phase, as in the roadmap', async () => {
    http.expectOne('content/index.json').flush(indexFixture);
    await harness.fixture.whenStable();

    const codes = Array.from(harness.routeNativeElement!.querySelectorAll('.row .index')).map((e) => e.textContent?.trim());
    expect(codes).toEqual(['0.1', '1.1']);
  });

  it('shows an error message when the content cannot be loaded', async () => {
    http.expectOne('content/index.json').flush(null, { status: 404, statusText: 'Not Found' });
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement!.textContent).toContain('No se pudo cargar el contenido');
  });
});
