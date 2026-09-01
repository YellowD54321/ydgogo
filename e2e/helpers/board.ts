import { Page, Locator, expect } from '@playwright/test';

/**
 * 棋盤操作 helper
 *
 * 棋盤是 SVG（見 GoBoard.tsx / gameConfig.ts）：
 *   像素座標 = PADDING + grid * CELL_SIZE  =  40 + grid * 30
 * 落子流程需先 hover（觸發 hoverPosition）再 click。
 */

const PADDING = 40;
const CELL_SIZE = 30;

function toPixel(grid: number): number {
  return PADDING + grid * CELL_SIZE;
}

export function getBoard(page: Page): Locator {
  return page.locator('svg').first();
}

/**
 * 在棋盤 (x, y) 座標落子：移動到該點觸發預覽後點擊。
 */
export async function placeStone(
  page: Page,
  x: number,
  y: number,
): Promise<void> {
  const board = getBoard(page);
  const box = await board.boundingBox();
  if (!box) throw new Error('找不到棋盤');

  // SVG 會等比縮放，需依實際渲染尺寸換算縮放比例
  const scaleX = box.width / (toPixel(18) + PADDING);
  const scaleY = box.height / (toPixel(18) + PADDING);

  const px = box.x + toPixel(x) * scaleX;
  const py = box.y + toPixel(y) * scaleY;

  // 先 hover 觸發預覽子（React 需 re-render 後 handleClick 才讀得到 hoverPosition），
  // 等預覽子（半透明 circle）出現再點擊，避免競態導致落子失敗。
  await page.mouse.move(px, py);
  await expect(board.locator('circle[opacity="0.5"]')).toHaveCount(1);
  await page.mouse.click(px, py);
}

/**
 * 計算目前棋盤上實心（已落子）棋子的數量。
 * 棋子為填色的 <circle>，不含格線、星位與半透明預覽子。
 */
export async function countStones(page: Page): Promise<number> {
  const board = getBoard(page);
  return board
    .locator('circle[fill="black"], circle[fill="white"]')
    .evaluateAll(
      (circles) =>
        circles.filter((c) => {
          const opacity = c.getAttribute('opacity');
          const r = Number(c.getAttribute('r'));
          // 排除半透明預覽子與小半徑的星位
          return (opacity === null || opacity === '1') && r > 5;
        }).length,
    );
}

export async function expectStoneCount(
  page: Page,
  expected: number,
): Promise<void> {
  await expect(async () => {
    expect(await countStones(page)).toBe(expected);
  }).toPass();
}
