import { TestBed } from '@angular/core/testing';
import { CardState } from './leitner';
import { InMemoryReviewRepository, ReviewRepository } from './review.repository';
import { ReviewService } from './review.service';
import { NOW, TODAY } from './today';

describe('ReviewService', () => {
  let repository: InMemoryReviewRepository;
  let today: string;

  const create = async (stored: CardState[] = []) => {
    repository = new InMemoryReviewRepository(stored);
    TestBed.configureTestingModule({
      providers: [
        { provide: ReviewRepository, useValue: repository },
        { provide: TODAY, useValue: () => today },
        { provide: NOW, useValue: () => '2026-10-30T10:00:00.000Z' },
      ],
    });
    const service = TestBed.inject(ReviewService);
    await service.ready;
    return service;
  };

  beforeEach(() => (today = '2026-10-30'));

  it('loads the stored cards on start', async () => {
    const service = await create([{ questionId: 'q1', box: 2, due: '2026-10-29' }]);

    expect(service.due().map((c) => c.questionId)).toEqual(['q1']);
  });

  it('turns the first answer in a lesson into a card', async () => {
    const service = await create();

    await service.recordFirstAnswer('ok', 'correct');
    await service.recordFirstAnswer('ko', 'incorrect');
    await service.recordFirstAnswer('dd', 'self-assessed');

    expect(await repository.load()).toEqual([
      { questionId: 'ok', box: 2, due: '2026-11-01', updatedAt: '2026-10-30T10:00:00.000Z' },
      { questionId: 'ko', box: 1, due: '2026-10-31', updatedAt: '2026-10-30T10:00:00.000Z' },
      { questionId: 'dd', box: 1, due: '2026-10-31', updatedAt: '2026-10-30T10:00:00.000Z' },
    ]);
  });

  it('ignores later answers in the lesson: only the review moves a card', async () => {
    const service = await create([{ questionId: 'q1', box: 4, due: '2026-11-05' }]);

    await service.recordFirstAnswer('q1', 'incorrect');

    expect(await repository.load()).toEqual([{ questionId: 'q1', box: 4, due: '2026-11-05' }]);
  });

  it('applies a review rating and removes the card from today', async () => {
    const service = await create([{ questionId: 'q1', box: 1, due: '2026-10-30' }]);

    await service.rate('q1', 'easy');

    expect(service.due()).toEqual([]);
    expect(await repository.load()).toEqual([
      { questionId: 'q1', box: 2, due: '2026-11-01', updatedAt: '2026-10-30T10:00:00.000Z' },
    ]);
  });

  it('shows cards again once their day arrives', async () => {
    const service = await create();
    await service.recordFirstAnswer('q1', 'incorrect');
    expect(service.due()).toEqual([]);

    today = '2026-10-31';
    service.refreshToday();

    expect(service.due().map((c) => c.questionId)).toEqual(['q1']);
  });

  it("counts local changes so sync knows when to upload", async () => {
    const service = await create();
    const before = service.localChanges();

    await service.recordFirstAnswer("q1", "correct");
    await service.rate("q1", "easy");

    expect(service.localChanges()).toBe(before + 2);
  });

  it("applies cards from the server without counting them as local changes", async () => {
    const service = await create([{ questionId: "q1", box: 1, due: "2026-10-30" }]);
    const before = service.localChanges();
    const remote = { questionId: "q1", box: 3, due: "2026-11-02", updatedAt: "2026-10-30T11:00:00.000Z" };

    await service.applyRemote([remote]);

    expect(service.localChanges()).toBe(before);
    expect(service.due()).toEqual([]);
    expect(await repository.load()).toEqual([remote]);
  });

  it("exposes every stored card for sync", async () => {
    const stored = [{ questionId: "q1", box: 2, due: "2026-11-01" }];
    const service = await create(stored);

    expect(service.allCards()).toEqual(stored);
  });
});
