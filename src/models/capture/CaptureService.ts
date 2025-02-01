import { Point, Stone } from '@/types/point';
import { StoneColor } from '@/constants/gameConfig';
import { Group, CaptureAnalysis } from '@/models/capture/types';

export class CaptureService {
  private readonly boardSize: number;

  constructor(boardSize: number) {
    this.boardSize = boardSize;
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

  public getCapturedGroups(stone: Stone, board: StoneColor[][]): Group[] {
    const analysis = this.analyzeCapture(stone, board);

    return analysis.capturedGroups;
  }

  private analyzeCapture(stone: Stone, board: StoneColor[][]): CaptureAnalysis {
    const targetColor =
      stone.color === StoneColor.Black ? StoneColor.White : StoneColor.Black;
    const movedBoard = board.map((row) => [...row]);

    // add movePoint stone
    movedBoard[stone.y][stone.x] = stone.color;

    const adjacentPoints = this.getAdjacentPoints(stone);
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

  private findEnemyGroups(
    points: Point[],
    targetColor: StoneColor,
    board: StoneColor[][]
  ): Group[] {
    const groups: Group[] = [];
    const processedPoints = new Set<string>();

    points.forEach((point) => {
      const key = `${point.x},${point.y}`;
      const isEnemy = board[point.y][point.x] === targetColor;
      if (!processedPoints.has(key) && isEnemy) {
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

  public isSuicideMove(stone: Stone, board: StoneColor[][]): boolean {
    // check if the move can capture opponent stones
    const analysis = this.analyzeCapture(stone, board);
    if (analysis.capturedGroups.length > 0) {
      return false;
    }

    const movedBoard = board.map((row) => [...row]);
    movedBoard[stone.y][stone.x] = stone.color;

    // check if the move has no liberties
    const group = this.findGroup(stone, stone.color, movedBoard);
    return group.liberties.length === 0;
  }
}
