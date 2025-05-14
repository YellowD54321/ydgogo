import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDraftLoader } from '../useDraftLoader';
import { ServiceContext } from '@/contexts/ServiceContext';
import { DRAFT_CONFIG } from '@/constants/gameConfig';
import { DraftService } from '@/services/DraftService';

const mockDraftService = {
  init: jest.fn().mockResolvedValue(undefined),
  saveDraft: jest.fn().mockResolvedValue('test-draft-id'),
  loadDraft: jest.fn().mockResolvedValue({
    serialize: jest.fn(),
  }),
  getAllDrafts: jest.fn().mockResolvedValue([
    {
      id: 'draft1',
      title: 'Test Draft',
      createdAt: 123,
      updatedAt: 456,
    },
  ]),
  deleteDraft: jest.fn().mockResolvedValue(undefined),
};

jest.spyOn(mockDraftService, 'getAllDrafts');
jest.spyOn(mockDraftService, 'loadDraft');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ServiceContext.Provider
    value={{
      draftService: mockDraftService as unknown as DraftService,
      isInitialized: true,
    }}
  >
    {children}
  </ServiceContext.Provider>
);

describe('useDraftLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load New Game draft by default', async () => {
    renderHook(() => useDraftLoader(), { wrapper });

    await waitFor(() => {
      expect(mockDraftService.loadDraft).toHaveBeenCalledWith(
        DRAFT_CONFIG.NEW_GAME_ID
      );
    });
  });

  it('should prioritize specified draftId', async () => {
    const specificDraftId = 'specific-draft-id';

    renderHook(
      () =>
        useDraftLoader({
          idSources: {
            urlId: specificDraftId,
          },
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(mockDraftService.loadDraft).toHaveBeenCalledWith(specificDraftId);
    });
  });

  it('should handle case when loadDraft returns null', async () => {
    mockDraftService.loadDraft.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useDraftLoader(), { wrapper });

    await waitFor(() => {
      expect(mockDraftService.loadDraft).toHaveBeenCalled();
    });

    expect(result.current.draftId).toBe(DRAFT_CONFIG.NEW_GAME_ID);
    expect(result.current.draftTree).toBeNull();
  });

  it('should support manually loading drafts', async () => {
    const { result } = renderHook(
      () =>
        useDraftLoader({
          loadOnMount: false,
        }),
      { wrapper }
    );

    expect(mockDraftService.loadDraft).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.loadDraft('draft1');
    });

    expect(mockDraftService.loadDraft).toHaveBeenCalledWith('draft1');
    expect(result.current.draftId).toBe('draft1');
  });

  it('should prioritize ID sources in correct order', async () => {
    const urlId = 'url-param-id';
    const storageId = 'storage-id';

    renderHook(
      () =>
        useDraftLoader({
          idSources: {
            urlId,
            storageId,
          },
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(mockDraftService.loadDraft).toHaveBeenCalledWith(urlId);
    });

    jest.clearAllMocks();

    renderHook(
      () =>
        useDraftLoader({
          idSources: {
            storageId,
          },
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(mockDraftService.loadDraft).toHaveBeenCalledWith(storageId);
    });

    jest.clearAllMocks();

    renderHook(
      () =>
        useDraftLoader({
          idSources: {},
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(mockDraftService.loadDraft).toHaveBeenCalledWith(
        DRAFT_CONFIG.NEW_GAME_ID
      );
    });
  });
});
