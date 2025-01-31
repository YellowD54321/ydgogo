import { Group } from '@/models/capture/types';
import { Stone } from '@/types/point';

export interface IMoveNodeProps extends Stone {
  parentNode: IMoveNode | null;
  totalMoveNumber: number;
  capturedGroups?: Group[];
}

export interface IMoveNode extends Omit<IMoveNodeProps, 'totalMoveNumber'> {
  id: string;
  parentNode: IMoveNode | null;
  currentMoveNumber: number;
  childrenNodes: IMoveNode[];
  addChild(node: IMoveNode): void;
  removeChild(node: IMoveNode): void;
}
