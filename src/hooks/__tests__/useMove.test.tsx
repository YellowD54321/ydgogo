import { renderHook, act } from '@testing-library/react';
import { useMove } from '../useMove';
import { StoneColor } from '@/constants/gameConfig';
import { MoveProvider } from '@/contexts/MoveProvider';
import { ServiceContext, ServiceContextType } from '@/contexts/ServiceContext';
import { DraftService } from '@/services/DraftService';

const mockInitFn = jest.fn().mockResolvedValue(undefined);
const mockSaveDraftFn = jest.fn().mockResolvedValue('test-draft-id');
const mockLoadDraftFn = jest.fn().mockResolvedValue(null);
const mockGetAllDraftsFn = jest.fn().mockResolvedValue([]);
const mockDeleteDraftFn = jest.fn().mockResolvedValue(undefined);

jest.mock('@/services/DraftService', () => ({
  DraftService: {
    getInstance: jest.fn(() => ({
      init: mockInitFn,
      saveDraft: mockSaveDraftFn,
      loadDraft: mockLoadDraftFn,
      getAllDrafts: mockGetAllDraftsFn,
      deleteDraft: mockDeleteDraftFn,
    })),
  },
}));

const MockServiceProvider = ({ children }: { children: React.ReactNode }) => {
  const draftService = DraftService.getInstance();
  const mockServiceContext: ServiceContextType = {
    draftService,
    isInitialized: true,
  };

  return (
    <ServiceContext.Provider value={mockServiceContext}>
      {children}
    </ServiceContext.Provider>
  );
};

