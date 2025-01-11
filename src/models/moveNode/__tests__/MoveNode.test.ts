import { MoveNode } from '@/models/moveNode/MoveNode';
import { StoneColor } from '@/constants/gameConfig';

describe('MoveNode', () => {
  describe('Node Creation', () => {
    it('should create a node with correct properties', () => {
      const node = new MoveNode({
        x: 3,
        y: 4,
        color: StoneColor.BLACK,
        moveNumber: 1,
        branchNumber: 0,
      });

      expect(node.id).toBeDefined();
      expect(node.x).toBe(3);
      expect(node.y).toBe(4);
      expect(node.color).toBe(StoneColor.BLACK);
      expect(node.moveNumber).toBe(1);
      expect(node.branchNumber).toBe(0);
      expect(node.parentNode).toBeNull();
      expect(node.childrenNodes).toEqual([]);
    });

    it('should generate unique id for each node', () => {
      const node1 = new MoveNode({
        x: 0,
        y: 0,
        color: StoneColor.BLACK,
        moveNumber: 1,
        branchNumber: 0,
      });

      const node2 = new MoveNode({
        x: 0,
        y: 1,
        color: StoneColor.BLACK,
        moveNumber: 2,
        branchNumber: 0,
      });

      expect(node1.id).not.toBe(node2.id);
    });

    it('should generate correct id format', () => {
      const node = new MoveNode({
        x: 0,
        y: 0,
        color: StoneColor.BLACK,
        moveNumber: 1,
        branchNumber: 2,
      });

      expect(node.id).toBe('move_1_branch_2');
    });
  });

  describe('Node Relationships', () => {
    it('should correctly set parent node', () => {
      const parentNode = new MoveNode({
        x: 3,
        y: 3,
        color: StoneColor.BLACK,
        moveNumber: 1,
        branchNumber: 0,
      });

      const childNode = new MoveNode({
        x: 4,
        y: 4,
        color: StoneColor.WHITE,
        moveNumber: 2,
        branchNumber: 0,
        parentNode,
      });

      expect(childNode.parentNode).toBe(parentNode);
      expect(parentNode.childrenNodes).toContain(childNode);
    });

    it('should manage children nodes', () => {
      const parentNode = new MoveNode({
        x: 3,
        y: 3,
        color: StoneColor.BLACK,
        moveNumber: 1,
        branchNumber: 0,
      });

      const child1 = new MoveNode({
        x: 4,
        y: 4,
        color: StoneColor.WHITE,
        moveNumber: 2,
        branchNumber: 0,
        parentNode,
      });

      const child2 = new MoveNode({
        x: 15,
        y: 15,
        color: StoneColor.WHITE,
        moveNumber: 2,
        branchNumber: 1,
        parentNode,
      });

      expect(parentNode.childrenNodes).toHaveLength(2);
      expect(parentNode.childrenNodes).toContain(child1);
      expect(parentNode.childrenNodes).toContain(child2);
    });

    it('should not add duplicate child nodes', () => {
      const parentNode = new MoveNode({
        x: 3,
        y: 3,
        color: StoneColor.BLACK,
        moveNumber: 1,
        branchNumber: 0,
      });

      const childNode = new MoveNode({
        x: 4,
        y: 4,
        color: StoneColor.WHITE,
        moveNumber: 2,
        branchNumber: 0,
        parentNode,
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
        color: StoneColor.BLACK,
        moveNumber: 1,
        branchNumber: 0,
      });

      const childNode = new MoveNode({
        x: 4,
        y: 4,
        color: StoneColor.WHITE,
        moveNumber: 2,
        branchNumber: 0,
        parentNode,
      });

      parentNode.removeChild(childNode);
      expect(parentNode.childrenNodes).toHaveLength(0);
      expect(parentNode.childrenNodes).not.toContain(childNode);
    });

    it('should handle removing non-existent child node', () => {
      const parentNode = new MoveNode({
        x: 3,
        y: 3,
        color: StoneColor.BLACK,
        moveNumber: 1,
        branchNumber: 0,
      });

      const nonChildNode = new MoveNode({
        x: 4,
        y: 4,
        color: StoneColor.WHITE,
        moveNumber: 2,
        branchNumber: 0,
      });

      expect(() => parentNode.removeChild(nonChildNode)).not.toThrow();
    });
  });
});
