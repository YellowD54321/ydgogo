import { useState } from 'react';
import { StoneColor } from '@/constants/gameConfig';

export interface Move {
  x: number;
  y: number;
  color: StoneColor;
  timestamp: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface UseMoveResult {
  boardState: StoneColor[][];
  moves: Move[];
  hoverPosition: Position | null;
  handleMouseMove: (position: Position | null) => void;
  handleClick: (position: Position) => void;
  nextColor: StoneColor;
}

export const useMove = (boardSize: number): UseMoveResult => {
  // 初始化空白棋盤
  const [boardState, setBoardState] = useState<StoneColor[][]>(
    Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill(StoneColor.Empty))
  );

  // 記錄所有落子
  const [moves, setMoves] = useState<Move[]>([]);

  // 記錄滑鼠位置
  const [hoverPosition, setHoverPosition] = useState<Position | null>(null);

  // 計算下一手顏色
  const nextColor =
    moves.length % 2 === 0 ? StoneColor.Black : StoneColor.White;

  // 處理滑鼠移動
  const handleMouseMove = (position: Position | null) => {
    setHoverPosition(position);
  };

  // 處理落子
  const handleClick = (position: Position) => {
    const { x, y } = position;

    // 檢查是否可以落子
    if (boardState[y][x] !== StoneColor.Empty) {
      return;
    }

    // 建立新的落子記錄
    const newMove: Move = {
      x,
      y,
      color: nextColor,
      timestamp: Date.now(),
    };

    // 更新棋盤狀態
    const newBoardState = boardState.map((row) => [...row]);
    newBoardState[y][x] = nextColor;
    setBoardState(newBoardState);

    // 更新落子記錄
    setMoves([...moves, newMove]);
  };

  return {
    boardState,
    moves,
    hoverPosition,
    handleMouseMove,
    handleClick,
    nextColor,
  };
};
