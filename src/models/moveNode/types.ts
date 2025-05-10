import { Group } from '@/models/capture/types';
import { Stone } from '@/types/point';
import { ISerializedMoveNode } from '@/models/serialize/types';

export interface IMoveNodeProps extends Stone {
  parentNode: IMoveNode | null;
  totalMoveNumber: number;
  capturedGroups?: Group[];
}

export interface IMoveNode extends Omit<IMoveNodeProps, 'totalMoveNumber'> {
  readonly id: string;
  parentNode: IMoveNode | null;
  readonly currentMoveNumber: number;
  childrenNodes: IMoveNode[];
  setId(id: string): void;
  setCurrentMoveNumber(moveNumber: number): void;
  addChild(node: IMoveNode): void;
  removeChild(node: IMoveNode): void;
  serialize(): ISerializedMoveNode;
}
