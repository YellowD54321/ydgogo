import { IMoveTree } from '@/models/moveTree/types';
import { MoveTree } from '@/models/moveTree/MoveTree';
import {
  IndexedDBService,
  IDraft,
  IDraftMetadata,
  SyncStatus,
} from './storage/IndexedDBService';
import { ISerializedMoveTree } from '@/models/serialize/types';

export class DraftService {
  private static instance: DraftService;
  private dbService: IndexedDBService;

  private constructor() {
    this.dbService = new IndexedDBService();
  }

  public static getInstance(): DraftService {
    if (!DraftService.instance) {
      DraftService.instance = new DraftService();
    }
    return DraftService.instance;
  }

  public async init(): Promise<void> {
    await this.dbService.init();
  }

  public async saveDraft(
    moveTree: IMoveTree,
    title: string,
    id?: string
  ): Promise<string> {
    const serializedData = moveTree.serialize();
    const gameTree: ISerializedMoveTree = JSON.parse(serializedData);
    const draft: IDraft = {
      id: id || '',
      title,
      createdAt: 0,
      updatedAt: 0,
      gameTree,
    };

    return await this.dbService.saveDraft(draft);
  }

  public async loadDraft(id: string): Promise<IMoveTree | null> {
    const draft = await this.dbService.getDraft(id);

    if (!draft) return null;

    const serializedData = JSON.stringify(draft.gameTree);
    return MoveTree.deserialize(serializedData);
  }

  public async getAllDrafts(): Promise<IDraftMetadata[]> {
    return await this.dbService.getAllDrafts();
  }

  public async deleteDraft(id: string): Promise<void> {
    await this.dbService.deleteDraft(id);
  }

  public async saveCloudDraft(
    moveTree: IMoveTree,
    title: string,
    userId: string,
    id?: string,
    serverUpdatedAt?: string,
  ): Promise<string> {
    const serializedData = moveTree.serialize();
    const gameTree: ISerializedMoveTree = JSON.parse(serializedData);
    const draft: IDraft = {
      id: id || '',
      title,
      createdAt: 0,
      updatedAt: 0,
      gameTree,
      syncStatus: 'pending',
      serverUpdatedAt: serverUpdatedAt ?? null,
      userId,
    };

    return await this.dbService.saveDraft(draft);
  }

  public async getPendingDrafts(): Promise<IDraft[]> {
    return await this.dbService.getPendingDrafts();
  }

  public async updateSyncStatus(
    id: string,
    syncStatus: SyncStatus,
    serverUpdatedAt?: string,
  ): Promise<void> {
    await this.dbService.updateSyncStatus(id, syncStatus, serverUpdatedAt);
  }
}
