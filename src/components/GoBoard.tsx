import { FC } from 'react';
import {
  BOARD_CONFIG,
  BOARD_DIMENSIONS,
  StoneColor,
} from '@/constants/gameConfig';
import { useMove } from '@/hooks/useMove';

const GoBoard: FC = () => {
  const { boardState, hoverPosition, handleMouseMove, handleClick, nextColor } =
    useMove();

  const handleMouseMoveOnBoard = (e: React.MouseEvent<SVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    // 計算SVG的縮放比例
    const scaleX = rect.width / BOARD_DIMENSIONS.WIDTH;
    const scaleY = rect.height / BOARD_DIMENSIONS.HEIGHT;

    // 調整滑鼠座標以考慮縮放
    const adjustedX = (e.clientX - rect.left) / scaleX;
    const adjustedY = (e.clientY - rect.top) / scaleY;

    const x = Math.round(
      (adjustedX - BOARD_CONFIG.PADDING) / BOARD_CONFIG.CELL_SIZE
    );
    const y = Math.round(
      (adjustedY - BOARD_CONFIG.PADDING) / BOARD_CONFIG.CELL_SIZE
    );

    if (x >= 0 && x < BOARD_CONFIG.SIZE && y >= 0 && y < BOARD_CONFIG.SIZE) {
      handleMouseMove({ x, y });
    } else {
      handleMouseMove(null);
    }
  };

  const handleBoardClick = (): void => {
    if (
      hoverPosition &&
      boardState[hoverPosition.y][hoverPosition.x] === StoneColor.Empty
    ) {
      handleClick(hoverPosition);
    }
  };

  return (
    <div className='max-w-full max-h-full overflow-hidden'>
      <svg
        width={BOARD_DIMENSIONS.WIDTH}
        height={BOARD_DIMENSIONS.HEIGHT}
        viewBox={`0 0 ${BOARD_DIMENSIONS.WIDTH} ${BOARD_DIMENSIONS.HEIGHT}`}
        preserveAspectRatio='xMidYMid meet'
        className='h-auto max-w-full'
        onMouseMove={handleMouseMoveOnBoard}
        onMouseLeave={() => handleMouseMove(null)}
        onClick={handleBoardClick}
      >
        {/* 木頭底色 */}
        <rect
          x='0'
          y='0'
          width='100%'
          height='100%'
          fill={BOARD_CONFIG.COLORS.BOARD}
        />

        {/* 棋盤格線 */}
        {Array.from({ length: BOARD_CONFIG.SIZE }).map((_, i) => (
          <g key={i}>
            <line
              x1={BOARD_CONFIG.PADDING + i * BOARD_CONFIG.CELL_SIZE}
              y1={BOARD_CONFIG.PADDING}
              x2={BOARD_CONFIG.PADDING + i * BOARD_CONFIG.CELL_SIZE}
              y2={
                BOARD_CONFIG.PADDING +
                (BOARD_CONFIG.SIZE - 1) * BOARD_CONFIG.CELL_SIZE
              }
              stroke={BOARD_CONFIG.COLORS.LINE}
              strokeWidth='0.8'
            />
            <line
              x1={BOARD_CONFIG.PADDING}
              y1={BOARD_CONFIG.PADDING + i * BOARD_CONFIG.CELL_SIZE}
              x2={
                BOARD_CONFIG.PADDING +
                (BOARD_CONFIG.SIZE - 1) * BOARD_CONFIG.CELL_SIZE
              }
              y2={BOARD_CONFIG.PADDING + i * BOARD_CONFIG.CELL_SIZE}
              stroke={BOARD_CONFIG.COLORS.LINE}
              strokeWidth='0.8'
            />
          </g>
        ))}

        {/* 星位 */}
        {BOARD_CONFIG.STAR_POINTS.map((point, index) => (
          <circle
            key={`star-${index}`}
            cx={BOARD_CONFIG.PADDING + point.x * BOARD_CONFIG.CELL_SIZE}
            cy={BOARD_CONFIG.PADDING + point.y * BOARD_CONFIG.CELL_SIZE}
            r={3}
            fill={BOARD_CONFIG.COLORS.STAR}
          />
        ))}

        {/* 繪製棋子 */}
        {boardState.map((row, y) =>
          row.map((cell, x) => {
            if (cell === StoneColor.Empty) return null;
            const stoneColor = cell === StoneColor.Black ? 'black' : 'white';
            const strokeColor = cell === StoneColor.White ? 'black' : 'none';
            return (
              <circle
                key={`${x}-${y}`}
                cx={BOARD_CONFIG.PADDING + x * BOARD_CONFIG.CELL_SIZE}
                cy={BOARD_CONFIG.PADDING + y * BOARD_CONFIG.CELL_SIZE}
                r={BOARD_CONFIG.CELL_SIZE / 2 - 1}
                fill={stoneColor}
                stroke={strokeColor}
              />
            );
          })
        )}

        {/* 預覽棋子 */}
        {hoverPosition &&
          hoverPosition.x >= 0 &&
          hoverPosition.x < BOARD_CONFIG.SIZE &&
          hoverPosition.y >= 0 &&
          hoverPosition.y < BOARD_CONFIG.SIZE &&
          boardState[hoverPosition.y][hoverPosition.x] === StoneColor.Empty && (
            <circle
              cx={
                BOARD_CONFIG.PADDING + hoverPosition.x * BOARD_CONFIG.CELL_SIZE
              }
              cy={
                BOARD_CONFIG.PADDING + hoverPosition.y * BOARD_CONFIG.CELL_SIZE
              }
              r={BOARD_CONFIG.CELL_SIZE / 2 - 1}
              fill={nextColor === StoneColor.Black ? 'black' : 'white'}
              stroke={nextColor === StoneColor.White ? 'black' : 'none'}
              opacity={0.5}
            />
          )}
      </svg>
    </div>
  );
};

export default GoBoard;
