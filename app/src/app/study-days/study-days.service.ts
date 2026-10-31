import { Injectable, computed, inject, signal } from '@angular/core';
import { ReviewService } from '../review/review.service';
import { TODAY } from '../review/today';
import { currentStreak, daysFromCards, weekDays } from './study-days';
import { StudyDaysRepository } from './study-days.repository';

export interface WeekDay {
  day: string;
  studied: boolean;
  isToday: boolean;
}

/** Days on which the learner answered something, for the streak and the weekly count of the success criterion. */
@Injectable({ providedIn: 'root' })
export class StudyDaysService {
  private readonly repository = inject(StudyDaysRepository);
  private readonly reviews = inject(ReviewService);
  private readonly clock = inject(TODAY);

  private readonly days = signal<ReadonlySet<string>>(new Set());
  private readonly today = signal(this.clock());

  readonly allDays = computed(() => [...this.days()]);
  readonly streak = computed(() => currentStreak(this.days(), this.today()));
  readonly week = computed<WeekDay[]>(() =>
    weekDays(this.today()).map((day) => ({ day, studied: this.days().has(day), isToday: day === this.today() })),
  );
  readonly studiedThisWeek = computed(() => this.week().filter((d) => d.studied).length);

  /** Bumps on every change made on this device (not on days applied from the server). */
  readonly localChanges = signal(0);

  /** Resolves once stored days are loaded; writes wait for it. */
  readonly ready: Promise<void> = this.load();

  refreshToday(): void {
    this.today.set(this.clock());
  }

  async markToday(): Promise<void> {
    await this.ready;
    const today = this.clock();
    this.today.set(today);
    if (this.days().has(today)) return;
    await this.store([today]);
    this.localChanges.update((n) => n + 1);
  }

  /** Days from another device. Not a local change, or every download would trigger an upload. */
  async applyRemote(days: readonly string[]): Promise<void> {
    await this.ready;
    await this.store(days);
  }

  private async load(): Promise<void> {
    const stored = await this.repository.load();
    this.days.set(new Set(stored));
    if (stored.length > 0) return;

    // First run after this feature shipped: recover what the review cards still remember.
    await this.reviews.ready;
    const recovered = daysFromCards(this.reviews.allCards());
    if (recovered.length === 0) return;
    await this.store(recovered);
    this.localChanges.update((n) => n + 1);
  }

  private async store(days: readonly string[]): Promise<void> {
    const fresh = days.filter((day) => !this.days().has(day));
    if (fresh.length === 0) return;
    this.days.update((current) => new Set([...current, ...fresh]));
    await this.repository.add(fresh);
  }
}
