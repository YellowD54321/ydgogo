import { Group } from '@/models/capture/types';
import { IMoveNode, IMoveNodeProps } from './types';
import { StoneColor } from '@/constants/gameConfig';
import { ISerializedMoveNode } from '@/models/serialize/types';

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

  /**
   * Serialize the node to a plain object
   * @returns A serialized representation of the node
   */
  public serialize(): ISerializedMoveNode {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      color: this.color,
      currentMoveNumber: this._currentMoveNumber,
      capturedGroups: this.capturedGroups,
      parentId: this.parentNode ? this.parentNode.id : null,
      childrenIds: this.childrenNodes.map((child) => child.id),
    };
  }

  /**
   * Create a MoveNode from serialized data
   * @param data The serialized node data
   * @returns A new MoveNode instance
   */
  public static deserialize(data: ISerializedMoveNode): MoveNode {
    const node = new MoveNode({
      x: data.x,
      y: data.y,
      color: data.color,
      parentNode: null, // Temporarily set to null, will be connected later
      totalMoveNumber: 0, // this only effect the id of the node, so it's not used in deserialize
      capturedGroups: data.capturedGroups || [],
    });

    node.setId(data.id);
    node.setCurrentMoveNumber(data.currentMoveNumber);

    return node;
  }
}
