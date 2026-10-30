import { Injectable } from '@angular/core';
import { CardState } from './leitner';

/**
 * Port for review progress. The abstract class doubles as the DI token, so the storage
 * (memory today, IndexedDB + Supabase later) changes without touching the review logic.
 */
@Injectable({ providedIn: 'root', useFactory: () => new InMemoryReviewRepository() })
export abstract class ReviewRepository {
  abstract load(): Promise<CardState[]>;
  abstract save(card: CardState): Promise<void>;
}

/** Keeps cards for the current session only; also the test double. */
export class InMemoryReviewRepository extends ReviewRepository {
  private readonly cards = new Map<string, CardState>();

  constructor(initial: CardState[] = []) {
    super();
    for (const card of initial) this.cards.set(card.questionId, card);
  }

  async load(): Promise<CardState[]> {
    return [...this.cards.values()];
  }

  async save(card: CardState): Promise<void> {
    this.cards.set(card.questionId, card);
  }
}
