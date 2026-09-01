# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Testing

### 單元測試（Jest）

```bash
npm test              # 執行所有單元測試
npm run test:watch    # watch 模式
npm run test:coverage # 產生覆蓋率報告
```

### E2E 測試（Playwright）

E2E 測試位於 `e2e/`，會自動啟動 Vite dev server（本地會重用既有 server）。

```bash
npm run test:e2e         # 執行 E2E 測試（headless）
npm run test:e2e:ui      # 以 UI 模式開啟，可逐步除錯
npm run test:e2e:report  # 開啟上一次的 HTML 報告
```

首次執行前需下載瀏覽器：

```bash
npx playwright install chromium
```

#### 認證繞過

App 透過 Google OAuth 登入，E2E 無法真的走第三方登入頁。
`e2e/fixtures/auth.ts` 會在頁面載入前用 `addInitScript` 注入 mock token 至
localStorage（key 見 `src/constants/authConfig.ts`），讓路由守衛視為已登入。
需要登入的測試改用 `import { test } from './fixtures/auth'` 取得 `authenticatedPage`，
或直接呼叫 `injectAuth(page)`。所用 token 皆為測試假值，不含真實憑證。

後端 API 以 `page.route('http://localhost:3000/records*', ...)` mock，測試不依賴真實後端。

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
