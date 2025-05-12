import { renderHook } from '@testing-library/react';
import { useService } from '../useService';
import { ServiceContext, ServiceContextType } from '@/contexts/ServiceContext';
import { DraftService } from '@/services/DraftService';

jest.mock('@/services/DraftService', () => ({
  DraftService: {
    getInstance: jest.fn(() => ({
      init: jest.fn().mockResolvedValue(undefined),
      saveDraft: jest.fn().mockResolvedValue('mock-id'),
      loadDraft: jest.fn().mockResolvedValue(null),
      getAllDrafts: jest.fn().mockResolvedValue([]),
      deleteDraft: jest.fn().mockResolvedValue(undefined),
    })),
  },
}));

describe('useService', () => {
  const mockDraftService = {
    init: jest.fn().mockResolvedValue(undefined),
    saveDraft: jest.fn().mockResolvedValue('mock-id'),
    loadDraft: jest.fn().mockResolvedValue(null),
    getAllDrafts: jest.fn().mockResolvedValue([]),
    deleteDraft: jest.fn().mockResolvedValue(undefined),
  } as unknown as DraftService;

  const mockServices: ServiceContextType = {
    draftService: mockDraftService,
    isInitialized: true,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ServiceContext.Provider value={mockServices}>
      {children}
    </ServiceContext.Provider>
  );

  it('should return services when used inside ServiceProvider', () => {
    const { result } = renderHook(() => useService(), { wrapper });

    expect(result.current).toBe(mockServices);
    expect(result.current.draftService).toBe(mockDraftService);
    expect(result.current.isInitialized).toBe(true);
  });

  it('should throw error when used outside ServiceProvider', () => {
    expect(() => {
      renderHook(() => useService());
    }).toThrow('useService must be used within a ServiceProvider');
  });
});
