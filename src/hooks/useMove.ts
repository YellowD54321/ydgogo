import { useState, useRef } from 'react';
import { StoneColor } from '@/constants/gameConfig';
import { MoveTree } from '@/models/moveTree/MoveTree';
import { IMoveNode } from '@/models/moveNode/types';

export interface Position {
  x: number;
  y: number;
}

export interface UseMoveResult {
  boardState: StoneColor[][];
  moveTree: MoveTree;
  hoverPosition: Position | null;
  handleMouseMove: (position: Position | null) => void;
  handleClick: (position: Position) => void;
  handlePreviousStep: () => void;
  handleNextStep: () => void;
  handleClear: () => void;
  handleSwitchNode: (node: IMoveNode) => void;
  nextColor: StoneColor;
}

export const useMove = (boardSize: number): UseMoveResult => {
  // 初始化空白棋盤
  const [boardState, setBoardState] = useState<StoneColor[][]>(
    Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill(StoneColor.Empty))
  );

  // 使用 MoveTree 管理落子紀錄
  const moveTreeRef = useRef<MoveTree>(new MoveTree());

  // 記錄滑鼠位置
  const [hoverPosition, setHoverPosition] = useState<Position | null>(null);

  // 計算下一手顏色
  const nextColor =
    moveTreeRef.current.pointer.currentNode.color === StoneColor.Black
      ? StoneColor.White
      : StoneColor.Black;

  // 更新棋盤狀態
  const updateBoardState = () => {
    // 清空棋盤
    const newBoardState = Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill(StoneColor.Empty));

    // 收集從根節點到當前節點的路徑
    const path: IMoveNode[] = [];
    let currentNode: IMoveNode | null = moveTreeRef.current.pointer.currentNode;
    while (currentNode) {
      if (currentNode.x >= 0 && currentNode.y >= 0) {
        // 排除根節點
        path.unshift(currentNode);
      }
      currentNode = currentNode.parentNode;
    }

    // 從根節點開始，依序放置棋子
    path.forEach((node) => {
      const { x, y, color } = node;
      newBoardState[y][x] = color;
    });

    setBoardState(newBoardState);
  };

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

    // 更新落子紀錄
    moveTreeRef.current.addMove(x, y, nextColor);

    // 更新棋盤狀態
    updateBoardState();

    console.log(moveTreeRef.current);
  };

  // 處理回到上一手
  const handlePreviousStep = () => {
    if (moveTreeRef.current.previousStep()) {
      updateBoardState();
    }
  };

  // 處理前進到下一手
  const handleNextStep = () => {
    if (moveTreeRef.current.nextStep()) {
      updateBoardState();
    }
  };

  // 處理清空棋盤
  const handleClear = () => {
    moveTreeRef.current.clear();
    updateBoardState();
  };

  // 處理切換到指定節點
  const handleSwitchNode = (node: IMoveNode) => {
    moveTreeRef.current.switchToNode(node);
    updateBoardState();
  };

  return {
    boardState,
    moveTree: moveTreeRef.current,
    hoverPosition,
    handleMouseMove,
    handleClick,
    handlePreviousStep,
    handleNextStep,
    handleClear,
    handleSwitchNode,
    nextColor,
  };
};
