import { DestroyRef, Injectable, InjectionToken, effect, inject, signal, untracked } from '@angular/core';
import { ReviewService } from '../review/review.service';
import { NOW } from '../review/today';
import { mergeDays } from '../study-days/study-days';
import { StudyDaysService } from '../study-days/study-days.service';
import { AuthService } from './auth.service';
import { mergeCards } from './merge';
import { RemoteReviewStore } from './remote-review-store';
import { RemoteStudyDaysStore } from './remote-study-days-store';

export type SyncStatus = 'disabled' | 'signed-out' | 'syncing' | 'synced' | 'offline' | 'error';

/** Waits this long after a local change before uploading, so a burst of answers is one request. */
export const SYNC_DELAY_MS = new InjectionToken<number>('SYNC_DELAY_MS', { providedIn: 'root', factory: () => 2000 });

/**
 * Keeps IndexedDB (the offline source of truth) and Supabase (the shared copy) converged:
 * on sign-in, after local changes, when the connection returns and when the app comes back.
 */
@Injectable({ providedIn: 'root' })
export class SyncService {
  private readonly auth = inject(AuthService);
  private readonly remote = inject(RemoteReviewStore);
  private readonly reviews = inject(ReviewService);
  private readonly remoteDays = inject(RemoteStudyDaysStore);
  private readonly studyDays = inject(StudyDaysService);
  private readonly now = inject(NOW);
  private readonly delay = inject(SYNC_DELAY_MS);

  readonly status = signal<SyncStatus>(this.auth.configured() ? 'signed-out' : 'disabled');
  readonly lastSyncedAt = signal<string | null>(null);

  private running: Promise<void> | null = null;
  private pending = false;
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      const user = this.auth.user();
      untracked(() => {
        if (user) void this.syncNow();
        else this.status.set(this.auth.configured() ? 'signed-out' : 'disabled');
      });
    });

    let firstRun = true;
    effect(() => {
      this.reviews.localChanges();
      this.studyDays.localChanges();
      if (firstRun) {
        firstRun = false;
        return;
      }
      untracked(() => this.syncSoon());
    });

    const online = () => void this.syncNow();
    addEventListener('online', online);
    inject(DestroyRef).onDestroy(() => {
      removeEventListener('online', online);
      clearTimeout(this.timer);
    });
  }

  /** Debounced sync, for frequent triggers. */
  syncSoon(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.syncNow(), this.delay);
  }

  /** Runs one sync now; a call during a running sync queues exactly one more pass. */
  async syncNow(): Promise<void> {
    if (this.running) {
      this.pending = true;
      return this.running;
    }
    this.running = this.run().finally(() => {
      this.running = null;
      if (this.pending) {
        this.pending = false;
        void this.syncNow();
      }
    });
    return this.running;
  }

  private async run(): Promise<void> {
    const user = this.auth.user();
    if (!user) return;
    if (!navigator.onLine) {
      this.status.set('offline');
      return;
    }

    this.status.set('syncing');
    try {
      await this.reviews.ready;
      const { toUpload, toStore } = mergeCards(this.reviews.allCards(), await this.remote.fetchAll(user.id));
      await this.reviews.applyRemote(toStore);
      await this.remote.upsert(user.id, toUpload);

      await this.studyDays.ready;
      const days = mergeDays(new Set(this.studyDays.allDays()), await this.remoteDays.fetchAll(user.id));
      await this.studyDays.applyRemote(days.toStore);
      await this.remoteDays.insert(user.id, days.toUpload);
      this.lastSyncedAt.set(this.now());
      this.status.set('synced');
    } catch {
      // Local progress is untouched; the next trigger (or "Sincronizar ahora") retries.
      this.status.set(navigator.onLine ? 'error' : 'offline');
    }
  }
}
