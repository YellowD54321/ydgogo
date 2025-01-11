import { StoneColor } from '../../constants/gameConfig';

export interface IMoveNodeProps {
  x: number;
  y: number;
  color: StoneColor;
  parentNode?: IMoveNode | null;
  moveNumber: number;
  branchNumber: number;
}

export interface IMoveNode extends IMoveNodeProps {
  id: string;
  parentNode: IMoveNode | null;
  childrenNodes: IMoveNode[];
  addChild(node: IMoveNode): void;
  removeChild(node: IMoveNode): void;
}
