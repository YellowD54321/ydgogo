import { MoveNode } from '@/models/moveNode/MoveNode';
import { StoneColor } from '@/constants/gameConfig';

describe('MoveNode', () => {
  describe('Node Creation', () => {
    it('should create a node with correct properties', () => {
      const rootNode = new MoveNode({
        x: 3,
        y: 4,
        color: StoneColor.Black,
        parentNode: null,
        totalMoveNumber: 0,
      });

      expect(rootNode.id).toBeDefined();
      expect(rootNode.x).toBe(3);
      expect(rootNode.y).toBe(4);
      expect(rootNode.color).toBe(StoneColor.Black);
      expect(rootNode.parentNode).toBeNull();
      expect(rootNode.childrenNodes).toHaveLength(0);
    });

    it('should generate correct id format', () => {
      const node = new MoveNode({
        x: 0,
        y: 0,
        color: StoneColor.Black,
        parentNode: null,
        totalMoveNumber: 0,
      });

      expect(node.id).toBe('1');
    });
  });

  describe('Node Relationships', () => {
    it('should correctly set parent node', () => {
      const parentNode = new MoveNode({
        x: 3,
        y: 3,
        color: StoneColor.Black,
        parentNode: null,
        totalMoveNumber: 0,
      });

      const childNode = new MoveNode({
        x: 4,
        y: 4,
        color: StoneColor.White,
        parentNode: parentNode,
        totalMoveNumber: 1,
      });

      expect(childNode.parentNode?.id).toBe(parentNode.id);
      expect(parentNode.childrenNodes).toContain(childNode);
    });

    it('should manage children nodes', () => {
      const parentNode = new MoveNode({
        x: 3,
        y: 3,
        color: StoneColor.Black,
        parentNode: null,
        totalMoveNumber: 0,
      });

      const child1 = new MoveNode({
        x: 4,
        y: 4,
        color: StoneColor.White,
        parentNode: parentNode,
        totalMoveNumber: 1,
      });

      const child2 = new MoveNode({
        x: 15,
        y: 15,
        color: StoneColor.White,
        parentNode: parentNode,
        totalMoveNumber: 2,
      });

      expect(parentNode.childrenNodes).toHaveLength(2);
      expect(parentNode.childrenNodes).toContain(child1);
      expect(parentNode.childrenNodes).toContain(child2);
    });

    it('should not add duplicate child nodes', () => {
      const parentNode = new MoveNode({
        x: 3,
        y: 3,
        color: StoneColor.Black,
        parentNode: null,
        totalMoveNumber: 0,
      });

      const childNode = new MoveNode({
        x: 4,
        y: 4,
        color: StoneColor.White,
        parentNode: parentNode,
        totalMoveNumber: 1,
      });

      parentNode.addChild(childNode);
      expect(parentNode.childrenNodes).toHaveLength(1);

      parentNode.addChild(childNode);
      expect(parentNode.childrenNodes).toHaveLength(1);
      expect(parentNode.childrenNodes).toContain(childNode);
    });

    it('should successfully remove child node', () => {
      const parentNode = new MoveNode({
        x: 3,
        y: 3,
        color: StoneColor.Black,
        parentNode: null,
        totalMoveNumber: 0,
      });

      const childNode = new MoveNode({
        x: 4,
        y: 4,
        color: StoneColor.White,
        parentNode: parentNode,
        totalMoveNumber: 1,
      });

      parentNode.removeChild(childNode);
      expect(parentNode.childrenNodes).toHaveLength(0);
      expect(parentNode.childrenNodes).not.toContain(childNode);
    });

    it('should handle removing non-existent child node', () => {
      const parentNode = new MoveNode({
        x: 3,
        y: 3,
        color: StoneColor.Black,
        parentNode: null,
        totalMoveNumber: 0,
      });

      const nonChildNode = new MoveNode({
        x: 4,
        y: 4,
        color: StoneColor.White,
        parentNode: null,
        totalMoveNumber: 1,
      });

      expect(() => parentNode.removeChild(nonChildNode)).not.toThrow();
    });

    it('should correctly set currentMoveNumber', () => {
      const parentNode = new MoveNode({
        x: 3,
        y: 3,
        color: StoneColor.Black,
        parentNode: null,
        totalMoveNumber: 0,
      });

      const childNode = new MoveNode({
        x: 4,
        y: 4,
        color: StoneColor.White,
        parentNode: parentNode,
        totalMoveNumber: 1,
      });

      expect(parentNode.currentMoveNumber).toBe(0);
      expect(childNode.currentMoveNumber).toBe(1);
    });
  });
});
