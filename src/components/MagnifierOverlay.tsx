import { FC, useMemo } from 'react';
import { Point } from '@/types/point';
import { BOARD_CONFIG, StoneColor } from '@/constants/gameConfig';

interface MagnifierOverlayProps {
  centerPosition: Point; // 中心點座標（棋盤座標）
  currentPosition: Point | null; // 當前選中的座標（棋盤座標）
  boardState: StoneColor[][]; // 棋盤狀態
  nextColor: StoneColor; // 下一步的顏色
  fingerPosition: { x: number; y: number }; // 手指位置（螢幕座標）
}

// 放大鏡配置
const MAGNIFIER_CONFIG = {
  SIZE: 240, // 放大鏡直徑
  GRID_SIZE: 9, // 顯示 9x9 區域
  OFFSET_Y: 50, // 手指上方偏移量
  MAGNIFICATION: 2.5, // 放大倍率
} as const;

interface MagnifierRange {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const MagnifierOverlay: FC<MagnifierOverlayProps> = ({
  centerPosition,
  currentPosition,
  boardState,
  nextColor,
  fingerPosition,
}) => {
  // 計算 9x9 區域的範圍（處理邊界情況）
  const magnifierRange: MagnifierRange = useMemo(() => {
    const halfSize = Math.floor(MAGNIFIER_CONFIG.GRID_SIZE / 2); // 4

    // 處理邊界情況
    let startX = centerPosition.x - halfSize;
    let startY = centerPosition.y - halfSize;
    let endX = centerPosition.x + halfSize;
    let endY = centerPosition.y + halfSize;

    // 調整邊界
    if (startX < 0) {
      startX = 0;
      endX = Math.min(BOARD_CONFIG.SIZE - 1, MAGNIFIER_CONFIG.GRID_SIZE - 1);
    }
    if (startY < 0) {
      startY = 0;
      endY = Math.min(BOARD_CONFIG.SIZE - 1, MAGNIFIER_CONFIG.GRID_SIZE - 1);
    }
    if (endX >= BOARD_CONFIG.SIZE) {
      endX = BOARD_CONFIG.SIZE - 1;
      startX = Math.max(0, BOARD_CONFIG.SIZE - MAGNIFIER_CONFIG.GRID_SIZE);
    }
    if (endY >= BOARD_CONFIG.SIZE) {
      endY = BOARD_CONFIG.SIZE - 1;
      startY = Math.max(0, BOARD_CONFIG.SIZE - MAGNIFIER_CONFIG.GRID_SIZE);
    }

    return { startX, startY, endX, endY };
  }, [centerPosition]);

  // 計算放大鏡位置（預設在手指上方，避免被遮擋）
  const magnifierPosition = useMemo(() => {
    let x = fingerPosition.x - MAGNIFIER_CONFIG.SIZE / 2;
    let y =
      fingerPosition.y - MAGNIFIER_CONFIG.SIZE - MAGNIFIER_CONFIG.OFFSET_Y;

    // 確保不超出螢幕左右邊界
    if (x < 10) x = 10;
    if (x + MAGNIFIER_CONFIG.SIZE > window.innerWidth - 10) {
      x = window.innerWidth - MAGNIFIER_CONFIG.SIZE - 10;
    }

    // 只有當放大鏡會超出螢幕頂部時，才改顯示在手指下方
    // 允許放大鏡稍微超出螢幕頂部，以優先保持在手指上方
    if (y < -50) {
      // 改為顯示在手指下方
      y = fingerPosition.y + MAGNIFIER_CONFIG.OFFSET_Y;
    }

    return { x, y };
  }, [fingerPosition]);

  // 計算放大後的格子大小
  const magnifiedCellSize =
    BOARD_CONFIG.CELL_SIZE * MAGNIFIER_CONFIG.MAGNIFICATION;
  const gridWidth =
    (magnifierRange.endX - magnifierRange.startX) * magnifiedCellSize;
  const gridHeight =
    (magnifierRange.endY - magnifierRange.startY) * magnifiedCellSize;
  const viewBoxSize = Math.max(gridWidth, gridHeight) + magnifiedCellSize * 2;

  return (
    <div
      className='fixed z-50 pointer-events-none'
      style={{
        left: `${magnifierPosition.x}px`,
        top: `${magnifierPosition.y}px`,
        width: `${MAGNIFIER_CONFIG.SIZE}px`,
        height: `${MAGNIFIER_CONFIG.SIZE}px`,
      }}
    >
      {/* 圓形遮罩容器 */}
      <div
        className='overflow-hidden w-full h-full rounded-full'
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '2px solid #333',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <svg
          width='100%'
          height='100%'
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          preserveAspectRatio='xMidYMid meet'
        >
          {/* 木頭底色 */}
          <rect
            x='0'
            y='0'
            width='100%'
            height='100%'
            fill={BOARD_CONFIG.COLORS.BOARD}
          />

          <g
            transform={`translate(${(viewBoxSize - gridWidth) / 2}, ${
              (viewBoxSize - gridHeight) / 2
            })`}
          >
            {/* 繪製格線 */}
            {Array.from(
              { length: magnifierRange.endX - magnifierRange.startX + 1 },
              (_, i) => i
            ).map((i) => (
              <g key={`line-${i}`}>
                {/* 垂直線 */}
                <line
                  x1={i * magnifiedCellSize}
                  y1={0}
                  x2={i * magnifiedCellSize}
                  y2={
                    (magnifierRange.endY - magnifierRange.startY) *
                    magnifiedCellSize
                  }
                  stroke={BOARD_CONFIG.COLORS.LINE}
                  strokeWidth='2'
                />
                {/* 水平線 */}
                {i <= magnifierRange.endY - magnifierRange.startY && (
                  <line
                    x1={0}
                    y1={i * magnifiedCellSize}
                    x2={
                      (magnifierRange.endX - magnifierRange.startX) *
                      magnifiedCellSize
                    }
                    y2={i * magnifiedCellSize}
                    stroke={BOARD_CONFIG.COLORS.LINE}
                    strokeWidth='2'
                  />
                )}
              </g>
            ))}

            {/* 繪製已有的棋子 */}
            {Array.from(
              { length: magnifierRange.endY - magnifierRange.startY + 1 },
              (_, i) => i + magnifierRange.startY
            ).map((y) =>
              Array.from(
                { length: magnifierRange.endX - magnifierRange.startX + 1 },
                (_, i) => i + magnifierRange.startX
              ).map((x) => {
                const stone = boardState[y]?.[x];
                if (stone === StoneColor.Empty) return null;

                const cx = (x - magnifierRange.startX) * magnifiedCellSize;
                const cy = (y - magnifierRange.startY) * magnifiedCellSize;
                const radius = magnifiedCellSize / 2 - 2;

                return (
                  <circle
                    key={`stone-${x}-${y}`}
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill={stone === StoneColor.Black ? 'black' : 'white'}
                    stroke={stone === StoneColor.White ? 'black' : 'none'}
                    strokeWidth='1.5'
                  />
                );
              })
            )}

            {/* 高亮當前選中位置 */}
            {currentPosition &&
              currentPosition.x >= magnifierRange.startX &&
              currentPosition.x <= magnifierRange.endX &&
              currentPosition.y >= magnifierRange.startY &&
              currentPosition.y <= magnifierRange.endY &&
              boardState[currentPosition.y]?.[currentPosition.x] ===
                StoneColor.Empty && (
                <>
                  {/* 預覽棋子 */}
                  <circle
                    cx={
                      (currentPosition.x - magnifierRange.startX) *
                      magnifiedCellSize
                    }
                    cy={
                      (currentPosition.y - magnifierRange.startY) *
                      magnifiedCellSize
                    }
                    r={magnifiedCellSize / 2 - 2}
                    fill={nextColor === StoneColor.Black ? 'black' : 'white'}
                    stroke={nextColor === StoneColor.White ? 'black' : 'none'}
                    strokeWidth='1.5'
                    opacity='0.7'
                  />
                  {/* 十字準星 */}
                  <g
                    transform={`translate(${
                      (currentPosition.x - magnifierRange.startX) *
                      magnifiedCellSize
                    }, ${
                      (currentPosition.y - magnifierRange.startY) *
                      magnifiedCellSize
                    })`}
                  >
                    <circle
                      cx={0}
                      cy={0}
                      r={magnifiedCellSize / 2 + 5}
                      fill='none'
                      stroke='#ff6b6b'
                      strokeWidth='3'
                      opacity='0.8'
                    />
                  </g>
                </>
              )}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default MagnifierOverlay;
