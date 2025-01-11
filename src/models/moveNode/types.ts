import { StoneColor } from '@/constants/gameConfig';

export interface IMoveNodeProps {
  x: number;
  y: number;
  color: StoneColor;
  parentNode: IMoveNode | null;
  totalMoveNumber: number;
}

export interface IMoveNode extends Omit<IMoveNodeProps, 'totalMoveNumber'> {
  id: string;
  parentNode: IMoveNode | null;
  currentMoveNumber: number;
  childrenNodes: IMoveNode[];
  addChild(node: IMoveNode): void;
  removeChild(node: IMoveNode): void;
}
