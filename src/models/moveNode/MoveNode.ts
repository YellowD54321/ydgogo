import { IMoveNode, IMoveNodeProps } from './types';
import { StoneColor } from '@/constants/gameConfig';

export class MoveNode implements IMoveNode {
  public readonly id: string;
  public readonly x: number;
  public readonly y: number;
  public readonly color: StoneColor;
  public readonly moveNumber: number;
  public readonly branchNumber: number;
  public parentNode: IMoveNode | null;
  public childrenNodes: IMoveNode[];

  constructor(props: IMoveNodeProps) {
    this.x = props.x;
    this.y = props.y;
    this.color = props.color;
    this.moveNumber = props.moveNumber;
    this.branchNumber = props.branchNumber;
    this.parentNode = props.parentNode || null;
    this.childrenNodes = [];

    this.id = `move_${this.moveNumber}_branch_${this.branchNumber}`;

    if (this.parentNode) {
      this.parentNode.addChild(this);
    }
  }

  public addChild(node: IMoveNode): void {
    if (!this.childrenNodes.includes(node)) {
      this.childrenNodes.push(node);
    }
  }

  public removeChild(node: IMoveNode): void {
    const index = this.childrenNodes.indexOf(node);
    if (index !== -1) {
      this.childrenNodes.splice(index, 1);
    }
  }
}
