import { IMoveNode } from '@/models/moveNode/types';
import { Group } from '@/models/capture/types';
import { Stone } from '@/types/point';

export interface IGamePointer {
  currentNode: IMoveNode;
  currentMoveNumber: number;
  totalMoveNumber: number;
}

export interface IMoveTree {
  rootNode: IMoveNode;
  pointer: IGamePointer;

  addMove(stone: Stone, capturedGroups: Group[]): void;
  previousStep(): boolean;
  nextStep(): boolean;
  clear(): void;

  getNodeById(id: string): IMoveNode | null;
  switchToNode(node: IMoveNode): void;
}
