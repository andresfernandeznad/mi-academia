import { STORES, committed, openDatabase, settle } from '../storage/indexed-db';
// Type-only import: the StudyDaysRepository default factory imports this file, so a runtime import back would be circular.
import type { StudyDaysRepository } from './study-days.repository';

const STORE = STORES.studyDays.name;

/** Offline source of truth for study days. One record per day: { day: "YYYY-MM-DD" }. */
export class IndexedDbStudyDaysRepository implements StudyDaysRepository {
  private readonly db: Promise<IDBDatabase>;

  constructor(factory: IDBFactory = globalThis.indexedDB) {
    this.db = openDatabase(factory);
  }

  async load(): Promise<string[]> {
    const db = await this.db;
    const records = await settle(db.transaction(STORE, 'readonly').objectStore(STORE).getAll() as IDBRequest<{ day: string }[]>);
    return records.map((record) => record.day);
  }

  /** put() on an existing key overwrites it with the same value, so adding a day twice is harmless. */
  async add(days: readonly string[]): Promise<void> {
    if (days.length === 0) return;
    const tx = (await this.db).transaction(STORE, 'readwrite');
    for (const day of days) tx.objectStore(STORE).put({ day });
    await committed(tx);
  }
}
