# IndexedDB 草稿儲存機制設計

## 1. 建立 IndexedDB 服務

`src/services/storage/IndexedDBService.ts` 檔案負責處理 IndexedDB 的基本操作：

```typescript
import { ISerializedMoveTree } from '@/models/serialize/types';

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

      request.onerror = () => reject(new Error('無法開啟 IndexedDB'));

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
        draft.id = crypto.randomUUID();
        draft.createdAt = draft.updatedAt;
      }

      const request = store.put(draft);

      request.onsuccess = () => resolve(draft.id);
      request.onerror = () => reject(new Error('儲存草稿失敗'));
    });
  }

  public async getDraft(id: string): Promise<IDraft | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DRAFTS_STORE], 'readonly');
      const store = transaction.objectStore(DRAFTS_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error('取得草稿失敗'));
    });
  }

  public async getAllDrafts(): Promise<IDraftMetadata[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DRAFTS_STORE], 'readonly');
      const store = transaction.objectStore(DRAFTS_STORE);
      const index = store.index('updatedAt');
      const request = index.openCursor(null, 'prev'); // 以更新時間降序排列

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

      request.onerror = () => reject(new Error('取得草稿列表失敗'));
    });
  }

  public async deleteDraft(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DRAFTS_STORE], 'readwrite');
      const store = transaction.objectStore(DRAFTS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('刪除草稿失敗'));
    });
  }
}
```

## 2. 建立整合服務

`src/services/DraftService.ts` 檔案整合 IndexedDB 服務與 MoveTree 模型：

```typescript
import { IMoveTree } from '@/models/moveTree/types';
import { MoveTree } from '@/models/moveTree/MoveTree';
import {
  IndexedDBService,
  IDraft,
  IDraftMetadata,
} from './storage/IndexedDBService';
import { ISerializedMoveTree } from '@/models/serialize/types';

export class DraftService {
  private dbService: IndexedDBService;

  constructor() {
    this.dbService = new IndexedDBService();
  }

  public async init(): Promise<void> {
    await this.dbService.init();
  }

  public async saveDraft(
    moveTree: IMoveTree,
    title: string,
    id?: string
  ): Promise<string> {
    const serializedData = moveTree.serialize();
    const gameTree: ISerializedMoveTree = JSON.parse(serializedData);

    const draft: IDraft = {
      id: id || '',
      title,
      createdAt: 0, // 會在 dbService 中設定
      updatedAt: 0, // 會在 dbService 中設定
      gameTree,
    };

    return await this.dbService.saveDraft(draft);
  }

  public async loadDraft(id: string): Promise<IMoveTree | null> {
    const draft = await this.dbService.getDraft(id);

    if (!draft) return null;

    const serializedData = JSON.stringify(draft.gameTree);
    return MoveTree.deserialize(serializedData);
  }

  public async getAllDrafts(): Promise<IDraftMetadata[]> {
    return await this.dbService.getAllDrafts();
  }

  public async deleteDraft(id: string): Promise<void> {
    await this.dbService.deleteDraft(id);
  }

  public async autoSaveDraft(
    moveTree: IMoveTree,
    title: string
  ): Promise<string> {
    const autoSaveKey = 'autosave';
    return await this.saveDraft(
      moveTree,
      title || '自動儲存的草稿',
      autoSaveKey
    );
  }
}
```

## 主要功能

1. **IndexedDBService**:

   - 初始化資料庫和 store
   - 草稿的基本 CRUD 操作
   - 通過 updatedAt 索引實現按時間排序

2. **DraftService**:
   - 整合 MoveTree 模型與 IndexedDB 儲存
   - 序列化/反序列化 MoveTree
   - 提供自動儲存功能

## 資料結構

- **IDraftMetadata**: 草稿的基本資訊（無棋盤資料）

  - id: 唯一識別符
  - title: 草稿標題
  - createdAt: 建立時間戳
  - updatedAt: 更新時間戳

- **IDraft**: 完整草稿資料
  - 包含 IDraftMetadata 的所有欄位
  - gameTree: 序列化的棋盤樹狀結構
