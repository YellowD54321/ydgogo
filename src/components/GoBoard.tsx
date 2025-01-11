import { FC } from 'react';
import {
  BOARD_CONFIG,
  BOARD_DIMENSIONS,
  StoneColor,
} from '@/constants/gameConfig';
import { useMove } from '@/hooks/move';

const GoBoard: FC = () => {
  const { boardState, hoverPosition, handleMouseMove, handleClick, nextColor } =
    useMove(BOARD_CONFIG.SIZE);

  const handleMouseMoveOnBoard = (e: React.MouseEvent<SVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(
      (e.clientX - rect.left - BOARD_CONFIG.PADDING) / BOARD_CONFIG.CELL_SIZE
    );
    const y = Math.round(
      (e.clientY - rect.top - BOARD_CONFIG.PADDING) / BOARD_CONFIG.CELL_SIZE
    );

    if (x >= 0 && x < BOARD_CONFIG.SIZE && y >= 0 && y < BOARD_CONFIG.SIZE) {
      handleMouseMove({ x, y });
    } else {
      handleMouseMove(null);
    }
  };

  return (
    <svg
      width={BOARD_DIMENSIONS.WIDTH}
      height={BOARD_DIMENSIONS.HEIGHT}
      onMouseMove={handleMouseMoveOnBoard}
      onMouseLeave={() => handleMouseMove(null)}
      onClick={() =>
        hoverPosition &&
        hoverPosition.x >= 0 &&
        hoverPosition.x < BOARD_CONFIG.SIZE &&
        hoverPosition.y >= 0 &&
        hoverPosition.y < BOARD_CONFIG.SIZE &&
        boardState[hoverPosition.y][hoverPosition.x] === StoneColor.Empty &&
        handleClick(hoverPosition)
      }
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
            cx={BOARD_CONFIG.PADDING + hoverPosition.x * BOARD_CONFIG.CELL_SIZE}
            cy={BOARD_CONFIG.PADDING + hoverPosition.y * BOARD_CONFIG.CELL_SIZE}
            r={BOARD_CONFIG.CELL_SIZE / 2 - 1}
            fill={nextColor === StoneColor.Black ? 'black' : 'white'}
            stroke={nextColor === StoneColor.White ? 'black' : 'none'}
            opacity={0.5}
          />
        )}
    </svg>
  );
};

export default GoBoard;
