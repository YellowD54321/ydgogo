import { MoveNode } from '@/models/moveNode/MoveNode';
import { IMoveNode } from '@/models/moveNode/types';
import { IGamePointer, IMoveTree } from './types';
import { StoneColor } from '@/constants/gameConfig';
import { Group } from '@/models/capture/types';
import { Stone } from '@/types/point';
import {
  ISerializedMoveNode,
  ISerializedMoveTree,
} from '@/models/serialize/types';

export const DEFAULT_TOTAL_MOVE_NUMBER = 0;
export const ROOT_NODE_ID = 'ROOT';

export class MoveTree implements IMoveTree {
  public rootNode: IMoveNode;
  public pointer: IGamePointer;

  constructor() {
    this.rootNode = new MoveNode({
      x: -1,
      y: -1,
      color: StoneColor.Empty,
      parentNode: null,
      totalMoveNumber: DEFAULT_TOTAL_MOVE_NUMBER, // id 為 totalMoveNumber + 1
    });

    this.rootNode.setId(ROOT_NODE_ID); // 額外設定根節點的 id

    this.pointer = {
      currentNode: this.rootNode,
      currentMoveNumber: DEFAULT_TOTAL_MOVE_NUMBER,
      totalMoveNumber: DEFAULT_TOTAL_MOVE_NUMBER,
    };
  }

  public addMove(stone: Stone, capturedGroups: Group[]): void {
    const newNode = new MoveNode({
      x: stone.x,
      y: stone.y,
      color: stone.color,
      parentNode: this.pointer.currentNode,
      totalMoveNumber: this.pointer.totalMoveNumber,
      capturedGroups,
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
      totalMoveNumber: DEFAULT_TOTAL_MOVE_NUMBER,
    });

    this.rootNode.setId(ROOT_NODE_ID);

    this.pointer = {
      currentNode: this.rootNode,
      currentMoveNumber: DEFAULT_TOTAL_MOVE_NUMBER,
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

  /**
   * Serialize the move tree to a JSON string
   * @returns A JSON string representation of the move tree
   */
  public serialize(): string {
    const nodesMap: Record<string, ISerializedMoveNode> = {};

    const collectNodes = (node: IMoveNode) => {
      nodesMap[node.id] = node.serialize();
      node.childrenNodes.forEach((child) => collectNodes(child));
    };

    collectNodes(this.rootNode);

    const serializedTree: ISerializedMoveTree = {
      nodes: nodesMap,
      rootNodeId: this.rootNode.id,
      pointer: {
        currentNodeId: this.pointer.currentNode.id,
        currentMoveNumber: this.pointer.currentMoveNumber,
        totalMoveNumber: this.pointer.totalMoveNumber,
      },
    };

    return JSON.stringify(serializedTree);
  }

  /**
   * Create a move tree from a serialized JSON string
   * @param serializedData The JSON string representation of a move tree
   * @returns A new MoveTree instance
   */
  public static deserialize(serializedData: string): MoveTree {
    const data: ISerializedMoveTree = JSON.parse(serializedData);
    const moveTree = new MoveTree();
    const nodesMap: Record<string, IMoveNode> = {};

    Object.entries(data.nodes).forEach(([id, nodeData]) => {
      const node = MoveNode.deserialize(nodeData);
      nodesMap[id] = node;
    });

    Object.entries(data.nodes).forEach(([id, nodeData]) => {
      const node = nodesMap[id];

      if (nodeData.parentId && nodesMap[nodeData.parentId]) {
        node.parentNode = nodesMap[nodeData.parentId];

        if (!node.parentNode.childrenNodes.some((child) => child.id === id)) {
          node.parentNode.childrenNodes.push(node);
        }
      }
    });

    moveTree.rootNode = nodesMap[data.rootNodeId];
    moveTree.pointer = {
      currentNode: nodesMap[data.pointer.currentNodeId],
      currentMoveNumber: data.pointer.currentMoveNumber,
      totalMoveNumber: data.pointer.totalMoveNumber,
    };

    return moveTree;
  }
}
