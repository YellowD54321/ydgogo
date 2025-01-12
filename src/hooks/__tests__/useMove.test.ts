import { renderHook, act } from '@testing-library/react';
import { useMove } from '../useMove';
import { StoneColor } from '@/constants/gameConfig';

describe('useMove', () => {
  const BOARD_SIZE = 19;

  it('should initialize with empty board', () => {
    const { result } = renderHook(() => useMove(BOARD_SIZE));

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
    const { result } = renderHook(() => useMove(BOARD_SIZE));

    act(() => {
      result.current.handleMouseMove({ x: 3, y: 3 });
    });

    expect(result.current.hoverPosition).toEqual({ x: 3, y: 3 });
  });

  it('should handle click and place stone', () => {
    const { result } = renderHook(() => useMove(BOARD_SIZE));

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
    const { result } = renderHook(() => useMove(BOARD_SIZE));

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
    const { result } = renderHook(() => useMove(BOARD_SIZE));

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
    const { result } = renderHook(() => useMove(BOARD_SIZE));

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
    const { result } = renderHook(() => useMove(BOARD_SIZE));

    // 放置兩顆棋子
    act(() => {
      result.current.handleClick({ x: 3, y: 3 });
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
    const { result } = renderHook(() => useMove(BOARD_SIZE));

    // 放置兩顆棋子
    act(() => {
      result.current.handleClick({ x: 3, y: 3 }); // 黑
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
});
