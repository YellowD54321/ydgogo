import { MoveNode } from '@/models/moveNode/MoveNode';
import { StoneColor } from '@/constants/gameConfig';
import { Group } from '@/models/capture/types';
import { ISerializedMoveNode } from '@/models/serialize/types';
import { Point } from '@/types/point';

describe('MoveNode Serialization', () => {
  describe('serialize method', () => {
    it('should correctly serialize MoveNode to ISerializedMoveNode', () => {
      const rootNode = new MoveNode({
        x: -1,
        y: -1,
        color: StoneColor.Empty,
        parentNode: null,
        totalMoveNumber: 0,
      });

      const node = new MoveNode({
        x: 3,
        y: 4,
        color: StoneColor.Black,
        parentNode: rootNode,
        totalMoveNumber: 1,
        capturedGroups: [],
      });

      const serialized = node.serialize();

      expect(serialized).toEqual({
        id: node.id,
        x: 3,
        y: 4,
        color: StoneColor.Black,
        currentMoveNumber: 1,
        capturedGroups: [],
        parentId: rootNode.id,
        childrenIds: [],
      });
    });

    it('should handle nodes without parent', () => {
      const rootNode = new MoveNode({
        x: -1,
        y: -1,
        color: StoneColor.Empty,
        parentNode: null,
        totalMoveNumber: 0,
      });

      const serialized = rootNode.serialize();

      expect(serialized.parentId).toBeNull();
    });

    it('should handle nodes with children', () => {
      const rootNode = new MoveNode({
        x: -1,
        y: -1,
        color: StoneColor.Empty,
        parentNode: null,
        totalMoveNumber: 0,
      });

      const child1 = new MoveNode({
        x: 3,
        y: 4,
        color: StoneColor.Black,
        parentNode: rootNode,
        totalMoveNumber: 1,
      });

      const child2 = new MoveNode({
        x: 5,
        y: 6,
        color: StoneColor.White,
        parentNode: rootNode,
        totalMoveNumber: 2,
      });

      const serialized = rootNode.serialize();

      expect(serialized.childrenIds).toHaveLength(2);
      expect(serialized.childrenIds).toContain(child1.id);
      expect(serialized.childrenIds).toContain(child2.id);
    });

    it('should handle captured stones', () => {
      const stonePoint: Point = { x: 5, y: 5 };
      const libertyPoint: Point = { x: 6, y: 5 };

      const capturedGroup: Group = {
        stones: [stonePoint],
        liberties: [libertyPoint],
        color: StoneColor.White,
      };

      const rootNode = new MoveNode({
        x: -1,
        y: -1,
        color: StoneColor.Empty,
        parentNode: null,
        totalMoveNumber: 0,
      });

      const node = new MoveNode({
        x: 3,
        y: 4,
        color: StoneColor.Black,
        parentNode: rootNode,
        totalMoveNumber: 1,
        capturedGroups: [capturedGroup],
      });

      const serialized = node.serialize();

      expect(serialized.capturedGroups).toHaveLength(1);
      expect(serialized.capturedGroups[0]).toEqual(capturedGroup);
    });
  });

  describe('deserialize method', () => {
    it('should correctly deserialize from ISerializedMoveNode to MoveNode', () => {
      const serializedData: ISerializedMoveNode = {
        id: '2',
        x: 3,
        y: 4,
        color: StoneColor.Black,
        currentMoveNumber: 1,
        capturedGroups: [],
        parentId: '1',
        childrenIds: [],
      };

      const node = MoveNode.deserialize(serializedData);

      expect(node).toBeInstanceOf(MoveNode);
      expect(node.x).toBe(3);
      expect(node.y).toBe(4);
      expect(node.color).toBe(StoneColor.Black);
      expect(node.currentMoveNumber).toBe(1);
      expect(node.capturedGroups).toHaveLength(0);
    });

    it('should handle captured stones when deserializing', () => {
      const stonePoint: Point = { x: 5, y: 5 };
      const libertyPoint: Point = { x: 6, y: 5 };

      const capturedGroup: Group = {
        stones: [stonePoint],
        liberties: [libertyPoint],
        color: StoneColor.White,
      };

      const serializedData: ISerializedMoveNode = {
        id: '2',
        x: 3,
        y: 4,
        color: StoneColor.Black,
        currentMoveNumber: 1,
        capturedGroups: [capturedGroup],
        parentId: '1',
        childrenIds: [],
      };

      const node = MoveNode.deserialize(serializedData);

      expect(node.capturedGroups).toHaveLength(1);
      expect(node.capturedGroups[0]).toEqual(capturedGroup);
    });
  });
});
