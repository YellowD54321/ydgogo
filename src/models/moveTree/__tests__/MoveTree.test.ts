import { MoveTree, ROOT_NODE_ID } from '../MoveTree';
import { StoneColor } from '@/constants/gameConfig';

describe('MoveTree', () => {
  let moveTree: MoveTree;

  beforeEach(() => {
    moveTree = new MoveTree();
  });

  describe('Basic Operations', () => {
    it('should initialize with only root node', () => {
      expect(moveTree.rootNode).toBeDefined();
      expect(moveTree.pointer.currentNode.id).toBe(ROOT_NODE_ID);
      expect(moveTree.pointer.currentMoveNumber).toBe(0);
      expect(moveTree.pointer.totalMoveNumber).toBe(0);
    });

    it('should add move correctly', () => {
      moveTree.addMove({ x: 3, y: 3, color: StoneColor.Black }, []);

      expect(moveTree.pointer.currentMoveNumber).toBe(1);
      expect(moveTree.pointer.totalMoveNumber).toBe(1);
      expect(moveTree.pointer.currentNode.x).toBe(3);
      expect(moveTree.pointer.currentNode.y).toBe(3);
      expect(moveTree.pointer.currentNode.color).toBe(StoneColor.Black);
    });

    it('should go to previous step', () => {
      moveTree.addMove({ x: 3, y: 3, color: StoneColor.Black }, []);
      moveTree.addMove({ x: 4, y: 4, color: StoneColor.White }, []);

      expect(moveTree.previousStep()).toBe(true);
      expect(moveTree.pointer.currentMoveNumber).toBe(1);
      expect(moveTree.pointer.totalMoveNumber).toBe(2);
      expect(moveTree.pointer.currentNode.x).toBe(3);
      expect(moveTree.pointer.currentNode.y).toBe(3);
    });

    it('should go to next step', () => {
      moveTree.addMove({ x: 3, y: 3, color: StoneColor.Black }, []);
      moveTree.addMove({ x: 4, y: 4, color: StoneColor.White }, []);
      moveTree.previousStep();

      expect(moveTree.nextStep()).toBe(true);
      expect(moveTree.pointer.currentMoveNumber).toBe(2);
      expect(moveTree.pointer.totalMoveNumber).toBe(2);
      expect(moveTree.pointer.currentNode.x).toBe(4);
      expect(moveTree.pointer.currentNode.y).toBe(4);
    });

    it('should clear all moves', () => {
      moveTree.addMove({ x: 3, y: 3, color: StoneColor.Black }, []);
      moveTree.addMove({ x: 4, y: 4, color: StoneColor.White }, []);
      moveTree.clear();

      expect(moveTree.pointer.currentMoveNumber).toBe(0);
      expect(moveTree.pointer.totalMoveNumber).toBe(0);
      expect(moveTree.pointer.currentNode.id).toBe(ROOT_NODE_ID);
    });
  });

  describe('Node Navigation', () => {
    it('should find node by id', () => {
      moveTree.addMove({ x: 3, y: 3, color: StoneColor.Black }, []);
      const node = moveTree.pointer.currentNode;
      const foundNode = moveTree.getNodeById(node.id);

      expect(foundNode?.id).toBe(node.id);
    });

    it('should switch to specific node', () => {
      moveTree.addMove({ x: 3, y: 3, color: StoneColor.Black }, []);
      moveTree.addMove({ x: 4, y: 4, color: StoneColor.White }, []);
      const firstNode = moveTree.pointer.currentNode.parentNode;

      moveTree.switchToNode(firstNode!);
      expect(moveTree.pointer.currentNode.id).toBe(firstNode!.id);
      expect(moveTree.pointer.currentMoveNumber).toBe(1);
      expect(moveTree.pointer.totalMoveNumber).toBe(2);
    });
  });

  describe('Node ID Management', () => {
    it('should assign correct ID to root node', () => {
      expect(moveTree.rootNode.id).toBe(ROOT_NODE_ID);
    });

    it('should assign correct IDs to new moves based on totalMoveNumber', () => {
      moveTree.addMove({ x: 3, y: 3, color: StoneColor.Black }, []);
      expect(moveTree.pointer.currentNode.id).toBe('1');

      moveTree.addMove({ x: 4, y: 4, color: StoneColor.White }, []);
      expect(moveTree.pointer.currentNode.id).toBe('2');
    });

    it('should assign correct IDs when creating branches', () => {
      moveTree.addMove({ x: 3, y: 3, color: StoneColor.Black }, []);
      moveTree.addMove({ x: 4, y: 4, color: StoneColor.White }, []);

      moveTree.previousStep();

      moveTree.addMove({ x: 5, y: 5, color: StoneColor.White }, []);

      expect(moveTree.pointer.currentNode.id).toBe('3');

      const rootId = moveTree.rootNode.id;
      const firstMoveId = moveTree.rootNode.childrenNodes[0].id;
      const secondMoveInMainBranchId =
        moveTree.rootNode.childrenNodes[0].childrenNodes[0].id;
      const sidebranchMoveId =
        moveTree.rootNode.childrenNodes[0].childrenNodes[1].id;

      expect(rootId).toBe(ROOT_NODE_ID);
      expect(firstMoveId).toBe('1');
      expect(secondMoveInMainBranchId).toBe('2');
      expect(sidebranchMoveId).toBe('3');

      const allIds = [
        rootId,
        firstMoveId,
        secondMoveInMainBranchId,
        sidebranchMoveId,
      ];
      const uniqueIds = [...new Set(allIds)];

      expect(allIds).toHaveLength(4);
      expect(uniqueIds).toHaveLength(4);
    });

    it('should maintain correct ID after serialization and deserialization', () => {
      moveTree.addMove({ x: 3, y: 3, color: StoneColor.Black }, []);
      moveTree.addMove({ x: 4, y: 4, color: StoneColor.White }, []);
      moveTree.previousStep();
      moveTree.addMove({ x: 5, y: 5, color: StoneColor.White }, []);

      const serialized = moveTree.serialize();
      const deserialized = MoveTree.deserialize(serialized);

      expect(deserialized.rootNode.id).toBe(ROOT_NODE_ID);

      const firstMove = deserialized.rootNode.childrenNodes[0];
      expect(firstMove.id).toBe('1');

      const mainBranchSecondMove = firstMove.childrenNodes.find(
        (node) => node.x === 4 && node.y === 4
      );
      expect(mainBranchSecondMove?.id).toBe('2');

      const sideBranchMove = firstMove.childrenNodes.find(
        (node) => node.x === 5 && node.y === 5
      );
      expect(sideBranchMove?.id).toBe('3');
    });
  });
});
