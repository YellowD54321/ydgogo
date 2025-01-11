import { IMoveNode } from '@/models/moveNode/types';
import { StoneColor } from '@/constants/gameConfig';

export interface IGamePointer {
  currentNode: IMoveNode;
  currentMoveNumber: number;
  totalMoveNumber: number;
}

export interface IMoveTree {
  rootNode: IMoveNode;
  pointer: IGamePointer;

  addMove(x: number, y: number, color: StoneColor): void;
  previousStep(): boolean;
  nextStep(): boolean;
  clear(): void;

  getNodeById(id: string): IMoveNode | null;
  switchToNode(node: IMoveNode): void;
}
