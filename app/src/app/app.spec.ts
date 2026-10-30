import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { InMemoryReviewRepository, ReviewRepository } from './review/review.repository';
import { ReviewService } from './review/review.service';
import { TODAY } from './review/today';

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

  it('renders the app name in the header', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const header = (fixture.nativeElement as HTMLElement).querySelector('header');

    expect(header?.textContent).toContain('Mi Academia');
  });

  it('links to the daily review with the number of due questions', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a[href="/repaso"]');

    expect(link?.textContent).toContain('Repaso');
    expect(link?.querySelector('.badge')?.textContent?.trim()).toBe('1');
  });

  it('hosts the router outlet inside main', () => {
    const fixture = TestBed.createComponent(App);
    const main = (fixture.nativeElement as HTMLElement).querySelector('main');

    expect(main?.querySelector('router-outlet')).not.toBeNull();
  });
});
