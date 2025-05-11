import 'core-js/stable/structured-clone';
import 'fake-indexeddb/auto';
import { IndexedDBService, IDraft } from '@/services/storage/IndexedDBService';
import { ISerializedMoveTree } from '@/models/serialize/types';
import { StoneColor } from '@/constants/gameConfig';
import { IDBFactory } from 'fake-indexeddb';

declare global {
  interface Window {
    indexedDB: IDBFactory;
  }
}

describe('IndexedDBService', () => {
  let dbService: IndexedDBService;
  const mockGameTree: ISerializedMoveTree = {
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
  };

  beforeEach(async () => {
    global.indexedDB = new IDBFactory();
    dbService = new IndexedDBService();
    await dbService.init();
  });

  test('should be able to save a draft and return ID', async () => {
    const draft: IDraft = {
      id: '',
      title: 'Test Draft',
      createdAt: 0,
      updatedAt: 0,
      gameTree: mockGameTree,
    };

    const id = await dbService.saveDraft(draft);
    expect(id).toBeTruthy();
  });

  test('should be able to get a draft by ID', async () => {
    const draft: IDraft = {
      id: '',
      title: 'Test Draft',
      createdAt: 0,
      updatedAt: 0,
      gameTree: mockGameTree,
    };

    const id = await dbService.saveDraft(draft);
    const retrievedDraft = await dbService.getDraft(id);

    expect(retrievedDraft).not.toBeNull();
    expect(retrievedDraft?.title).toBe('Test Draft');
    expect(retrievedDraft?.id).toBe(id);
  });

  test('should be able to get all draft metadata', async () => {
    const draft1: IDraft = {
      id: '',
      title: 'Draft 1',
      createdAt: 0,
      updatedAt: 0,
      gameTree: mockGameTree,
    };

    const draft2: IDraft = {
      id: '',
      title: 'Draft 2',
      createdAt: 0,
      updatedAt: 0,
      gameTree: mockGameTree,
    };

    await dbService.saveDraft(draft1);
    await dbService.saveDraft(draft2);

    const allDrafts = await dbService.getAllDrafts();
    expect(allDrafts.length).toBe(2);
    expect(allDrafts.map((draft) => draft.title)).toContain('Draft 2');
  });

  test('should be able to delete a draft', async () => {
    const draft: IDraft = {
      id: '',
      title: 'Test Draft',
      createdAt: 0,
      updatedAt: 0,
      gameTree: mockGameTree,
    };

    const id = await dbService.saveDraft(draft);
    await dbService.deleteDraft(id);
    const retrievedDraft = await dbService.getDraft(id);

    expect(retrievedDraft).toBeNull();
  });

  test('updating an existing draft should update the timestamp', async () => {
    const draft: IDraft = {
      id: '',
      title: 'Test Draft',
      createdAt: 0,
      updatedAt: 0,
      gameTree: mockGameTree,
    };

    const id = await dbService.saveDraft(draft);
    const firstDraft = await dbService.getDraft(id);

    await new Promise((resolve) => setTimeout(resolve, 1));

    const updatedDraft: IDraft = {
      ...firstDraft!,
      title: 'Updated Test Draft',
    };

    await dbService.saveDraft(updatedDraft);
    const retrievedDraft = await dbService.getDraft(id);

    expect(retrievedDraft?.title).toBe('Updated Test Draft');
    expect(retrievedDraft?.updatedAt).toBeGreaterThan(firstDraft!.updatedAt);
    expect(retrievedDraft?.createdAt).toBe(firstDraft!.createdAt);
  });
});
