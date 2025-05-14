import { useState, useEffect, useCallback } from 'react';
import { useService } from './useService';
import { MoveTree } from '@/models/moveTree/MoveTree';
import { IDraftMetadata } from '@/services/storage/IndexedDBService';
import { DRAFT_CONFIG } from '@/constants/gameConfig';

export interface DraftIdSource {
  urlId?: string;
  storageId?: string;
}

export interface UseDraftLoaderOptions {
  loadOnMount?: boolean;
  idSources?: DraftIdSource;
}

export interface UseDraftLoaderResult {
  draftTree: MoveTree | null;
  draftId: string | null;
  draftMetadata: IDraftMetadata | null;
  isLoading: boolean;
  error: Error | null;
  loadDraft: (id: string) => Promise<void>;
  loadNewGameDraft: () => Promise<void>;
}

export const useDraftLoader = (
  options: UseDraftLoaderOptions = {}
): UseDraftLoaderResult => {
  const { loadOnMount = true, idSources = {} } = options;
  const { urlId, storageId } = idSources;

  const [draftTree, setDraftTree] = useState<MoveTree | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [draftMetadata, setDraftMetadata] = useState<IDraftMetadata | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { draftService, isInitialized } = useService();

  const resolveDraftId = useCallback((): string => {
    if (urlId) return urlId;
    if (storageId) return storageId;

    return DRAFT_CONFIG.NEW_GAME_ID;
  }, [urlId, storageId]);

  const loadDraft = useCallback(
    async (id: string): Promise<void> => {
      if (!isInitialized) return;

      try {
        setIsLoading(true);
        setError(null);

        setCurrentDraftId(id);
        const moveTree = await draftService.loadDraft(id);

        if (moveTree) {
          setDraftTree(moveTree);

          const allDrafts = await draftService.getAllDrafts();
          const metadata = allDrafts.find((draft) => draft.id === id) || null;
          setDraftMetadata(metadata);
        } else {
          setError(new Error(`Draft with ID ${id} not found`));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to load draft')
        );
        console.error(`Failed to load draft with ID ${id}:`, err);
      } finally {
        setIsLoading(false);
      }
    },
    [draftService, isInitialized]
  );

  const loadNewGameDraft = useCallback(async (): Promise<void> => {
    await loadDraft(DRAFT_CONFIG.NEW_GAME_ID);
  }, [loadDraft]);

  useEffect(() => {
    if (!isInitialized || !loadOnMount) return;

    const autoLoadDraft = async () => {
      const resolvedId = resolveDraftId();

      await loadDraft(resolvedId);
    };

    autoLoadDraft();
  }, [isInitialized, loadOnMount, loadDraft, resolveDraftId]);

  return {
    draftTree,
    draftId: currentDraftId,
    draftMetadata,
    isLoading,
    error,
    loadDraft,
    loadNewGameDraft,
  };
};
