import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { InMemoryReviewRepository, ReviewRepository } from './review/review.repository';
import { ReviewService } from './review/review.service';
import { TODAY } from './review/today';
import { UpdateService } from './update/update.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: ReviewRepository,
          useValue: new InMemoryReviewRepository([
            { questionId: 'due', box: 1, due: '2026-10-30' },
            { questionId: 'later', box: 2, due: '2026-11-02' },
          ]),
        },
        { provide: TODAY, useValue: () => '2026-10-30' },
      ],
    }).compileComponents();
    await TestBed.inject(ReviewService).ready;
  });

  it('renders the wordmark as a home link named for screen readers', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const home = (fixture.nativeElement as HTMLElement).querySelector('header a[href="/"]');

    expect(home?.textContent).toContain('mi_academia');
    expect(home?.getAttribute('aria-label')).toBe('Mi Academia, inicio');
  });

  it('links to the daily review with the number of due questions', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a[href="/repaso"]');

    expect(link?.textContent).toContain('Repaso');
    expect(link?.querySelector('.badge')?.textContent?.trim()).toBe('1');
  });

  it('switches between system, light and night themes from the header', async () => {
    localStorage.clear();
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const toggle = () => (fixture.nativeElement as HTMLElement).querySelector('button.theme-toggle') as HTMLButtonElement;

    expect(toggle().getAttribute('aria-label')).toBe('Tema: sistema. Cambiar a claro');
    toggle().click();
    await fixture.whenStable();
    expect(toggle().getAttribute('aria-label')).toBe('Tema: claro. Cambiar a noche');
    toggle().click();
    await fixture.whenStable();
    expect(toggle().getAttribute('aria-label')).toBe('Tema: noche. Cambiar a sistema');
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('offers a reload only when a new version is ready', async () => {
    const updates = TestBed.inject(UpdateService);
    let reloads = 0;
    updates.reload = () => reloads++;
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const banner = () => (fixture.nativeElement as HTMLElement).querySelector('.update-banner');
    expect(banner()).toBeNull();

    updates.available.set(true);
    await fixture.whenStable();
    expect(banner()?.getAttribute('role')).toBe('status');
    expect(banner()?.textContent).toContain('Hay una versión nueva');
    (banner()!.querySelector('button') as HTMLButtonElement).click();

    expect(reloads).toBe(1);
  });

  it('hosts the router outlet inside main', () => {
    const fixture = TestBed.createComponent(App);
    const main = (fixture.nativeElement as HTMLElement).querySelector('main');

    expect(main?.querySelector('router-outlet')).not.toBeNull();
  });
});
