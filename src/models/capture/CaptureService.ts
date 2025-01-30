import { Point } from '@/types/point';
import { StoneColor } from '@/constants/gameConfig';
import { Group, CaptureAnalysis } from '@/models/capture/types';

export class CaptureService {
  private readonly boardSize: number;

  constructor(boardSize: number) {
    this.boardSize = boardSize;
  }

  public getCapturedGroups(
    movePoint: Point,
    color: StoneColor,
    board: StoneColor[][]
  ): Group[] {
    const oppositeColor =
      color === StoneColor.Black ? StoneColor.White : StoneColor.Black;
    const analysis = this.analyzeCapture(movePoint, oppositeColor, board);

    return analysis.capturedGroups;
  }

  private analyzeCapture(
    movePoint: Point,
    targetColor: StoneColor,
    board: StoneColor[][]
  ): CaptureAnalysis {
    const movedBoard = board.map((row) => [...row]);
    // add movePoint stone
    movedBoard[movePoint.y][movePoint.x] =
      targetColor === StoneColor.Black ? StoneColor.White : StoneColor.Black;

    const adjacentPoints = this.getAdjacentPoints(movePoint);
    const enemyGroups = this.findEnemyGroups(
      adjacentPoints,
      targetColor,
      movedBoard
    );
    const capturedGroups = enemyGroups.filter(
      (group) => group.liberties.length === 0
    );

    return {
      groups: enemyGroups,
      capturedGroups,
    };
  }

  protected getAdjacentPoints(point: Point): Point[] {
    const { x, y } = point;
    const adjacentPoints: Point[] = [];

    if (y > 0) adjacentPoints.push({ x, y: y - 1 });
    if (y < this.boardSize - 1) adjacentPoints.push({ x, y: y + 1 });
    if (x > 0) adjacentPoints.push({ x: x - 1, y });
    if (x < this.boardSize - 1) adjacentPoints.push({ x: x + 1, y });

    return adjacentPoints;
  }

  private findEnemyGroups(
    points: Point[],
    targetColor: StoneColor,
    board: StoneColor[][]
  ): Group[] {
    const groups: Group[] = [];
    const processedPoints = new Set<string>();

    points.forEach((point) => {
      const key = `${point.x},${point.y}`;
      if (
        !processedPoints.has(key) &&
        board[point.y][point.x] === targetColor
      ) {
        const group = this.findGroup(point, targetColor, board);

        // mark all stones in this group as processed
        group.stones.forEach((stone) => {
          processedPoints.add(`${stone.x},${stone.y}`);
        });

        groups.push(group);
      }
    });

    return groups;
  }

  private findGroup(
    startPoint: Point,
    color: StoneColor,
    board: StoneColor[][]
  ): Group {
    const stones: Point[] = [];
    const liberties = new Set<string>();
    const queue: Point[] = [startPoint];
    const visitedPoints = new Set<string>();

    while (queue.length > 0) {
      const point = queue.shift();
      if (!point) continue;

      const key = `${point.x},${point.y}`;
      if (visitedPoints.has(key)) continue;

      visitedPoints.add(key);

      if (board[point.y][point.x] === color) {
        stones.push(point);

        const adjacentPoints = this.getAdjacentPoints(point);
        adjacentPoints.forEach((adjPoint) => {
          const adjKey = `${adjPoint.x},${adjPoint.y}`;
          const adjColor = board[adjPoint.y][adjPoint.x];

          if (adjColor === StoneColor.Empty) {
            liberties.add(adjKey);
          } else if (adjColor === color && !visitedPoints.has(adjKey)) {
            queue.push(adjPoint);
          }
        });
      }
    }

    return {
      stones,
      liberties: Array.from(liberties).map((key) => {
        const [x, y] = key.split(',').map(Number);
        return { x, y };
      }),
      color,
    };
  }
}
