import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CardState } from '../review/leitner';
import { InMemoryReviewRepository, ReviewRepository } from '../review/review.repository';
import { ReviewService } from '../review/review.service';
import { NOW, TODAY } from '../review/today';
import { AccountUser, AuthService } from './auth.service';
import { RemoteReviewStore } from './remote-review-store';
import { SYNC_DELAY_MS, SyncService } from './sync.service';

class FakeRemote extends RemoteReviewStore {
  rows = new Map<string, CardState>();
  failNext = false;
  uploads: CardState[][] = [];

  async fetchAll(): Promise<CardState[]> {
    if (this.failNext) {
      this.failNext = false;
      throw new Error('network down');
    }
    return [...this.rows.values()];
  }

  async upsert(_userId: string, cards: CardState[]): Promise<void> {
    this.uploads.push(cards);
    for (const card of cards) this.rows.set(card.questionId, card);
  }
}

const me: AccountUser = { id: 'u1', login: 'andres', avatarUrl: null };
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

describe('SyncService', () => {
  let remote: FakeRemote;
  let user: ReturnType<typeof signal<AccountUser | null>>;
  let repository: InMemoryReviewRepository;

  const create = async (localCards: CardState[] = []) => {
    remote = new FakeRemote();
    user = signal<AccountUser | null>(null);
    repository = new InMemoryReviewRepository(localCards);
    TestBed.configureTestingModule({
      providers: [
        { provide: ReviewRepository, useValue: repository },
        { provide: RemoteReviewStore, useValue: remote },
        { provide: AuthService, useValue: { configured: signal(true), user } },
        { provide: TODAY, useValue: () => '2026-10-30' },
        { provide: NOW, useValue: () => '2026-10-30T12:00:00.000Z' },
        { provide: SYNC_DELAY_MS, useValue: 0 },
      ],
    });
    const sync = TestBed.inject(SyncService);
    await TestBed.inject(ReviewService).ready;
    TestBed.tick();
    return sync;
  };

  const signIn = async () => {
    user.set(me);
    TestBed.tick();
    await settle();
  };

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => true });
  });

  it('stays idle while signed out', async () => {
    const sync = await create([{ questionId: 'q1', box: 1, due: '2026-10-31', updatedAt: '2026-10-30T10:00:00Z' }]);
    await settle();

    expect(sync.status()).toBe('signed-out');
    expect(remote.uploads).toEqual([]);
  });

  it('merges both ways when the learner signs in', async () => {
    const sync = await create([{ questionId: 'mine', box: 2, due: '2026-11-01', updatedAt: '2026-10-30T10:00:00Z' }]);
    const theirs = { questionId: 'theirs', box: 3, due: '2026-11-03', updatedAt: '2026-10-29T10:00:00Z' };
    remote.rows.set('theirs', theirs);

    await signIn();

    expect(sync.status()).toBe('synced');
    expect([...remote.rows.keys()].sort()).toEqual(['mine', 'theirs']);
    expect(TestBed.inject(ReviewService).allCards()).toContainEqual(theirs);
    expect(await repository.load()).toContainEqual(theirs);
    expect(sync.lastSyncedAt()).toBe('2026-10-30T12:00:00.000Z');
  });

  it('uploads an answer given after signing in', async () => {
    await create();
    await signIn();

    await TestBed.inject(ReviewService).recordFirstAnswer('q9', 'correct');
    TestBed.tick();
    await settle();

    expect(remote.rows.get('q9')).toMatchObject({ box: 2, updatedAt: '2026-10-30T12:00:00.000Z' });
  });

  it('does not upload again what it just downloaded', async () => {
    await create();
    remote.rows.set('theirs', { questionId: 'theirs', box: 3, due: '2026-11-03', updatedAt: '2026-10-29T10:00:00Z' });

    await signIn();

    expect(remote.uploads.flat()).toEqual([]);
  });

  it('reports an error and keeps local progress when the server fails', async () => {
    const local = { questionId: 'q1', box: 2, due: '2026-11-01', updatedAt: '2026-10-30T10:00:00Z' };
    const sync = await create([local]);
    remote.failNext = true;

    await signIn();

    expect(sync.status()).toBe('error');
    expect(await repository.load()).toEqual([local]);

    await sync.syncNow();
    expect(sync.status()).toBe('synced');
    expect(remote.rows.get('q1')).toEqual(local);
  });

  it('waits for the connection instead of failing while offline', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
    const sync = await create();

    await signIn();

    expect(sync.status()).toBe('offline');
  });
});
