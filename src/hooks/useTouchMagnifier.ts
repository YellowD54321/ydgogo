import { useState, useCallback } from 'react';
import { Point } from '@/types/point';

interface UseTouchMagnifierProps {
  boardSize: number;
  cellSize: number;
  padding: number;
  boardWidth: number;
  boardHeight: number;
  onPositionChange: (position: Point | null) => void;
  onConfirmPosition: (position: Point) => void;
  isValidPosition: (position: Point) => boolean;
}

interface TouchState {
  isTouching: boolean;
  touchPosition: Point | null;
  fingerPosition: { x: number; y: number } | null;
}

export const useTouchMagnifier = ({
  boardSize,
  cellSize,
  padding,
  boardWidth,
  boardHeight,
  onPositionChange,
  onConfirmPosition,
  isValidPosition,
}: UseTouchMagnifierProps) => {
  const [touchState, setTouchState] = useState<TouchState>({
    isTouching: false,
    touchPosition: null,
    fingerPosition: null,
  });

  // 觸控座標轉換函數
  const getTouchPosition = useCallback(
    (e: React.TouchEvent<SVGElement>): Point | null => {
      const touch = e.touches[0] || e.changedTouches[0];
      if (!touch) return null;

      const rect = e.currentTarget.getBoundingClientRect();

      // 計算SVG的縮放比例
      const scaleX = rect.width / boardWidth;
      const scaleY = rect.height / boardHeight;

      // 調整觸控座標以考慮縮放
      const adjustedX = (touch.clientX - rect.left) / scaleX;
      const adjustedY = (touch.clientY - rect.top) / scaleY;

      const x = Math.round((adjustedX - padding) / cellSize);
      const y = Math.round((adjustedY - padding) / cellSize);

      // 檢查是否在棋盤範圍內
      if (x >= 0 && x < boardSize && y >= 0 && y < boardSize) {
        return { x, y };
      }

      return null;
    },
    [boardSize, cellSize, padding, boardWidth, boardHeight]
  );

  // 處理觸控開始
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<SVGElement>) => {
      e.preventDefault();

      const position = getTouchPosition(e);
      const touch = e.touches[0];

      if (position && touch) {
        setTouchState({
          isTouching: true,
          touchPosition: position,
          fingerPosition: { x: touch.clientX, y: touch.clientY },
        });

        // 更新位置以顯示預覽
        onPositionChange(position);

        console.log('Touch Start:', position);
      }
    },
    [getTouchPosition, onPositionChange]
  );

  // 處理觸控移動
  const handleTouchMove = useCallback(
    (e: React.TouchEvent<SVGElement>) => {
      if (!touchState.isTouching) return;

      const position = getTouchPosition(e);
      const touch = e.touches[0];

      // 更新觸控位置和手指位置
      setTouchState((prev) => ({
        ...prev,
        touchPosition: position,
        fingerPosition: touch
          ? { x: touch.clientX, y: touch.clientY }
          : prev.fingerPosition,
      }));

      // 更新預覽位置
      onPositionChange(position);

      if (position) {
        console.log('Touch Move:', position);
      }
    },
    [touchState.isTouching, getTouchPosition, onPositionChange]
  );

  // 處理觸控結束
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<SVGElement>) => {
      e.preventDefault();

      if (touchState.isTouching && touchState.touchPosition) {
        const position = getTouchPosition(e);

        // 檢查位置是否合法
        if (position && isValidPosition(position)) {
          onConfirmPosition(position);
          console.log('Touch End - Placing stone at:', position);
        }
      }

      // 重置觸控狀態
      setTouchState({
        isTouching: false,
        touchPosition: null,
        fingerPosition: null,
      });

      // 清除預覽
      onPositionChange(null);
    },
    [
      touchState,
      isValidPosition,
      onConfirmPosition,
      onPositionChange,
      getTouchPosition,
    ]
  );

  return {
    touchState,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};
