import { IDBFactory } from 'fake-indexeddb';
import { IndexedDbReviewRepository } from '../review/indexed-db-review.repository';
import { IndexedDbStudyDaysRepository } from './indexed-db-study-days.repository';

/** Creates the database exactly as version 1 of the app left it: only the review-cards store. */
function createVersion1(factory: IDBFactory): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = factory.open('mi-academia', 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore('review-cards', { keyPath: 'questionId' });
      store.put({ questionId: 'q1', box: 3, due: '2026-11-03' });
    };
    request.onsuccess = () => {
      request.result.close();
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

describe('IndexedDbStudyDaysRepository', () => {
  let factory: IDBFactory;

  beforeEach(() => (factory = new IDBFactory()));

  it('loads nothing from a fresh database', async () => {
    expect(await new IndexedDbStudyDaysRepository(factory).load()).toEqual([]);
  });

  it('adds days once, however many times they are added', async () => {
    const repository = new IndexedDbStudyDaysRepository(factory);

    await repository.add(['2026-11-02', '2026-11-03']);
    await repository.add(['2026-11-03']);

    expect((await repository.load()).sort()).toEqual(['2026-11-02', '2026-11-03']);
  });

  it('keeps days for a new instance on the same database, like after a reload', async () => {
    await new IndexedDbStudyDaysRepository(factory).add(['2026-11-02']);

    expect(await new IndexedDbStudyDaysRepository(factory).load()).toEqual(['2026-11-02']);
  });

  it('upgrades a version 1 database without losing its review cards', async () => {
    await createVersion1(factory);

    await new IndexedDbStudyDaysRepository(factory).add(['2026-11-02']);

    expect(await new IndexedDbReviewRepository(factory).load()).toEqual([{ questionId: 'q1', box: 3, due: '2026-11-03' }]);
    expect(await new IndexedDbStudyDaysRepository(factory).load()).toEqual(['2026-11-02']);
  });
});
