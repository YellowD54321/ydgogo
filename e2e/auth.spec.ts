import { test, expect, injectAuth } from './fixtures/auth';

/**
 * 路由守衛與認證繞過
 * 受保護路由（/records）在未登入時導向 /login，已登入時正常顯示。
 */
test.describe('認證與路由守衛', () => {
  test('未登入訪問 /records 會被導向 /login', async ({ page }) => {
    await page.goto('/records');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('已登入可進入棋譜清單', async ({ page }) => {
    await injectAuth(page);

    // mock 後端棋譜列表，避免依賴真實 API。
    // 只攔 API host（localhost:3000），不可攔到前端導航的 /records HTML 請求。
    await page.route('http://localhost:3000/records*', async (route) => {
      if (route.request().method() !== 'GET') return route.continue();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          records: [
            {
              recordId: 'rec-1',
              title: '測試棋譜',
              updatedAt: '2026-08-30T00:00:00.000Z',
            },
          ],
        }),
      });
    });

    await page.goto('/records');
    await expect(
      page.getByRole('heading', { name: '我的棋譜' }),
    ).toBeVisible();
    await expect(page.getByText('測試棋譜')).toBeVisible();
  });
});
