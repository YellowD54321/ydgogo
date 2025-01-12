import React, { useRef, useMemo } from 'react';
import { StoneColor } from '@/constants/gameConfig';
import { MoveTree } from '@/models/moveTree/MoveTree';
import { IMoveNode } from '@/models/moveNode/types';
import { MoveContext, Position } from './MoveContext';

interface MoveProviderProps {
  boardSize: number;
  children: React.ReactNode;
}

export const MoveProvider: React.FC<MoveProviderProps> = ({
  boardSize,
  children,
}) => {
  const moveTreeRef = useRef<MoveTree>(new MoveTree());
  const [boardState, setBoardState] = React.useState<StoneColor[][]>(
    Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill(StoneColor.Empty))
  );
  const [hoverPosition, setHoverPosition] = React.useState<Position | null>(
    null
  );

  const buttonStates = useMemo(() => {
    const currentNode = moveTreeRef.current.pointer.currentNode;
    return {
      canClear: currentNode !== moveTreeRef.current.rootNode,
      canPrevious: currentNode !== moveTreeRef.current.rootNode,
      canNext: currentNode.childrenNodes.length > 0,
    };
    // moveTree 是 useRef 的物件，所以不會觸發 re-render
    // 這邊以 boardState 來觸發 re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardState]);

  const updateBoardState = () => {
    const newBoardState = Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill(StoneColor.Empty));

    const path: IMoveNode[] = [];
    let currentNode: IMoveNode | null = moveTreeRef.current.pointer.currentNode;
    while (currentNode) {
      if (currentNode.x >= 0 && currentNode.y >= 0) {
        path.unshift(currentNode);
      }
      currentNode = currentNode.parentNode;
    }
    path.forEach((node) => {
      const { x, y, color } = node;
      if (x >= 0 && y >= 0) {
        newBoardState[y][x] = color;
      }
    });

    setBoardState(newBoardState);
  };

  const handleMouseMove = (position: Position | null) => {
    setHoverPosition(position);
  };

  const handleClick = (position: Position) => {
    const { x, y } = position;

    if (boardState[y][x] !== StoneColor.Empty) {
      return;
    }

    moveTreeRef.current.addMove(x, y, nextColor);

    updateBoardState();

    console.log(moveTreeRef.current);
  };

  const handlePreviousStep = () => {
    if (moveTreeRef.current.previousStep()) {
      updateBoardState();
    }
  };

  const handleNextStep = () => {
    if (moveTreeRef.current.nextStep()) {
      updateBoardState();
    }
  };

  const handleClear = () => {
    moveTreeRef.current.clear();
    updateBoardState();
  };

  const handleSwitchNode = (node: IMoveNode) => {
    moveTreeRef.current.switchToNode(node);
    updateBoardState();
  };

  const nextColor =
    moveTreeRef.current.pointer.currentNode.color === StoneColor.Black
      ? StoneColor.White
      : StoneColor.Black;

  const value = {
    boardState,
    moveTree: moveTreeRef.current,
    hoverPosition,
    nextColor,
    buttonStates,
    handleMouseMove,
    handleClick,
    handlePreviousStep,
    handleNextStep,
    handleClear,
    handleSwitchNode,
  };

  return <MoveContext.Provider value={value}>{children}</MoveContext.Provider>;
};
