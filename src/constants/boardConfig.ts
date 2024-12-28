export const BOARD_CONFIG = {
  SIZE: 19,
  CELL_SIZE: 30,
  PADDING: 40,
  STAR_POINTS: [
    { x: 3, y: 3 }, // 左上
    { x: 9, y: 3 }, // 上中
    { x: 15, y: 3 }, // 右上
    { x: 3, y: 9 }, // 左中
    { x: 9, y: 9 }, // 天元
    { x: 15, y: 9 }, // 右中
    { x: 3, y: 15 }, // 左下
    { x: 9, y: 15 }, // 下中
    { x: 15, y: 15 }, // 右下
  ],
  COLORS: {
    BOARD: '#DCB35C',
    LINE: '#4A3500',
    STAR: '#4A3500',
  },
} as const;

// 計算衍生的常數
export const BOARD_DIMENSIONS = {
  WIDTH:
    BOARD_CONFIG.CELL_SIZE * (BOARD_CONFIG.SIZE - 1) + BOARD_CONFIG.PADDING * 2,
  get HEIGHT() {
    return this.WIDTH;
  },
} as const;
