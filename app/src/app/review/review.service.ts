import { Injectable, computed, inject, signal } from '@angular/core';
import { Grade } from '../quiz/grading';
import { CardState, Rating, dueCards, review } from './leitner';
import { ReviewRepository } from './review.repository';
import { TODAY } from './today';

/** How a first answer inside a lesson maps to a Leitner rating. */
const FIRST_RATING: Record<Grade, Rating> = {
  correct: 'easy',
  incorrect: 'failed',
  'self-assessed': 'unsure',
};

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly repository = inject(ReviewRepository);
  private readonly clock = inject(TODAY);

  private readonly cards = signal<ReadonlyMap<string, CardState>>(new Map());
  private readonly today = signal(this.clock());

  readonly due = computed(() => dueCards([...this.cards().values()], this.today()));

  /** Resolves once stored progress is loaded; writes wait for it so they never overwrite unseen cards. */
  readonly ready: Promise<void> = this.repository.load().then((cards) => {
    this.cards.set(new Map(cards.map((card) => [card.questionId, card])));
  });

  /** Call when the app comes back to the foreground: the day may have changed. */
  refreshToday(): void {
    this.today.set(this.clock());
  }

  /** Only the first answer creates a card; re-reading a lesson never moves an existing one. */
  async recordFirstAnswer(questionId: string, grade: Grade): Promise<void> {
    await this.ready;
    if (this.cards().has(questionId)) return;
    await this.store(review(undefined, FIRST_RATING[grade], questionId, this.clock()));
  }

  async rate(questionId: string, rating: Rating): Promise<void> {
    await this.ready;
    await this.store(review(this.cards().get(questionId), rating, questionId, this.clock()));
  }

  private async store(card: CardState): Promise<void> {
    this.cards.update((cards) => new Map(cards).set(card.questionId, card));
    await this.repository.save(card);
  }
}
