const DB_NAME = 'mi-academia';
// v1: review-cards. v2: study-days.
const DB_VERSION = 2;

export const STORES = {
  reviewCards: { name: 'review-cards', keyPath: 'questionId' },
  studyDays: { name: 'study-days', keyPath: 'day' },
} as const;

/** IndexedDB speaks events; this turns one request into a promise. */
export function settle<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Resolves when the transaction commits, not when its requests succeed: only then is the data on disk. */
export function committed(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/**
 * One database shared by every repository. onupgradeneeded runs when the database is created or
 * DB_VERSION goes up; it only creates the stores that are missing, so an upgrade keeps existing data.
 */
export function openDatabase(factory: IDBFactory): Promise<IDBDatabase> {
  const request = factory.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = () => {
    for (const { name, keyPath } of Object.values(STORES)) {
      if (!request.result.objectStoreNames.contains(name)) request.result.createObjectStore(name, { keyPath });
    }
  };
  return settle(request);
}
