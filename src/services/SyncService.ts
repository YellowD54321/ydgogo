import { DraftService } from './DraftService';
import { updateRecord } from './api/recordsApi';
import { ISerializedMoveTree } from '@/models/serialize/types';

export class SyncService {
  static async syncPendingToServer(
    draftService: DraftService,
    token: string,
  ): Promise<{ synced: number; failed: number }> {
    const pendingDrafts = await draftService.getPendingDrafts();
    let synced = 0;
    let failed = 0;

    for (const draft of pendingDrafts) {
      if (!draft.userId) continue;

      try {
        const result = await updateRecord(token, draft.id, {
          title: draft.title,
          gameTree: draft.gameTree as ISerializedMoveTree,
        });

        await draftService.updateSyncStatus(
          draft.id,
          'synced',
          result.updatedAt,
        );
        synced++;
      } catch {
        failed++;
      }
    }

    return { synced, failed };
  }
}
