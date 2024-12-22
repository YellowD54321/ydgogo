import { FC } from 'react';
import { StoneColor } from '../constants/boardEnum';
import { useMove } from '../hooks/move';

const GoBoard: FC = () => {
  const BOARD_SIZE = 19;
  const CELL_SIZE = 30;
  const BOARD_PADDING = 40;
  const BOARD_WIDTH = CELL_SIZE * (BOARD_SIZE - 1) + BOARD_PADDING * 2;
  const BOARD_HEIGHT = BOARD_WIDTH;

  const { boardState, hoverPosition, handleMouseMove, handleClick, nextColor } =
    useMove(BOARD_SIZE);

  const handleMouseMoveOnBoard = (e: React.MouseEvent<SVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left - BOARD_PADDING) / CELL_SIZE);
    const y = Math.round((e.clientY - rect.top - BOARD_PADDING) / CELL_SIZE);

    if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
      handleMouseMove({ x, y });
    } else {
      handleMouseMove(null);
    }
  };

  // 定義星位座標
  const starPoints = [
    { x: 3, y: 3 }, // 左上
    { x: 9, y: 3 }, // 上中
    { x: 15, y: 3 }, // 右上
    { x: 3, y: 9 }, // 左中
    { x: 9, y: 9 }, // 天元
    { x: 15, y: 9 }, // 右中
    { x: 3, y: 15 }, // 左下
    { x: 9, y: 15 }, // 下中
    { x: 15, y: 15 }, // 右下
  ];

  return (
    <svg
      width={BOARD_WIDTH}
      height={BOARD_HEIGHT}
      onMouseMove={handleMouseMoveOnBoard}
      onMouseLeave={() => handleMouseMove(null)}
      onClick={() => hoverPosition && handleClick(hoverPosition)}
    >
      {/* 木頭底色 */}
      <rect x='0' y='0' width='100%' height='100%' fill='#DCB35C' />

      {/* 棋盤格線 */}
      {Array.from({ length: BOARD_SIZE }).map((_, i) => (
        <g key={i}>
          <line
            x1={BOARD_PADDING + i * CELL_SIZE}
            y1={BOARD_PADDING}
            x2={BOARD_PADDING + i * CELL_SIZE}
            y2={BOARD_PADDING + (BOARD_SIZE - 1) * CELL_SIZE}
            stroke='#4A3500'
            strokeWidth='0.8'
          />
          <line
            x1={BOARD_PADDING}
            y1={BOARD_PADDING + i * CELL_SIZE}
            x2={BOARD_PADDING + (BOARD_SIZE - 1) * CELL_SIZE}
            y2={BOARD_PADDING + i * CELL_SIZE}
            stroke='#4A3500'
            strokeWidth='0.8'
          />
        </g>
      ))}

      {/* 星位 */}
      {starPoints.map((point, index) => (
        <circle
          key={`star-${index}`}
          cx={BOARD_PADDING + point.x * CELL_SIZE}
          cy={BOARD_PADDING + point.y * CELL_SIZE}
          r={3}
          fill='#4A3500'
        />
      ))}

      {/* 繪製棋子 */}
      {boardState.map((row, y) =>
        row.map((cell, x) => {
          if (cell === StoneColor.Empty) return null;
          return (
            <circle
              key={`${x}-${y}`}
              cx={BOARD_PADDING + x * CELL_SIZE}
              cy={BOARD_PADDING + y * CELL_SIZE}
              r={CELL_SIZE / 2 - 1}
              fill={cell === StoneColor.Black ? 'black' : 'white'}
              stroke={cell === StoneColor.White ? 'black' : 'none'}
            />
          );
        })
      )}

      {/* 預覽棋子 */}
      {hoverPosition &&
        boardState[hoverPosition.y][hoverPosition.x] === StoneColor.Empty && (
          <circle
            cx={BOARD_PADDING + hoverPosition.x * CELL_SIZE}
            cy={BOARD_PADDING + hoverPosition.y * CELL_SIZE}
            r={CELL_SIZE / 2 - 1}
            fill={nextColor === StoneColor.Black ? 'black' : 'white'}
            stroke={nextColor === StoneColor.White ? 'black' : 'none'}
            opacity={0.5}
          />
        )}
    </svg>
  );
};

export default GoBoard;
