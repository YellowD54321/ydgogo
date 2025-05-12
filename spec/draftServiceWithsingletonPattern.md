# DraftService 使用 Singleton Pattern

## 1. Singleton Pattern 簡介

Singleton Pattern（單例模式）是一種常見的設計模式，用於確保一個類在整個應用程序中只有一個實例存在，並提供一個全局訪問點來獲取該實例。

### 特點

- 全局只有一個實例
- 提供統一的訪問點
- 延遲初始化（lazy initialization）
- 確保線程安全（在多線程環境中）

## 2. 為什麼 DraftService 需要使用 Singleton Pattern

### 當前問題

目前 DraftService 在 MoveProvider 中使用 useRef 創建實例：

```typescript
const draftServiceRef = useRef<DraftService>(new DraftService());
```

這種方式有以下局限：

- 每個 MoveProvider 實例會創建自己的 DraftService
- 難以在其他組件中重用服務

### 使用 Singleton 的優勢

- **狀態一致性**：確保整個應用中使用同一個 IndexedDB 連接
- **資源優化**：避免多個實例重複初始化數據庫
- **集中管理**：減少組件複雜度
- **跨組件共享**：任何組件都可以訪問相同的服務實例
- **與 React 渲染週期解耦**：服務實例不受組件重新渲染影響

## 3. DraftService Singleton 實現

```typescript
// src/services/DraftService.ts
import { IMoveTree } from '@/models/moveTree/types';
import { MoveTree } from '@/models/moveTree/MoveTree';
import {
  IndexedDBService,
  IDraft,
  IDraftMetadata,
} from './storage/IndexedDBService';
import { ISerializedMoveTree } from '@/models/serialize/types';

export class DraftService {
  private static instance: DraftService;
  private dbService: IndexedDBService;
  private initialized: boolean = false;

  // 私有構造函數，防止外部直接創建實例
  private constructor() {
    this.dbService = new IndexedDBService();
  }

  // 獲取單例實例的靜態方法
  public static getInstance(): DraftService {
    if (!DraftService.instance) {
      DraftService.instance = new DraftService();
    }
    return DraftService.instance;
  }

  public async init(): Promise<void> {
    if (!this.initialized) {
      await this.dbService.init();
      this.initialized = true;
    }
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
      createdAt: 0,
      updatedAt: 0,
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
}
```

## 4. 與 React 組件的整合

### 直接在 MoveProvider 中使用

```typescript
// src/contexts/MoveProvider.tsx
import React, { useRef, useMemo, useEffect } from 'react';
// 其他引入不變...
import { DraftService } from '@/services/DraftService';

export const MoveProvider: React.FC<MoveProviderProps> = ({
  boardSize,
  children,
}) => {
  const moveTreeRef = useRef<MoveTree>(new MoveTree());

  // 初始化 DraftService 單例
  useEffect(() => {
    const initDraftService = async () => {
      await DraftService.getInstance().init();
    };
    initDraftService();
  }, []);

  // 其他代碼不變...
};
```

### 使用 Context 提供服務（推薦）

#### 1. 創建服務上下文

```typescript
// src/contexts/ServiceContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { DraftService } from '@/services/DraftService';

interface ServiceContextType {
  draftService: DraftService | null;
  isInitialized: boolean;
}

const ServiceContext = createContext<ServiceContextType>({
  draftService: null,
  isInitialized: false,
});

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const draftService = DraftService.getInstance();

  useEffect(() => {
    const initialize = async () => {
      await draftService.init();
      setIsInitialized(true);
    };

    initialize();
  }, []);

  return (
    <ServiceContext.Provider value={{ draftService, isInitialized }}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useService = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  return context;
};
```

#### 2. 在應用入口處使用

```typescript
// src/App.tsx
import React from 'react';
import { ServiceProvider } from './contexts/ServiceContext';
import { MoveProvider } from './contexts/MoveProvider';
import GoBoard from './components/GoBoard';
import ActionButtons from './components/ActionButtons';
import { BOARD_CONFIG } from './constants/gameConfig';

function App() {
  return (
    <ServiceProvider>
      <div className='relative flex flex-col items-center justify-center'>
        <MoveProvider boardSize={BOARD_CONFIG.SIZE}>
          <GoBoard />
          <ActionButtons />
        </MoveProvider>
      </div>
    </ServiceProvider>
  );
}

export default App;
```

#### 3. 在 MoveProvider 中使用服務

```typescript
// src/contexts/MoveProvider.tsx
import { useService } from './ServiceContext';

export const MoveProvider: React.FC<MoveProviderProps> = ({
  boardSize,
  children,
}) => {
  const { draftService, isInitialized } = useService();
  const moveTreeRef = useRef<MoveTree>(new MoveTree());

  // 其餘代碼不變...
};
```

## 5. 測試單例服務

```typescript
// 模擬 DraftService 單例
jest.mock('@/services/DraftService', () => {
  const mockInstance = {
    init: jest.fn().mockResolvedValue(undefined),
    saveDraft: jest.fn().mockResolvedValue('test-draft-id'),
  };

  return {
    DraftService: {
      getInstance: jest.fn().mockReturnValue(mockInstance),
    },
  };
});

describe('使用 DraftService 單例', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('應該調用保存方法', async () => {
    // 獲取模擬實例
    const draftServiceMock = DraftService.getInstance();
    // 測試代碼...
    expect(draftServiceMock.saveDraft).toHaveBeenCalled();
  });
});
```

## 6. 效能考量與最佳實踐

### 服務初始化

- 將服務初始化放在應用最外層（通過 Context）
- 避免在渲染頻繁的組件中重複獲取實例

### React 重新渲染的影響

- Singleton 服務實例存在於 React 渲染週期之外
- 服務狀態不受組件重新渲染影響
- 實例引用穩定，不會導致不必要的重新渲染

### 獲取實例的優化

使用組件外的變量存儲實例引用：

```typescript
// 在文件頂部獲取服務實例（僅獲取一次）
const draftService = DraftService.getInstance();

function MyComponent() {
  // 直接使用預先獲取的實例
  useEffect(() => {
    draftService.init();
  }, []);
}
```

### 異步操作處理

對於組件可能卸載的情況，使用 AbortController 或添加標志防止狀態更新：

```typescript
useEffect(() => {
  let isMounted = true;

  const saveData = async () => {
    const result = await draftService.saveDraft(data, '標題');
    if (isMounted) {
      // 更新狀態...
    }
  };

  saveData();

  return () => {
    isMounted = false;
  };
}, [data]);
```

## 7. 總結

採用 Singleton Pattern 重構 DraftService 帶來以下好處：

1. **統一管理**：整個應用中只有一個服務實例，確保數據一致性
2. **跨組件共享**：任何組件都可以便捷地訪問相同的服務
3. **資源優化**：避免重複初始化數據庫連接
4. **關注點分離**：服務邏輯與 UI 邏輯清晰分離
5. **簡化測試**：更容易進行服務的單元測試

通過 Context API 提供服務實例，進一步提升了代碼的可維護性和組織結構。
