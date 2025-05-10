import { MoveTree } from '@/models/moveTree/MoveTree';
import { StoneColor } from '@/constants/gameConfig';
import { ISerializedMoveTree } from '@/models/serialize/types';

describe('MoveTree Serialization', () => {
  describe('serialize method', () => {
    it('should serialize an empty MoveTree to JSON string', () => {
      const moveTree = new MoveTree();
      const serializedTree = moveTree.serialize();
      const deserialized = JSON.parse(serializedTree);

      expect(deserialized.rootNodeId).toBe(moveTree.rootNode.id);
      expect(deserialized.pointer.currentNodeId).toBe(
        moveTree.pointer.currentNode.id
      );
      expect(deserialized.pointer.currentMoveNumber).toBe(0);
      expect(deserialized.pointer.totalMoveNumber).toBe(0);
      expect(Object.keys(deserialized.nodes)).toHaveLength(1);
    });

    it('should serialize a MoveTree with multiple moves to JSON string', () => {
      const moveTree = new MoveTree();
      moveTree.addMove({ x: 3, y: 3, color: StoneColor.Black }, []);
      moveTree.addMove({ x: 4, y: 4, color: StoneColor.White }, []);
      moveTree.previousStep();
      moveTree.addMove({ x: 5, y: 5, color: StoneColor.White }, []);

      const serializedTree = moveTree.serialize();

      const deserialized = JSON.parse(serializedTree);

      expect(deserialized.rootNodeId).toBe(moveTree.rootNode.id);
      expect(deserialized.pointer.currentNodeId).toBe(
        moveTree.pointer.currentNode.id
      );
      expect(Object.keys(deserialized.nodes)).toHaveLength(4);
    });
  });

  describe('deserialize method', () => {
    it('should correctly deserialize from JSON string to MoveTree', () => {
      const rootNodeId = '1';
      const node1Id = '2';
      const node2Id = '3';

      const serializedData: ISerializedMoveTree = {
        nodes: {
          [rootNodeId]: {
            id: rootNodeId,
            x: -1,
            y: -1,
            color: StoneColor.Empty,
            currentMoveNumber: 0,
            capturedGroups: [],
            parentId: null,
            childrenIds: [node1Id],
          },
          [node1Id]: {
            id: node1Id,
            x: 3,
            y: 3,
            color: StoneColor.Black,
            currentMoveNumber: 1,
            capturedGroups: [],
            parentId: rootNodeId,
            childrenIds: [node2Id],
          },
          [node2Id]: {
            id: node2Id,
            x: 4,
            y: 4,
            color: StoneColor.White,
            currentMoveNumber: 2,
            capturedGroups: [],
            parentId: node1Id,
            childrenIds: [],
          },
        },
        rootNodeId: rootNodeId,
        pointer: {
          currentNodeId: node2Id,
          currentMoveNumber: 2,
          totalMoveNumber: 2,
        },
      };

      const serializedJson = JSON.stringify(serializedData);
      const deserializedTree = MoveTree.deserialize(serializedJson);

      expect(deserializedTree).toBeInstanceOf(MoveTree);
      expect(deserializedTree.rootNode.id).toBe(rootNodeId);
      expect(deserializedTree.pointer.currentNode.id).toBe(node2Id);
      expect(deserializedTree.pointer.currentMoveNumber).toBe(2);
      expect(deserializedTree.pointer.totalMoveNumber).toBe(2);

      const node1 = deserializedTree.rootNode.childrenNodes[0];
      expect(node1.id).toBe(node1Id);
      expect(node1.parentNode?.id).toBe(rootNodeId);

      const node2 = node1.childrenNodes[0];
      expect(node2.id).toBe(node2Id);
      expect(node2.parentNode?.id).toBe(node1Id);
    });
  });
});
