# 導入 Playwright E2E 測試

## 目標

在現有的 Jest 單元測試之外，導入 Playwright 作為端對端（E2E）測試框架，用瀏覽器實際驗證使用者關鍵流程（落子、吃子、草稿自動儲存、登入導頁、棋譜清單/編輯）。

## 現況盤點

| 項目 | 現況 |
| --- | --- |
| 建置工具 | Vite（`npm run dev`，預設 port 5173） |
| 單元測試 | Jest + ts-jest + jsdom（`npm test`），測試檔 co-located 於 `__tests__/` |
| 前端框架 | React 18 + MUI + TanStack Router/Query |
| 認證 | Google OAuth（`@react-oauth/google`），路由用 `beforeLoad` 做守衛 |
| 本地儲存 | IndexedDB（棋譜草稿） |
| CI | GitHub Actions `unit-test.yml`，PR 觸發跑 `test:coverage` |
| 路由 | `/`(新對局)、`/login`、`/records`、`/records/$recordId` |

## 導入的關鍵挑戰

1. **Google OAuth 登入**：E2E 無法真的走 Google 第三方登入頁。需採「繞過認證」策略——在測試啟動時預先注入 auth 狀態（`localStorage`/`context`），或提供 test-only 的登入捷徑。這是本次導入最需要先決定的設計點。
2. **IndexedDB 狀態隔離**：每個測試需乾淨的 DB，避免草稿殘留互相污染。用 Playwright 的 `context` 隔離 + 測試前清空。
3. **與 Jest 共存**：兩者測試檔命名/型別設定需避免衝突（Jest 掃 `__tests__`，Playwright 掃 `e2e/`），並確保 tsconfig 與 lint 不互相干擾。

## 作業項目（Task Breakdown）

### 1. 安裝與初始化（約 1h）
- [ ] `npm i -D @playwright/test`
- [ ] `npx playwright install`（下載瀏覽器）
- [ ] 決定初期涵蓋瀏覽器（建議先只跑 Chromium，之後再擴充 Firefox/WebKit）

### 2. 設定檔 `playwright.config.ts`（約 1h）
- [ ] `testDir: './e2e'`
- [ ] `baseURL: 'http://localhost:5173'`
- [ ] `webServer` 設定：自動啟動 `npm run dev`、`reuseExistingServer: !process.env.CI`
- [ ] `projects` 設定（先 Chromium）
- [ ] reporter：本地 `list` + `html`，CI 加 artifact
- [ ] `resolve` 對齊 `@/` alias（如測試需 import src 型別）

### 3. 目錄與慣例（約 0.5h）
- [ ] 建立 `e2e/` 目錄
- [ ] 建立 `e2e/fixtures/`（共用 fixtures，如已登入的 page）
- [ ] 命名慣例：`e2e/<flow>.spec.ts`

### 4. 認證繞過機制（約 2-3h，最關鍵）
- [ ] 分析 `AuthProvider`/`AuthContext` 如何持久化登入狀態（token 存哪）
- [ ] 實作 `storageState` 或自訂 fixture，於測試前注入已登入狀態
- [ ] 建立 `authenticatedPage` fixture 供需要登入的測試使用
- [ ] 確認繞過方式不會洩漏真實憑證（用 mock token / 測試帳號）

### 5. 資料隔離（約 1h）
- [ ] 測試前清空 IndexedDB（`page.evaluate` 刪除 DB，或用獨立 context）
- [ ] 視需要 mock 雲端 API 回應（`page.route`），避免依賴後端

### 6. 首批 E2E 測試案例（約 3-4h）
- [ ] 落子流程：進入 `/`、在棋盤點擊、驗證棋子出現
- [ ] 吃子流程：布局後落子，驗證對方棋子被提走
- [ ] 未登入守衛：直接訪問 `/records` 應被導向 `/login`
- [ ] 已登入：訪問 `/records` 顯示棋譜清單
- [ ] 草稿自動儲存：落子後重整頁面，草稿仍在

### 7. Scripts 與忽略設定（約 0.5h）
- [ ] `package.json` 新增 `"test:e2e": "playwright test"`、`"test:e2e:ui": "playwright test --ui"`
- [ ] `.gitignore` 加入 `playwright-report/`、`test-results/`、`e2e/.auth/`
- [ ] （選用）Playwright 瀏覽器快取路徑處理

### 8. CI 整合（約 1-1.5h）
- [ ] 新增 `.github/workflows/e2e-test.yml`（或於既有 workflow 加 job）
- [ ] 步驟：checkout → setup node → `npm ci` → `npx playwright install --with-deps` → `npm run build`（或 dev）→ `npm run test:e2e`
- [ ] 上傳 `playwright-report/` 為 artifact
- [ ] 快取 Playwright 瀏覽器以加速

### 9. 文件（約 0.5h）
- [ ] `README.md` 補充 E2E 測試執行說明
- [ ] 說明認證繞過機制的使用方式

## 驗收標準

- [ ] `npm run test:e2e` 本地可綠燈通過首批案例
- [ ] Playwright 自動啟動 dev server，無需手動開
- [ ] 已登入/未登入 fixture 皆可用，且不含真實憑證
- [ ] CI 上 E2E job 通過並產出 HTML report artifact
- [ ] Jest 單元測試不受影響，仍正常運行

## 已定案決策

1. **認證繞過**：採「注入 localStorage token/user」方式（`e2e/fixtures/auth.ts` 用 `addInitScript`），最輕量且不需改動 production code。
2. **雲端 API**：E2E 一律用 `page.route` mock（`http://localhost:3000/records*`），不依賴真實後端。
3. **瀏覽器**：初期僅 Chromium，之後視需要於 `playwright.config.ts` 的 `projects` 擴充 Firefox / WebKit。
4. **視覺回歸測試**：本次不導入，未來再評估。

## 實作結果（已完成）

- `playwright.config.ts`：testDir `./e2e`、baseURL `localhost:5173`、`webServer` 自動啟動 `npm run dev`、Chromium project。
- `e2e/fixtures/auth.ts`：`injectAuth` / `authenticatedPage` fixture，注入 mock 憑證繞過登入。
- `e2e/helpers/board.ts`：`placeStone`（含 hover→click 競態處理）、`countStones` / `expectStoneCount`。
- `e2e/board.spec.ts`：落子、黑白交替、吃子提子、重整後草稿持久化（IndexedDB）。
- `e2e/auth.spec.ts`：未登入導向 `/login`、已登入（含 API mock）進入棋譜清單。
- `package.json`：新增 `test:e2e`、`test:e2e:ui`、`test:e2e:report`。
- `jest.config.cjs`：`testPathIgnorePatterns` 排除 `/e2e/`，避免與 Jest 衝突。
- `eslint.config.js`：為 `e2e/**` 關閉 `react-hooks/rules-of-hooks`（Playwright fixture 的 `use` 誤觸）。
- `.gitignore`：忽略 `playwright-report/`、`test-results/` 等產物。
- `.github/workflows/e2e-test.yml`：PR 觸發，含 Playwright 瀏覽器快取與 report artifact。
- `README.md`：補充單元測試與 E2E 測試執行說明。

**驗證**：`npm run test:e2e` 6/6 綠燈；`npm test` 106/106 綠燈（未受影響）；`npx eslint .` e2e 程式 0 錯誤。
