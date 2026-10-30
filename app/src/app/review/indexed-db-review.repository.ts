import type { CardState } from './leitner';
// Type-only import: the ReviewRepository default factory imports this file, so a runtime import back would be circular.
import type { ReviewRepository } from './review.repository';

const DB_NAME = 'mi-academia';
const DB_VERSION = 1;
const STORE = 'review-cards';

/** IndexedDB speaks events; this turns one request into a promise. */
function settle<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function open(factory: IDBFactory): Promise<IDBDatabase> {
  const request = factory.open(DB_NAME, DB_VERSION);
  // Runs only when the database is created or DB_VERSION goes up: the place for schema changes.
  request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'questionId' });
  return settle(request);
}

/** Offline source of truth for review progress: survives reloads and works without network. */
export class IndexedDbReviewRepository implements ReviewRepository {
  private readonly db: Promise<IDBDatabase>;

  constructor(factory: IDBFactory = globalThis.indexedDB) {
    this.db = open(factory);
  }

  async load(): Promise<CardState[]> {
    const db = await this.db;
    return settle(db.transaction(STORE, 'readonly').objectStore(STORE).getAll() as IDBRequest<CardState[]>);
  }

  /** Resolves when the transaction commits, not when the put succeeds: only then is the card on disk. */
  async save(card: CardState): Promise<void> {
    const tx = (await this.db).transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(card);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }
}
