# 棋譜雲端儲存功能

本功能包含前後端協作，規格分兩處：

- **後端 API**：`ydgogo-backend/docs/records/records-api-spec.md`
- **前端功能**：[records-feature-spec.md](./records-feature-spec.md)（本專案）

## 快速摘要

- 後端：5 個 REST API（List/Get/Create/Update/Delete），JWT 驗證，DynamoDB 單表
- 前端：棋譜列表、編輯頁、離線優先同步、SyncService
