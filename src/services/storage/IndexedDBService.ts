import { ISerializedMoveTree } from '@/models/serialize/types';
import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'GoGameDB';
const DB_VERSION = 1;
const DRAFTS_STORE = 'drafts';

export interface IDraftMetadata {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface IDraft extends IDraftMetadata {
  gameTree: ISerializedMoveTree;
}

export class IndexedDBService {
  private db: IDBDatabase | null = null;

  public async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(new Error('Failed to open IndexedDB'));

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(DRAFTS_STORE)) {
          const store = db.createObjectStore(DRAFTS_STORE, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };
    });
  }

  public async saveDraft(draft: IDraft): Promise<string> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DRAFTS_STORE], 'readwrite');
      const store = transaction.objectStore(DRAFTS_STORE);

      draft.updatedAt = Date.now();
      if (!draft.id) {
        draft.id = uuidv4();
        draft.createdAt = draft.updatedAt;
      }

      const request = store.put(draft);

      request.onsuccess = () => resolve(draft.id);
      request.onerror = () => reject(new Error('Failed to save draft'));
    });
  }

  public async getDraft(id: string): Promise<IDraft | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DRAFTS_STORE], 'readonly');
      const store = transaction.objectStore(DRAFTS_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error('Failed to get draft'));
    });
  }

  public async getAllDrafts(): Promise<IDraftMetadata[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DRAFTS_STORE], 'readonly');
      const store = transaction.objectStore(DRAFTS_STORE);
      const index = store.index('updatedAt');
      const request = index.openCursor(null, 'prev'); // Sort by update time in descending order

      const drafts: IDraftMetadata[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest)
          .result as IDBCursorWithValue;

        if (cursor) {
          const { id, title, createdAt, updatedAt } = cursor.value;
          drafts.push({ id, title, createdAt, updatedAt });
          cursor.continue();
        } else {
          resolve(drafts);
        }
      };

      request.onerror = () => reject(new Error('Failed to get draft list'));
    });
  }

  public async deleteDraft(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DRAFTS_STORE], 'readwrite');
      const store = transaction.objectStore(DRAFTS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete draft'));
    });
  }
}
