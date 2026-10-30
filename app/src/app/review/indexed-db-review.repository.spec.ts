import { IDBFactory } from 'fake-indexeddb';
import { IndexedDbReviewRepository } from './indexed-db-review.repository';

describe('IndexedDbReviewRepository', () => {
  let factory: IDBFactory;

  beforeEach(() => (factory = new IDBFactory()));

  it('loads nothing from a fresh database', async () => {
    expect(await new IndexedDbReviewRepository(factory).load()).toEqual([]);
  });

  it('saves and loads cards', async () => {
    const repository = new IndexedDbReviewRepository(factory);

    await repository.save({ questionId: 'q1', box: 1, due: '2026-10-31' });
    await repository.save({ questionId: 'q2', box: 2, due: '2026-11-01' });

    expect(await repository.load()).toEqual([
      { questionId: 'q1', box: 1, due: '2026-10-31' },
      { questionId: 'q2', box: 2, due: '2026-11-01' },
    ]);
  });

  it('overwrites a card with the same question id', async () => {
    const repository = new IndexedDbReviewRepository(factory);

    await repository.save({ questionId: 'q1', box: 1, due: '2026-10-31' });
    await repository.save({ questionId: 'q1', box: 2, due: '2026-11-02' });

    expect(await repository.load()).toEqual([{ questionId: 'q1', box: 2, due: '2026-11-02' }]);
  });

  it('keeps cards for a new instance on the same database, like after a reload', async () => {
    await new IndexedDbReviewRepository(factory).save({ questionId: 'q1', box: 3, due: '2026-11-03' });

    expect(await new IndexedDbReviewRepository(factory).load()).toEqual([
      { questionId: 'q1', box: 3, due: '2026-11-03' },
    ]);
  });
});
