import { createContext } from 'react';
import { StoneColor } from '@/constants/gameConfig';
import { MoveTree } from '@/models/moveTree/MoveTree';
import { IMoveNode } from '@/models/moveNode/types';
import { Point } from '@/types/point';

export interface ButtonStates {
  canClear: boolean;
  canPrevious: boolean;
  canNext: boolean;
}

export interface MoveContextType {
  boardState: StoneColor[][];
  moveTree: MoveTree;
  hoverPosition: Point | null;
  nextColor: StoneColor;
  buttonStates: ButtonStates;
  handleMouseMove: (position: Point | null) => void;
  handleClick: (position: Point) => void;
  handlePreviousStep: () => void;
  handleNextStep: () => void;
  handleClear: () => void;
  handleSwitchNode: (node: IMoveNode) => void;
}

export const MoveContext = createContext<MoveContextType | null>(null);
