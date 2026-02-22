import { ISerializedMoveTree } from '@/models/serialize/types';
import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'GoGameDB';
const DB_VERSION = 2;
const DRAFTS_STORE = 'drafts';

export type SyncStatus = 'synced' | 'pending' | 'conflict';

export interface IDraftMetadata {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  syncStatus?: SyncStatus;
  serverUpdatedAt?: string | null;
  userId?: string | null;
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
        const oldVersion = (event as IDBVersionChangeEvent).oldVersion;

        if (oldVersion < 1) {
          const store = db.createObjectStore(DRAFTS_STORE, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
          store.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        if (oldVersion >= 1 && oldVersion < 2) {
          const transaction = (event.target as IDBOpenDBRequest).transaction!;
          const store = transaction.objectStore(DRAFTS_STORE);
          if (!store.indexNames.contains('syncStatus')) {
            store.createIndex('syncStatus', 'syncStatus', { unique: false });
          }
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
          const { id, title, createdAt, updatedAt, syncStatus, serverUpdatedAt, userId } = cursor.value;
          drafts.push({ id, title, createdAt, updatedAt, syncStatus, serverUpdatedAt, userId });
          cursor.continue();
        } else {
          resolve(drafts);
        }
      };

      request.onerror = () => reject(new Error('Failed to get draft list'));
    });
  }

  public async getPendingDrafts(): Promise<IDraft[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DRAFTS_STORE], 'readonly');
      const store = transaction.objectStore(DRAFTS_STORE);
      const index = store.index('syncStatus');
      const request = index.getAll('pending');

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new Error('Failed to get pending drafts'));
    });
  }

  public async updateSyncStatus(
    id: string,
    syncStatus: SyncStatus,
    serverUpdatedAt?: string,
  ): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DRAFTS_STORE], 'readwrite');
      const store = transaction.objectStore(DRAFTS_STORE);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const draft = getRequest.result;
        if (!draft) {
          reject(new Error(`Draft with ID ${id} not found`));
          return;
        }

        draft.syncStatus = syncStatus;
        if (serverUpdatedAt !== undefined) {
          draft.serverUpdatedAt = serverUpdatedAt;
        }

        const putRequest = store.put(draft);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(new Error('Failed to update sync status'));
      };

      getRequest.onerror = () => reject(new Error('Failed to get draft for sync status update'));
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
