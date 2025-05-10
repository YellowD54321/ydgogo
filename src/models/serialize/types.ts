import { StoneColor } from '@/constants/gameConfig';
import { Group } from '@/models/capture/types';

export interface ISerializedMoveNode {
  id: string;
  x: number;
  y: number;
  color: StoneColor;
  currentMoveNumber: number;
  capturedGroups: Group[];
  parentId: string | null;
  childrenIds: string[];
}

export interface ISerializedMoveTree {
  nodes: Record<string, ISerializedMoveNode>;
  rootNodeId: string;
  pointer: {
    currentNodeId: string;
    currentMoveNumber: number;
    totalMoveNumber: number;
  };
}