describe('useMove', () => {
  const BOARD_SIZE = 19;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MockServiceProvider>
      <MoveProvider boardSize={BOARD_SIZE}>{children}</MoveProvider>
    </MockServiceProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty board', () => {
    const { result } = renderHook(() => useMove(), { wrapper });

    // 檢查初始棋盤是否為空
    expect(result.current.boardState).toHaveLength(BOARD_SIZE);
    result.current.boardState.forEach((row) => {
      expect(row).toHaveLength(BOARD_SIZE);
      row.forEach((cell) => {
        expect(cell).toBe(StoneColor.Empty);
      });
    });

    // 檢查初始狀態
    expect(result.current.nextColor).toBe(StoneColor.Black);
    expect(result.current.hoverPosition).toBeNull();
  });

  it('should handle mouse move', () => {
    const { result } = renderHook(() => useMove(), { wrapper });

    act(() => {
      result.current.handleMouseMove({ x: 3, y: 3 });
    });

    expect(result.current.hoverPosition).toEqual({ x: 3, y: 3 });
  });

  it('should handle click and place stone', () => {
    const { result } = renderHook(() => useMove(), { wrapper });

    // 放置黑子
    act(() => {
      result.current.handleClick({ x: 3, y: 3 });
    });

    expect(result.current.boardState[3][3]).toBe(StoneColor.Black);
    expect(result.current.nextColor).toBe(StoneColor.White);

    // 放置白子
    act(() => {
      result.current.handleClick({ x: 4, y: 4 });
    });

    expect(result.current.boardState[4][4]).toBe(StoneColor.White);
    expect(result.current.nextColor).toBe(StoneColor.Black);
  });

  it('should not place stone on occupied position', () => {
    const { result } = renderHook(() => useMove(), { wrapper });

    // 放置黑子
    act(() => {
      result.current.handleClick({ x: 3, y: 3 });
    });

    // 嘗試在同一位置放置白子
    act(() => {
      result.current.handleClick({ x: 3, y: 3 });
    });

    expect(result.current.boardState[3][3]).toBe(StoneColor.Black);
    expect(result.current.nextColor).toBe(StoneColor.White);
  });

  it('should handle previous step', () => {
    const { result } = renderHook(() => useMove(), { wrapper });

    // 放置兩顆棋子
    act(() => {
      result.current.handleClick({ x: 3, y: 3 }); // 黑
      result.current.handleClick({ x: 4, y: 4 }); // 白
    });

    // 回到上一手
    act(() => {
      result.current.handlePreviousStep();
    });

    expect(result.current.boardState[4][4]).toBe(StoneColor.Empty);
    expect(result.current.boardState[3][3]).toBe(StoneColor.Black);
    expect(result.current.nextColor).toBe(StoneColor.White);
  });

  it('should handle next step', () => {
    const { result } = renderHook(() => useMove(), { wrapper });

    // 放置兩顆棋子
    act(() => {
      result.current.handleClick({ x: 3, y: 3 }); // 黑
    });
    act(() => {
      result.current.handleClick({ x: 4, y: 4 }); // 白
    });

    // 回到上一手
    act(() => {
      result.current.handlePreviousStep();
    });

    // 前進到下一手
    act(() => {
      result.current.handleNextStep();
    });

    expect(result.current.boardState[4][4]).toBe(StoneColor.White);
    expect(result.current.boardState[3][3]).toBe(StoneColor.Black);
    expect(result.current.nextColor).toBe(StoneColor.Black);
  });

  it('should handle clear board', () => {
    const { result } = renderHook(() => useMove(), { wrapper });

    // 放置兩顆棋子
    act(() => {
      result.current.handleClick({ x: 3, y: 3 });
    });

    act(() => {
      result.current.handleClick({ x: 4, y: 4 });
    });

    // 清空棋盤
    act(() => {
      result.current.handleClear();
    });

    // 檢查棋盤是否為空
    result.current.boardState.forEach((row) => {
      row.forEach((cell) => {
        expect(cell).toBe(StoneColor.Empty);
      });
    });
    expect(result.current.nextColor).toBe(StoneColor.Black);
  });

  it('should handle switch to specific node', () => {
    const { result } = renderHook(() => useMove(), { wrapper });

    // 放置兩顆棋子
    act(() => {
      result.current.handleClick({ x: 3, y: 3 }); // 黑
    });
    act(() => {
      result.current.handleClick({ x: 4, y: 4 }); // 白
    });

    // 保存第一手的節點
    const firstNode = result.current.moveTree.pointer.currentNode.parentNode!;

    // 切換到第一手
    act(() => {
      result.current.handleSwitchNode(firstNode);
    });

    expect(result.current.boardState[3][3]).toBe(StoneColor.Black);
    expect(result.current.boardState[4][4]).toBe(StoneColor.Empty);
    expect(result.current.nextColor).toBe(StoneColor.White);
  });

  it('should update board state after capturing one stone', () => {
    const { result } = renderHook(() => useMove(), { wrapper });

    act(() => {
      result.current.handleClick({ x: 1, y: 0 }); // black
    });
    act(() => {
      result.current.handleClick({ x: 0, y: 0 }); // white
    });

    // capture
    act(() => {
      result.current.handleClick({ x: 0, y: 1 }); // black
    });

    expect(result.current.boardState[0][1]).toBe(StoneColor.Black);
    expect(result.current.boardState[1][0]).toBe(StoneColor.Black);

    expect(result.current.boardState[0][0]).toBe(StoneColor.Empty);
  });

  it('should update board state after capturing multiple stones', () => {
    const { result } = renderHook(() => useMove(), { wrapper });

    // put two white stones
    act(() => {
      result.current.handleClick({ x: 1, y: 0 }); // black
    });
    act(() => {
      result.current.handleClick({ x: 1, y: 1 }); // white
    });
    act(() => {
      result.current.handleClick({ x: 2, y: 0 }); // black
    });
    act(() => {
      result.current.handleClick({ x: 2, y: 1 }); // white
    });

    // capture by surround the white stones
    act(() => {
      result.current.handleClick({ x: 0, y: 1 }); // black
    });
    act(() => {
      result.current.handleClick({ x: 10, y: 10 }); // white, somewhere else
    });
    act(() => {
      result.current.handleClick({ x: 3, y: 1 }); // black
    });
    act(() => {
      result.current.handleClick({ x: 10, y: 11 }); // white, somewhere else
    });
    act(() => {
      result.current.handleClick({ x: 1, y: 2 }); // black
    });
    act(() => {
      result.current.handleClick({ x: 10, y: 12 }); // white, somewhere else
    });
    act(() => {
      result.current.handleClick({ x: 2, y: 2 }); // black
    });

    // 檢查被吃掉的白子位置是否變為空
    expect(result.current.boardState[1][1]).toBe(StoneColor.Empty); // left white
    expect(result.current.boardState[1][2]).toBe(StoneColor.Empty); // right white

    // 檢查圍住的黑子是否都在正確位置
    expect(result.current.boardState[0][1]).toBe(StoneColor.Black);
    expect(result.current.boardState[0][2]).toBe(StoneColor.Black);
    expect(result.current.boardState[1][0]).toBe(StoneColor.Black);
    expect(result.current.boardState[1][3]).toBe(StoneColor.Black);
    expect(result.current.boardState[2][1]).toBe(StoneColor.Black);
    expect(result.current.boardState[2][2]).toBe(StoneColor.Black);
  });

  describe('Auto Save Draft', () => {
    it('should auto save draft after placing a stone', async () => {
      const { result } = renderHook(() => useMove(), { wrapper });

      expect(mockSaveDraftFn).not.toHaveBeenCalled();

      await act(async () => {
        result.current.handleClick({ x: 3, y: 3 });
        // Wait for the next event loop to let useEffect complete
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockSaveDraftFn).toHaveBeenCalled();
    });

    it('should use the same ID for subsequent auto saves', async () => {
      const { result } = renderHook(() => useMove(), { wrapper });

      await act(async () => {
        result.current.handleClick({ x: 3, y: 3 });
        // Wait for the next event loop to let useEffect complete
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      mockSaveDraftFn.mockClear();

      await act(async () => {
        result.current.handleClick({ x: 4, y: 4 });
        // Wait for the next event loop to let useEffect complete
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockSaveDraftFn).toHaveBeenCalled();

      expect(mockSaveDraftFn.mock.calls[0][2]).toBe('test-draft-id');
    });
  });
});
