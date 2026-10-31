import { TestBed } from '@angular/core/testing';
import { CardState } from '../review/leitner';
import { InMemoryReviewRepository, ReviewRepository } from '../review/review.repository';
import { TODAY } from '../review/today';
import { InMemoryStudyDaysRepository, StudyDaysRepository } from './study-days.repository';
import { StudyDaysService } from './study-days.service';

describe('StudyDaysService', () => {
  let repository: InMemoryStudyDaysRepository;
  let today: string;

  const create = async (stored: string[] = [], cards: CardState[] = []) => {
    repository = new InMemoryStudyDaysRepository(stored);
    TestBed.configureTestingModule({
      providers: [
        { provide: StudyDaysRepository, useValue: repository },
        { provide: ReviewRepository, useValue: new InMemoryReviewRepository(cards) },
        { provide: TODAY, useValue: () => today },
      ],
    });
    const service = TestBed.inject(StudyDaysService);
    await service.ready;
    return service;
  };

  // Wednesday of the first week of the trial.
  beforeEach(() => (today = '2026-11-04'));

  it('loads the stored days and computes the streak', async () => {
    const service = await create(['2026-11-02', '2026-11-03']);

    expect(service.streak()).toBe(2);
  });

  it('marks today once, persists it and counts it as a local change', async () => {
    const service = await create(['2026-11-03']);

    await service.markToday();
    await service.markToday();

    expect(service.streak()).toBe(2);
    expect((await repository.load()).sort()).toEqual(['2026-11-03', '2026-11-04']);
    expect(service.localChanges()).toBe(1);
  });

  it('describes this week from Monday to Sunday', async () => {
    const service = await create(['2026-11-02', '2026-11-04']);

    const week = service.week();
    expect(week.map((d) => d.studied)).toEqual([true, false, true, false, false, false, false]);
    expect(week.map((d) => d.isToday)).toEqual([false, false, true, false, false, false, false]);
    expect(service.studiedThisWeek()).toBe(2);
  });

  it('recovers past days from the review cards the first time it runs', async () => {
    const at = (d: number) => new Date(2026, 9, d, 12).toISOString();
    const service = await create([], [
      { questionId: 'a', box: 1, due: '2026-11-01', updatedAt: at(30) },
      { questionId: 'b', box: 1, due: '2026-11-01', updatedAt: at(31) },
    ]);

    expect((await repository.load()).sort()).toEqual(['2026-10-30', '2026-10-31']);
    expect(service.localChanges()).toBe(1);
  });

  it('applies days from another device without counting them as local changes', async () => {
    const service = await create(['2026-11-03']);

    await service.applyRemote(['2026-11-04']);

    expect(service.streak()).toBe(2);
    expect(service.localChanges()).toBe(0);
  });

  it('follows the calendar when the app comes back on another day', async () => {
    const service = await create(['2026-11-03', '2026-11-04']);
    expect(service.streak()).toBe(2);

    today = '2026-11-06';
    service.refreshToday();

    expect(service.streak()).toBe(0);
  });
});
