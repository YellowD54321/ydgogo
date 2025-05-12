# 落子後自動儲存草稿功能設計

## 1. 功能需求

- 在使用者落子後，將當前棋盤狀態自動儲存至 IndexedDB
- 自動儲存應該是無感的，不需要使用者手動觸發
- 每次落子都應更新同一份自動儲存的草稿，而非創建多份

## 2. 現有系統分析

### 2.1 相關元件

- **MoveProvider** (`src/contexts/MoveProvider.tsx`)

  - 管理棋盤狀態和落子邏輯
  - 包含 `handleClick` 函數處理落子操作
  - 使用 `moveTreeRef` 參考儲存棋盤樹狀結構

- **DraftService** (`src/services/DraftService.ts`)

  - 封裝 IndexedDB 操作
  - 提供草稿相關功能，包括儲存、讀取、刪除等
  - 已有 `saveDraft` 方法可用於儲存棋盤狀態

- **IndexedDBService** (`src/services/storage/IndexedDBService.ts`)
  - 處理與 IndexedDB 的底層互動
  - 實作草稿的 CRUD 操作

### 2.2 關鍵流程

1. 使用者點擊棋盤位置觸發 `handleClick`
2. 校驗落子是否合法
3. 執行 `moveTreeRef.current.addMove` 添加新的落子
4. 呼叫 `updateBoardState` 更新視覺棋盤

### 2.3 落子邏輯

```javascript
const handleClick = (position: Point) => {
  const { x, y } = position;
  const captureService = new CaptureService(BOARD_CONFIG.SIZE);

  if (!captureService.isLegalMove({ x, y, color: nextColor }, boardState)) {
    return;
  }

  const capturedGroups = captureService.getCapturedGroups(
    { x, y, color: nextColor },
    boardState
  );

  moveTreeRef.current.addMove({ x, y, color: nextColor }, capturedGroups);

  updateBoardState();
};
```

## 3. 修改方案

### 3.1 修改目標

主要修改 `MoveProvider.tsx` 檔案，在落子操作後添加自動儲存邏輯。

### 3.2 具體步驟

1. 導入 `DraftService`
2. 創建 `DraftService` 實例
3. 在組件掛載時初始化 `DraftService`
4. 在 `handleClick` 函數中落子操作完成後調用自動儲存方法
5. 可選：使用 Ref 或狀態保存當前自動儲存草稿的 ID

### 3.3 代碼變更建議

```typescript
// 在 MoveProvider.tsx 導入 DraftService
import { DraftService } from '@/services/DraftService';

export const MoveProvider: React.FC<MoveProviderProps> = ({
  boardSize,
  children,
}) => {
  // 創建 moveTreeRef
  const moveTreeRef = useRef<MoveTree>(new MoveTree());
  // 創建 draftService 實例
  const draftServiceRef = useRef<DraftService>(new DraftService());
  // 儲存自動保存草稿 ID
  const autoSaveDraftIdRef = useRef<string>('');

  // 初始化 draftService
  useEffect(() => {
    const initDraftService = async () => {
      await draftServiceRef.current.init();
    };
    initDraftService();
  }, []);

  // 修改 handleClick 函數
  const handleClick = (position: Point) => {
    const { x, y } = position;
    const captureService = new CaptureService(BOARD_CONFIG.SIZE);

    if (!captureService.isLegalMove({ x, y, color: nextColor }, boardState)) {
      return;
    }

    const capturedGroups = captureService.getCapturedGroups(
      { x, y, color: nextColor },
      boardState
    );

    moveTreeRef.current.addMove({ x, y, color: nextColor }, capturedGroups);

    updateBoardState();

    // 自動儲存草稿
    const autoSave = async () => {
      try {
        const draftId = await draftServiceRef.current.saveDraft(
          moveTreeRef.current,
          '自動儲存的棋譜',
          autoSaveDraftIdRef.current
        );
        autoSaveDraftIdRef.current = draftId;
      } catch (error) {
        console.error('自動儲存草稿失敗:', error);
      }
    };
    autoSave();
  };

  // ... 其餘代碼不變
};
```

## 4. 注意事項

1. 自動儲存可能會影響性能，應考慮是否需要防抖動處理
2. 需考慮處理儲存失敗的情況
3. 可能需要提供設定選項讓使用者啟用/停用自動儲存功能
4. 自動儲存的草稿需有明確的標示，避免與手動儲存的草稿混淆

## 5. 測試計劃

1. 測試落子後是否成功自動儲存
2. 測試加載自動儲存的草稿能否正確還原棋盤狀態
3. 測試連續多次落子是否正確更新同一份草稿
4. 測試異常情況下是否有適當的錯誤處理
