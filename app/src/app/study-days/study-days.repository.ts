import { Injectable } from '@angular/core';
import { IndexedDbStudyDaysRepository } from './indexed-db-study-days.repository';

/**
 * Port for study days. The abstract class doubles as the DI token, like ReviewRepository.
 * Falls back to memory where IndexedDB does not exist (jsdom in unit tests).
 */
@Injectable({
  providedIn: 'root',
  useFactory: () =>
    typeof indexedDB !== 'undefined' ? new IndexedDbStudyDaysRepository() : new InMemoryStudyDaysRepository(),
})
export abstract class StudyDaysRepository {
  abstract load(): Promise<string[]>;
  abstract add(days: readonly string[]): Promise<void>;
}

/** Keeps days for the current session only; also the test double. */
export class InMemoryStudyDaysRepository extends StudyDaysRepository {
  private readonly days: Set<string>;

  constructor(initial: string[] = []) {
    super();
    this.days = new Set(initial);
  }

  async load(): Promise<string[]> {
    return [...this.days];
  }

  async add(days: readonly string[]): Promise<void> {
    for (const day of days) this.days.add(day);
  }
}
