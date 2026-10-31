import { STORES, committed, openDatabase, settle } from '../storage/indexed-db';
import type { CardState } from './leitner';
// Type-only import: the ReviewRepository default factory imports this file, so a runtime import back would be circular.
import type { ReviewRepository } from './review.repository';

const STORE = STORES.reviewCards.name;

/** Offline source of truth for review progress: survives reloads and works without network. */
export class IndexedDbReviewRepository implements ReviewRepository {
  private readonly db: Promise<IDBDatabase>;

  constructor(factory: IDBFactory = globalThis.indexedDB) {
    this.db = openDatabase(factory);
  }

  async load(): Promise<CardState[]> {
    const db = await this.db;
    return settle(db.transaction(STORE, 'readonly').objectStore(STORE).getAll() as IDBRequest<CardState[]>);
  }

  async save(card: CardState): Promise<void> {
    const tx = (await this.db).transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(card);
    await committed(tx);
  }
}
