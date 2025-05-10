import { Group } from '@/models/capture/types';
import { IMoveNode, IMoveNodeProps } from './types';
import { StoneColor } from '@/constants/gameConfig';

export class MoveNode implements IMoveNode {
  private _id: string;
  public readonly x: number;
  public readonly y: number;
  public readonly color: StoneColor;
  private _currentMoveNumber: number;
  public parentNode: IMoveNode | null;
  public childrenNodes: IMoveNode[];
  public capturedGroups: Group[];

  constructor(props: IMoveNodeProps) {
    this.x = props.x;
    this.y = props.y;
    this.color = props.color;
    this.parentNode = props.parentNode;
    this._currentMoveNumber =
      typeof props.parentNode?.currentMoveNumber === 'number'
        ? props.parentNode.currentMoveNumber + 1
        : 0; // 根節點的 currentMoveNumber 為 0
    this.childrenNodes = [];
    this.capturedGroups = props.capturedGroups || [];

    this._id = `${props.totalMoveNumber + 1}`;

    if (this.parentNode) {
      this.parentNode.addChild(this);
    }
  }

  public get id(): string {
    return this._id;
  }

  public setId(id: string) {
    this._id = id;
  }

  public get currentMoveNumber(): number {
    return this._currentMoveNumber;
  }

  public setCurrentMoveNumber(moveNumber: number): void {
    this._currentMoveNumber = moveNumber;
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
