import { test, expect } from '@playwright/test';
import { placeStone, expectStoneCount, countStones } from './helpers/board';

/**
 * 棋盤核心流程（新對局頁 `/`，訪客模式，不需登入、不依賴後端）
 * 草稿以 IndexedDB 儲存，重整後可復原。
 */
test.describe('棋盤操作', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 等待草稿載入完成，棋盤渲染
    await expect(page.locator('svg').first()).toBeVisible();
  });

  test('可在棋盤上落子', async ({ page }) => {
    await placeStone(page, 3, 3);
    await expectStoneCount(page, 1);
  });

  test('連續落子會黑白交替', async ({ page }) => {
    await placeStone(page, 3, 3);
    await placeStone(page, 15, 3);
    await expectStoneCount(page, 2);

    const board = page.locator('svg').first();
    await expect(board.locator('circle[fill="black"]')).toHaveCount(1);
    await expect(board.locator('circle[fill="white"]')).toHaveCount(1);
  });

  test('包圍對方棋子可提子', async ({ page }) => {
    // 黑先。將白子圍在左上角 (0,0) 後提掉：
    await placeStone(page, 1, 0); // 黑
    await placeStone(page, 0, 0); // 白（角上，僅剩 (0,1) 一氣）
    await placeStone(page, 0, 1); // 黑，吃掉白子

    // 若沒提子會有 3 顆；提掉白子後僅剩 2 顆黑子
    await expectStoneCount(page, 2);
    const board = page.locator('svg').first();
    await expect(board.locator('circle[fill="white"]')).toHaveCount(0);
    await expect(board.locator('circle[fill="black"]')).toHaveCount(2);
  });

  test('落子後重整頁面草稿仍保留', async ({ page }) => {
    await placeStone(page, 9, 9);
    await expectStoneCount(page, 1);

    // 等草稿寫入 IndexedDB 後重整
    await page.waitForTimeout(300);
    await page.reload();
    await expect(page.locator('svg').first()).toBeVisible();

    await expect(async () => {
      expect(await countStones(page)).toBe(1);
    }).toPass();
  });
});
