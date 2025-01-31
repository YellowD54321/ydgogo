import { MoveTree } from '../MoveTree';
import { StoneColor } from '@/constants/gameConfig';

describe('MoveTree', () => {
  let moveTree: MoveTree;

  beforeEach(() => {
    moveTree = new MoveTree();
  });

  describe('Basic Operations', () => {
    it('should initialize with only root node', () => {
      expect(moveTree.rootNode).toBeDefined();
      expect(moveTree.pointer.currentNode.id).toBe(moveTree.rootNode.id);
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
      expect(moveTree.pointer.currentNode.id).toBe(moveTree.rootNode.id);
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
});
