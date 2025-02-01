import { CaptureService } from '@/models/capture/CaptureService';
import { StoneColor } from '@/constants/gameConfig';
import { Point, Stone } from '@/types/point';

// Subclass for testing
class TestCaptureService extends CaptureService {
  public testGetAdjacentPoints(point: Point): Point[] {
    return this.getAdjacentPoints(point);
  }
}

describe('CaptureService', () => {
  let boardSize: number;
  let board: StoneColor[][];
  let captureService: CaptureService;
  let testService: TestCaptureService;

  beforeEach(() => {
    boardSize = 19;
    board = Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill(StoneColor.Empty));
    captureService = new CaptureService(boardSize);
    testService = new TestCaptureService(boardSize);
  });

  describe('getAdjacentPoints', () => {
    it('should return all adjacent points for center point', () => {
      const point: Point = { x: 5, y: 5 };
      const result = testService.testGetAdjacentPoints(point);

      expect(result).toHaveLength(4);
      expect(result).toContainEqual({ x: 5, y: 4 }); // top
      expect(result).toContainEqual({ x: 5, y: 6 }); // bottom
      expect(result).toContainEqual({ x: 4, y: 5 }); // left
      expect(result).toContainEqual({ x: 6, y: 5 }); // right
    });

    it('should handle corner points correctly', () => {
      const topLeft: Point = { x: 0, y: 0 };
      const result = testService.testGetAdjacentPoints(topLeft);

      expect(result).toHaveLength(2);
      expect(result).toContainEqual({ x: 0, y: 1 }); // bottom
      expect(result).toContainEqual({ x: 1, y: 0 }); // right
    });

    it('should handle edge points correctly', () => {
      const topEdge: Point = { x: 5, y: 0 };
      const result = testService.testGetAdjacentPoints(topEdge);

      expect(result).toHaveLength(3);
      expect(result).toContainEqual({ x: 5, y: 1 }); // bottom
      expect(result).toContainEqual({ x: 4, y: 0 }); // left
      expect(result).toContainEqual({ x: 6, y: 0 }); // right
    });
  });

  describe('getCapturedGroups', () => {
    it('should capture a single stone with no liberties', () => {
      // Setup board state
      board[1][1] = StoneColor.White;
      board[0][1] = StoneColor.Black;
      board[1][0] = StoneColor.Black;
      board[1][2] = StoneColor.Black;

      const moveStone = { x: 1, y: 2, color: StoneColor.Black };
      const result = captureService.getCapturedGroups(moveStone, board);

      expect(result).toHaveLength(1);
      expect(result[0].stones).toEqual([{ x: 1, y: 1 }]);
    });

    it('should capture multiple connected stones', () => {
      // Setup board state: two connected white stones
      board[1][1] = StoneColor.White;
      board[1][2] = StoneColor.White;
      board[0][1] = StoneColor.Black;
      board[0][2] = StoneColor.Black;
      board[1][0] = StoneColor.Black;
      board[1][3] = StoneColor.Black;
      board[2][1] = StoneColor.Black;
      board[2][2] = StoneColor.Black;

      const moveStone: Stone = { x: 2, y: 2, color: StoneColor.Black };
      const result = captureService.getCapturedGroups(moveStone, board);

      expect(result).toHaveLength(1);
      expect(result[0].stones).toContainEqual({ x: 1, y: 1 });
      expect(result[0].stones).toContainEqual({ x: 2, y: 1 });
    });

    it('should not capture stones with liberties', () => {
      // Setup board state: a white stone with liberties
      board[1][1] = StoneColor.White;
      board[0][1] = StoneColor.Black;
      board[1][0] = StoneColor.Black;

      const moveStone: Stone = { x: 2, y: 1, color: StoneColor.Black };
      const result = captureService.getCapturedGroups(moveStone, board);

      expect(result).toHaveLength(0);
    });

    it('should capture stones on the board edge', () => {
      board[0][0] = StoneColor.White;
      board[1][0] = StoneColor.Black;

      const moveStone: Stone = { x: 1, y: 0, color: StoneColor.Black };
      const result = captureService.getCapturedGroups(moveStone, board);

      expect(result).toHaveLength(1);
      expect(result[0].stones).toEqual([{ x: 0, y: 0 }]);
    });

    it('should capture multiple separate groups simultaneously', () => {
      board[1][1] = StoneColor.White;
      board[3][1] = StoneColor.White;

      board[0][1] = StoneColor.Black;
      board[1][0] = StoneColor.Black;
      board[1][2] = StoneColor.Black;
      board[3][0] = StoneColor.Black;
      board[3][2] = StoneColor.Black;
      board[4][1] = StoneColor.Black;

      const moveStone: Stone = { x: 1, y: 2, color: StoneColor.Black };
      const result = captureService.getCapturedGroups(moveStone, board);

      expect(result).toHaveLength(2);
      expect(result[0].stones).toContainEqual({ x: 1, y: 1 });
      expect(result[1].stones).toContainEqual({ x: 1, y: 3 });
    });

    it('should correctly handle one group with multiple stones', () => {
      board[1][1] = StoneColor.White;
      board[1][2] = StoneColor.White;
      board[2][2] = StoneColor.White;
      board[2][1] = StoneColor.White;

      board[0][1] = StoneColor.Black;
      board[1][0] = StoneColor.Black;
      board[1][3] = StoneColor.Black;
      board[2][3] = StoneColor.Black;
      board[3][2] = StoneColor.Black;
      board[3][1] = StoneColor.Black;
      board[2][0] = StoneColor.Black;

      const moveStone: Stone = { x: 2, y: 0, color: StoneColor.Black };
      const result = captureService.getCapturedGroups(moveStone, board);

      expect(result).toHaveLength(1);
      expect(result[0].stones).toHaveLength(4);
      expect(result[0].stones).toContainEqual({ x: 1, y: 1 });
      expect(result[0].stones).toContainEqual({ x: 2, y: 1 });
      expect(result[0].stones).toContainEqual({ x: 2, y: 2 });
      expect(result[0].stones).toContainEqual({ x: 1, y: 2 });
    });

    it('should handle invalid coordinates gracefully', () => {
      const invalidStone: Stone = { x: -1, y: 0, color: StoneColor.Black };
      const result = captureService.getCapturedGroups(invalidStone, board);

      expect(result).toHaveLength(0);
    });

    it('should handle board corners correctly', () => {
      // Top-left corner
      board[0][0] = StoneColor.White;
      board[1][0] = StoneColor.Black;

      // Top-right corner
      board[0][boardSize - 1] = StoneColor.White;
      board[1][boardSize - 1] = StoneColor.Black;

      const moveStone1: Stone = { x: 1, y: 0, color: StoneColor.Black };
      const result1 = captureService.getCapturedGroups(moveStone1, board);

      expect(result1).toHaveLength(1);
      expect(result1[0].stones).toEqual([{ x: 0, y: 0 }]);

      const moveStone2: Stone = {
        x: boardSize - 2,
        y: 0,
        color: StoneColor.Black,
      };
      const result2 = captureService.getCapturedGroups(moveStone2, board);

      expect(result2).toHaveLength(1);
      expect(result2[0].stones).toEqual([{ x: boardSize - 1, y: 0 }]);
    });
  });

  describe('isValidPoint', () => {
    it('should return false when x or y is null or undefined', () => {
      const point = { x: null, y: 5, color: StoneColor.Black };
      expect(captureService.isValidPoint(point, board)).toBe(false);

      const point2 = { x: 5, y: null, color: StoneColor.Black };
      expect(captureService.isValidPoint(point2, board)).toBe(false);

      const point3 = { x: undefined, y: 5, color: StoneColor.Black };
      expect(captureService.isValidPoint(point3, board)).toBe(false);

      const point4 = { x: 5, y: undefined, color: StoneColor.Black };
      expect(captureService.isValidPoint(point4, board)).toBe(false);
    });

    it('should return true for valid point', () => {
      const point = { x: 5, y: 5, color: StoneColor.Black };
      expect(captureService.isValidPoint(point, board)).toBe(true);
    });

    it('should return false for invalid point', () => {
      const point = { x: -1, y: 5, color: StoneColor.Black };
      expect(captureService.isValidPoint(point, board)).toBe(false);
    });

    it('should return false when there is a stone in the point', () => {
      board[5][5] = StoneColor.Black;
      const point = { x: 5, y: 5, color: StoneColor.Black };
      expect(captureService.isValidPoint(point, board)).toBe(false);
    });
  });

  describe('isSuicideMove', () => {
    it('should identify legal move with liberties', () => {
      const moveStone: Stone = { x: 1, y: 1, color: StoneColor.Black };
      expect(captureService.isSuicideMove(moveStone, board)).toBe(false);
    });

    it('should identify simple suicide move when surrounded by opponent stones', () => {
      board[0][1] = StoneColor.Black;
      board[1][0] = StoneColor.Black;
      board[1][2] = StoneColor.Black;
      board[2][1] = StoneColor.Black;

      const moveStone: Stone = { x: 1, y: 1, color: StoneColor.White };
      expect(captureService.isSuicideMove(moveStone, board)).toBe(true);
    });

    it('should identify suicide move in corner', () => {
      board[0][1] = StoneColor.Black;
      board[1][0] = StoneColor.Black;

      const moveStone: Stone = { x: 0, y: 0, color: StoneColor.White };
      expect(captureService.isSuicideMove(moveStone, board)).toBe(true);
    });

    it('should identify suicide move on edge', () => {
      board[0][0] = StoneColor.Black;
      board[1][1] = StoneColor.Black;
      board[2][0] = StoneColor.Black;

      const moveStone: Stone = { x: 0, y: 1, color: StoneColor.White };
      expect(captureService.isSuicideMove(moveStone, board)).toBe(true);
    });

    it('should identify suicide move when connecting with friendly stones', () => {
      board[1][1] = StoneColor.White;
      board[0][1] = StoneColor.Black;
      board[0][2] = StoneColor.Black;
      board[1][0] = StoneColor.Black;
      board[1][3] = StoneColor.Black;
      board[2][1] = StoneColor.Black;
      board[2][2] = StoneColor.Black;

      const moveStone: Stone = { x: 2, y: 1, color: StoneColor.White };
      expect(captureService.isSuicideMove(moveStone, board)).toBe(true);
    });

    it('should identify legal move that captures opponent stones', () => {
      board[0][0] = StoneColor.Black;
      board[0][2] = StoneColor.Black;
      board[1][1] = StoneColor.Black;

      board[1][0] = StoneColor.White;

      const moveStone: Stone = { x: 1, y: 0, color: StoneColor.White };
      expect(captureService.isSuicideMove(moveStone, board)).toBe(false);
    });
  });
});
