import { createContext } from 'react';
import { StoneColor } from '@/constants/gameConfig';
import { MoveTree } from '@/models/moveTree/MoveTree';
import { IMoveNode } from '@/models/moveNode/types';

export interface Position {
  x: number;
  y: number;
}

export interface ButtonStates {
  canClear: boolean;
  canPrevious: boolean;
  canNext: boolean;
}

export interface MoveContextType {
  boardState: StoneColor[][];
  moveTree: MoveTree;
  hoverPosition: Position | null;
  nextColor: StoneColor;
  buttonStates: ButtonStates;
  handleMouseMove: (position: Position | null) => void;
  handleClick: (position: Position) => void;
  handlePreviousStep: () => void;
  handleNextStep: () => void;
  handleClear: () => void;
  handleSwitchNode: (node: IMoveNode) => void;
}

export const MoveContext = createContext<MoveContextType | null>(null);
