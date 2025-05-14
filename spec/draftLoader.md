# 草稿加載器 (Draft Loader) 設計規格

## 1. 設計目標

- 在進入頁面時自動加載已保存的圍棋草稿
- 支持不同頁面加載不同草稿
- 支持通過多種方式識別草稿（URL 參數、本地儲存等）
- 將草稿加載邏輯與棋盤邏輯分離，遵循單一職責原則
- 提供靈活的 API 以支持未來的擴展

## 2. 常量配置

將草稿相關常量添加到 `src/constants/gameConfig.ts`：

```typescript
// 草稿相關常量
export const DRAFT_CONFIG = {
  NEW_GAME_ID: 'new-game-draft',
  NEW_GAME_TITLE: 'New Game',
} as const;
```

## 3. Draft Loader Hook 設計

### 3.1 介面定義

```typescript
// ID 來源介面，用於統一處理不同來源的草稿 ID
export interface DraftIdSource {
  urlId?: string; // 從 URL 獲取的 ID
  storageId?: string; // 從其他儲存來源獲取的 ID
  // 未來可以新增其他來源
}

// Hook 選項介面
export interface UseDraftLoaderOptions {
  loadOnMount?: boolean; // 是否在掛載時自動載入
  idSources?: DraftIdSource; // 草稿 ID 來源
}

// Hook 返回結果介面
export interface UseDraftLoaderResult {
  draftTree: MoveTree | null; // 加載的棋譜樹
  draftId: string | null; // 當前加載的草稿ID
  draftMetadata: IDraftMetadata | null; // 當前草稿的元數據
  isLoading: boolean; // 是否正在加載
  error: Error | null; // 錯誤信息
  loadDraft: (id: string) => Promise<void>; // 載入指定ID的草稿
  loadNewGameDraft: () => Promise<void>; // 載入"New Game"草稿
}
```

### 3.2 實現

```typescript
// src/hooks/useDraftLoader.ts
import { useState, useEffect, useCallback } from 'react';
import { useService } from './useService';
import { MoveTree } from '@/models/moveTree/MoveTree';
import { IDraftMetadata } from '@/services/storage/IndexedDBService';
import { DRAFT_CONFIG } from '@/constants/gameConfig';

export const useDraftLoader = (
  options: UseDraftLoaderOptions = {}
): UseDraftLoaderResult => {
  const { loadOnMount = true, idSources = {} } = options;
  const { urlId, storageId } = idSources; // 解構 idSources 為基本屬性，避免無限渲染

  const [draftTree, setDraftTree] = useState<MoveTree | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [draftMetadata, setDraftMetadata] = useState<IDraftMetadata | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { draftService, isInitialized } = useService();

  // ID 來源解析邏輯，按優先順序選擇 ID
  const resolveDraftId = useCallback((): string => {
    if (urlId) return urlId;
    if (storageId) return storageId;
    return DRAFT_CONFIG.NEW_GAME_ID;
  }, [urlId, storageId]);

  // 載入指定 ID 的草稿
  const loadDraft = useCallback(
    async (id: string): Promise<void> => {
      if (!isInitialized) return;

      try {
        setIsLoading(true);
        setError(null);

        // 先設置 ID，即使找不到草稿也能知道嘗試加載的是哪個
        setCurrentDraftId(id);

        const moveTree = await draftService.loadDraft(id);

        if (moveTree) {
          setDraftTree(moveTree);

          const allDrafts = await draftService.getAllDrafts();
          const metadata = allDrafts.find((draft) => draft.id === id) || null;
          setDraftMetadata(metadata);
        } else {
          setError(new Error(`Draft with ID ${id} not found`));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to load draft')
        );
        console.error(`Failed to load draft with ID ${id}:`, err);
      } finally {
        setIsLoading(false);
      }
    },
    [draftService, isInitialized]
  );

  // 專門用於載入新遊戲草稿
  const loadNewGameDraft = useCallback(async (): Promise<void> => {
    await loadDraft(DRAFT_CONFIG.NEW_GAME_ID);
  }, [loadDraft]);

  // 自動載入草稿邏輯
  useEffect(() => {
    if (!isInitialized || !loadOnMount) return;

    const autoLoadDraft = async () => {
      // 根據解析邏輯選擇要載入的草稿 ID
      const resolvedId = resolveDraftId();
      await loadDraft(resolvedId);
    };

    autoLoadDraft();
  }, [isInitialized, loadOnMount, loadDraft, resolveDraftId]);

  return {
    draftTree,
    draftId: currentDraftId,
    draftMetadata,
    isLoading,
    error,
    loadDraft,
    loadNewGameDraft,
  };
};
```

## 4. DraftService 修改

在 DraftService 中處理草稿 ID 的邏輯：

```typescript
// src/services/DraftService.ts
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
    createdAt: 0,
    updatedAt: 0,
    gameTree,
  };

  return await this.dbService.saveDraft(draft);
}
```

## 5. MoveProvider 組件修改

MoveProvider 接受初始 MoveTree 和 draftId：

```typescript
interface MoveProviderProps {
  boardSize: number;
  initialMoveTree?: MoveTree | null;
  initialDraftId?: string | null;
  children: React.ReactNode;
}

export const MoveProvider: React.FC<MoveProviderProps> = ({
  boardSize,
  initialMoveTree = null,
  initialDraftId = null,
  children,
}) => {
  const moveTreeRef = useRef<MoveTree>(initialMoveTree || new MoveTree());
  const autoSaveDraftIdRef = useRef<string>(initialDraftId || '');

  // ... 其他代碼保持不變
};
```

## 6. 使用範例

### 6.1 通過 URL 參數加載草稿

```tsx
// App.tsx
// 從 URL 獲取草稿 ID
function useUrlDraftId(): string | undefined {
  const urlParams = new URLSearchParams(window.location.search);
  const draftId = urlParams.get('draftId');
  return draftId || undefined;
}

function NewGamePage() {
  // 從 URL 獲取草稿 ID
  const urlId = useUrlDraftId();

  // 使用 ID 來源解析功能
  const { draftTree, draftId, isLoading } = useDraftLoader({
    idSources: {
      urlId,
      // 可以添加其他來源，如從 localStorage 獲取
      // storageId: localStorage.getItem('lastDraftId'),
    },
  });

  return (
    <div className='relative flex flex-col items-center justify-center'>
      {isLoading ? (
        <div>載入草稿中...</div>
      ) : (
        <MoveProvider
          boardSize={BOARD_CONFIG.SIZE}
          initialMoveTree={draftTree}
          initialDraftId={draftId}
        >
          <GoBoard />
          <ActionButtons />
        </MoveProvider>
      )}
    </div>
  );
}
```

## 7. 測試策略

測試以下方面：

1. ID 來源優先順序：urlId > storageId > NEW_GAME_ID
2. 成功加載指定 ID 的草稿
3. 當沒有草稿時的錯誤處理
4. 加載過程中的狀態管理

## 8. 效能優化

為避免因物件引用變化導致的無限渲染問題，我們採用了以下策略：

1. 將 `idSources` 物件解構為具體的屬性 `urlId` 和 `storageId`
2. 在 `resolveDraftId` 的依賴項中使用這些基本類型屬性而非整個物件
3. 這樣可以避免每次重渲染時因物件引用變化而觸發 `useEffect`

## 9. 後續擴展可能性

此設計支持以下擴展：

1. 添加更多 ID 來源類型（例如雲端同步識別碼）
2. 實現草稿分類或標籤系統
3. 添加草稿共享功能
