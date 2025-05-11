import 'core-js/stable/structured-clone';
import 'fake-indexeddb/auto';
import { MoveTree } from '@/models/moveTree/MoveTree';
import { StoneColor } from '@/constants/gameConfig';
import { DraftService } from '@/services/DraftService';
import { IMoveTree } from '@/models/moveTree/types';
import { IDBFactory } from 'fake-indexeddb';

declare global {
  interface Window {
    indexedDB: IDBFactory;
  }
}

jest.mock('@/models/moveTree/MoveTree', () => {
  return {
    MoveTree: {
      deserialize: jest.fn((data) => {
        return {
          serialize: jest.fn(() => data),
        };
      }),
    },
  };
});

describe('DraftService', () => {
  let draftService: DraftService;
  let mockMoveTree: IMoveTree;

  beforeEach(async () => {
    global.indexedDB = new IDBFactory();
    draftService = new DraftService();
    await draftService.init();

    mockMoveTree = {
      serialize: jest.fn(() =>
        JSON.stringify({
          nodes: {
            root: {
              id: 'root',
              x: -1,
              y: -1,
              color: StoneColor.Empty,
              currentMoveNumber: 0,
              capturedGroups: [],
              parentId: null,
              childrenIds: [],
            },
          },
          rootNodeId: 'root',
          pointer: {
            currentNodeId: 'root',
            currentMoveNumber: 0,
            totalMoveNumber: 0,
          },
        })
      ),
    } as unknown as IMoveTree;
  });

  test('should be able to save a draft and return ID', async () => {
    const id = await draftService.saveDraft(mockMoveTree, 'Test Draft');
    expect(id).toBeTruthy();
  });

  test('should be able to load a draft by ID', async () => {
    const id = await draftService.saveDraft(mockMoveTree, 'Test Draft');
    const loadedMoveTree = await draftService.loadDraft(id);

    expect(loadedMoveTree).not.toBeNull();
    expect(MoveTree.deserialize).toHaveBeenCalled();
  });

  test('should be able to get all draft metadata', async () => {
    await draftService.saveDraft(mockMoveTree, 'Draft 1');
    await draftService.saveDraft(mockMoveTree, 'Draft 2');

    const allDrafts = await draftService.getAllDrafts();
    expect(allDrafts.length).toBe(2);
  });

  test('should be able to delete a draft', async () => {
    const id = await draftService.saveDraft(mockMoveTree, 'Test Draft');
    await draftService.deleteDraft(id);

    const loadedMoveTree = await draftService.loadDraft(id);
    expect(loadedMoveTree).toBeNull();
  });

  test('loadDraft should return null when draft does not exist', async () => {
    const loadedMoveTree = await draftService.loadDraft('non-existent-id');
    expect(loadedMoveTree).toBeNull();
  });
});
