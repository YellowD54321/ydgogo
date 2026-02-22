# 棋譜雲端儲存功能規格（前端）

## 概述

在現有 IndexedDB 草稿系統基礎上，整合棋譜雲端 CRUD API，實作離線優先 (Offline-First) 的雙向同步。

## 功能需求

- 查詢棋譜列表
- 新增棋譜
- 編輯棋譜
- 離線時使用 IndexedDB，連線後同步至伺服器

## 路由

| 路徑 | 元件 | 說明 |
|------|------|------|
| `/records` | RecordListPage | 棋譜列表（需登入） |
| `/records/:recordId` | RecordEditPage | 編輯棋譜（需登入） |

首頁 `/` 可新增「另存到雲端」按鈕，將當前草稿存為雲端棋譜。

## API Client

新增 `src/services/api/recordsApi.ts`：

- 從 AuthContext 取得 token，組 `Authorization: Bearer <token>`
- `listRecords()`、`getRecord(id)`、`createRecord({ title, gameTree })`、`updateRecord(id, { title, gameTree })`、`deleteRecord(id)`
- 基底 URL 使用 `import.meta.env.VITE_API_BASE_URL`

## 資料模型擴充（IndexedDB）

在現有 `IDraft` 擴充欄位，區分本地草稿與雲端棋譜：

| 欄位 | 型別 | 說明 |
|------|------|------|
| syncStatus | 'synced' \| 'pending' \| 'conflict' | 同步狀態 |
| serverUpdatedAt | string \| null | 伺服器回傳的 updatedAt |
| userId | string \| null | 擁有者 userId，null 表示純本地草稿 |

- 有 `userId` = 需同步的雲端棋譜
- 無 `userId` = 純本地草稿，不與伺服器同步

## 儲存流程（離線優先）

1. 使用者下棋／編輯時，**先寫入 IndexedDB**（syncStatus: pending）
2. 若連線：非同步呼叫 API
3. API 成功：更新 IndexedDB 該筆為 `synced`，記錄 `serverUpdatedAt`
4. API 失敗：維持 `pending`，由 SyncService 稍後重試

## 同步服務（SyncService）

- `syncPendingToServer()`：查詢 `syncStatus === 'pending'` 的項目，逐一呼叫對應 API
- 觸發時機：`navigator.onLine` 為 true、`window` 的 `online` 事件
- 可整合 React Query 的 `refetchOnReconnect` 或自訂 useEffect

## 讀取優先順序

- **列表**：合併 IndexedDB（pending + synced）與 API 回傳，以 `updatedAt` 排序
- **單筆**：有 recordId 時，先查 IndexedDB，再向 API 取得最新版；離線則僅用 IndexedDB

## 同步衝突處理

**情境**：A 裝置離線編輯、B 裝置已同步，A 上線後上傳。

**建議策略**：

- 後端：若傳入 `updatedAt` 早於 DB，回傳 409 Conflict
- 前端：收到 409 時標記 `conflict`，UI 顯示「有更新版本，是否覆蓋？」

**第一階段簡化**：可先採用 Last-Write-Wins，不做 409，之後再補衝突 UI。

## UI 元件

- **RecordListPage**：列表、新增按鈕、編輯／刪除操作、進入棋盤
- **RecordEditPage**：沿用現有 GoBoard、MoveProvider，資料來源改為 API + IndexedDB

## 實作順序建議

1. recordsApi、getAuthHeaders
2. RecordListPage、RecordEditPage、路由與導航
3. 擴充 DraftService / IndexedDB 支援 syncStatus、userId
4. MoveProvider / useDraftLoader 改為登入時優先存雲端，離線 fallback IndexedDB
5. SyncService 與 online 事件觸發同步
6. （可選）衝突偵測與 conflict UI
