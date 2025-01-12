import { MoveNode } from '@/models/moveNode/MoveNode';
import { IMoveNode } from '@/models/moveNode/types';
import { IGamePointer, IMoveTree } from './types';
import { StoneColor } from '@/constants/gameConfig';

const DEFAULT_TOTAL_MOVE_NUMBER = 0;

export class MoveTree implements IMoveTree {
  public rootNode: IMoveNode;
  public pointer: IGamePointer;

  constructor() {
    this.rootNode = new MoveNode({
      x: -1,
      y: -1,
      color: StoneColor.Empty,
      parentNode: null,
      totalMoveNumber: DEFAULT_TOTAL_MOVE_NUMBER, // id 為 totalMoveNumber + 1，將根節點的 id 設為 1
    });

    this.pointer = {
      currentNode: this.rootNode,
      currentMoveNumber: DEFAULT_TOTAL_MOVE_NUMBER,
      totalMoveNumber: DEFAULT_TOTAL_MOVE_NUMBER,
    };
  }

  public addMove(x: number, y: number, color: StoneColor): void {
    const newNode = new MoveNode({
      x,
      y,
      color,
      parentNode: this.pointer.currentNode,
      totalMoveNumber: this.pointer.totalMoveNumber,
    });

    this.pointer = {
      currentNode: newNode,
      currentMoveNumber: newNode.currentMoveNumber,
      totalMoveNumber: this.pointer.totalMoveNumber + 1,
    };
  }

  public previousStep(): boolean {
    if (!this.pointer.currentNode.parentNode) {
      return false;
    }

    const currentNode = this.pointer.currentNode.parentNode;

    this.pointer = {
      currentNode,
      currentMoveNumber: currentNode.currentMoveNumber,
      totalMoveNumber: this.pointer.totalMoveNumber,
    };
    return true;
  }

  public nextStep(): boolean {
    if (this.pointer.currentNode.childrenNodes.length === 0) {
      return false;
    }

    // FIXME: 暫時預設使用第一個子節點（主分支）
    const currentNode = this.pointer.currentNode.childrenNodes[0];

    this.pointer = {
      currentNode,
      currentMoveNumber: currentNode.currentMoveNumber,
      totalMoveNumber: this.pointer.totalMoveNumber,
    };
    return true;
  }

  public clear(): void {
    this.rootNode = new MoveNode({
      x: -1,
      y: -1,
      color: StoneColor.Empty,
      parentNode: null,
      totalMoveNumber: DEFAULT_TOTAL_MOVE_NUMBER - 1,
    });

    this.pointer = {
      currentNode: this.rootNode,
      currentMoveNumber: 0,
      totalMoveNumber: DEFAULT_TOTAL_MOVE_NUMBER,
    };
  }

  public switchToNode(node: IMoveNode): void {
    this.pointer = {
      currentNode: node,
      currentMoveNumber: node.currentMoveNumber,
      totalMoveNumber: this.pointer.totalMoveNumber,
    };
  }

  public getNodeById(id: string): IMoveNode | null {
    const findNode = (node: IMoveNode): IMoveNode | null => {
      if (node.id === id) {
        return node;
      }

      for (const child of node.childrenNodes) {
        const found = findNode(child);
        if (found) {
          return found;
        }
      }

      return null;
    };

    return findNode(this.rootNode);
  }
}
