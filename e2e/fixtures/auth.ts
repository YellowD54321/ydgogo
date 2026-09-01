import { test as base, Page } from '@playwright/test';

/**
 * 認證繞過機制
 *
 * App 的登入狀態存於 localStorage（見 AuthProvider / authConfig）：
 *   - ydgogo_token：JWT / session token
 *   - ydgogo_user：{ userId, email } JSON
 *
 * E2E 無法真的走 Google OAuth 第三方登入頁，因此在 App 載入前
 * 用 addInitScript 預先注入 mock 憑證，讓路由守衛視為已登入。
 * 注意：此處僅使用測試專用的假 token，不含任何真實憑證。
 */

const AUTH_STORAGE_KEYS = {
  TOKEN: 'ydgogo_token',
  USER: 'ydgogo_user',
} as const;

export const TEST_USER = {
  userId: 'e2e-test-user',
  email: 'e2e@example.com',
} as const;

export const TEST_TOKEN = 'e2e-mock-token';

/**
 * 在 page 載入前注入登入狀態。addInitScript 會在每次 navigation
 * 的頁面腳本執行前先跑，確保 AuthProvider 初始化時就讀得到 token。
 */
export async function injectAuth(page: Page): Promise<void> {
  await page.addInitScript(
    ({ keys, token, user }) => {
      localStorage.setItem(keys.TOKEN, token);
      localStorage.setItem(keys.USER, JSON.stringify(user));
    },
    { keys: AUTH_STORAGE_KEYS, token: TEST_TOKEN, user: TEST_USER },
  );
}

/**
 * 提供 authenticatedPage fixture：取得已注入登入狀態的 page。
 * 需要登入的測試改用 `import { test } from './fixtures/auth'`。
 */
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await injectAuth(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
