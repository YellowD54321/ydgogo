import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GoBoard from '@/components/GoBoard';
import {
  BOARD_CONFIG,
  BOARD_DIMENSIONS,
  StoneColor,
} from '@/constants/gameConfig';
import { useMove } from '@/hooks/move';
import type { Position, Move } from '@/hooks/move';

const mockUseMove = useMove as jest.MockedFunction<typeof useMove>;

// 常用測試數據
const EMPTY_BOARD = Array(BOARD_CONFIG.SIZE)
  .fill(null)
  .map(() => Array(BOARD_CONFIG.SIZE).fill(StoneColor.Empty));

jest.mock('../../hooks/move', () => ({
  useMove: jest.fn(() => ({
    boardState: EMPTY_BOARD,
    hoverPosition: null,
    handleMouseMove: jest.fn(),
    handleClick: jest.fn(),
    nextColor: StoneColor.Black,
    moves: [],
  })),
}));

describe('GoBoard', () => {
  let container: HTMLElement;
  let board: Element | null;
  const defaultMockHandleMouseMove = jest.fn();
  const defaultMockHandleClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMove.mockImplementation(() => ({
      boardState: EMPTY_BOARD,
      hoverPosition: null,
      handleMouseMove: defaultMockHandleMouseMove,
      handleClick: defaultMockHandleClick,
      nextColor: StoneColor.Black,
      moves: [],
    }));
    ({ container } = render(<GoBoard />));
    board = container.querySelector('svg');
  });

  describe('Board Rendering', () => {
    test('renders board with correct dimensions', () => {
      expect(board).toBeInTheDocument();
      expect(board).toHaveAttribute('width', String(BOARD_DIMENSIONS.WIDTH));
      expect(board).toHaveAttribute('height', String(BOARD_DIMENSIONS.HEIGHT));
    });

    test('renders correct number of grid lines', () => {
      const verticalLines = container.querySelectorAll(
        `line[y1="${BOARD_CONFIG.PADDING}"][y2="${
          BOARD_CONFIG.PADDING +
          (BOARD_CONFIG.SIZE - 1) * BOARD_CONFIG.CELL_SIZE
        }"]`
      );
      const horizontalLines = container.querySelectorAll(
        `line[x1="${BOARD_CONFIG.PADDING}"][x2="${
          BOARD_CONFIG.PADDING +
          (BOARD_CONFIG.SIZE - 1) * BOARD_CONFIG.CELL_SIZE
        }"]`
      );
      expect(verticalLines).toHaveLength(BOARD_CONFIG.SIZE);
      expect(horizontalLines).toHaveLength(BOARD_CONFIG.SIZE);
    });

    test('renders grid lines at correct positions', () => {
      const lines = container.querySelectorAll('line');
      const firstVerticalLine = Array.from(lines).find(
        (line) =>
          line.getAttribute('x1') === String(BOARD_CONFIG.PADDING) &&
          line.getAttribute('x2') === String(BOARD_CONFIG.PADDING)
      );
      const lastVerticalLine = Array.from(lines).find(
        (line) =>
          line.getAttribute('x1') ===
            String(
              BOARD_CONFIG.PADDING +
                (BOARD_CONFIG.SIZE - 1) * BOARD_CONFIG.CELL_SIZE
            ) &&
          line.getAttribute('x2') ===
            String(
              BOARD_CONFIG.PADDING +
                (BOARD_CONFIG.SIZE - 1) * BOARD_CONFIG.CELL_SIZE
            )
      );
      expect(firstVerticalLine).toBeTruthy();
      expect(lastVerticalLine).toBeTruthy();
    });
  });

  describe('Star Points', () => {
    const STAR_POINTS = {
      TENGEN: {
        cx: String(BOARD_CONFIG.PADDING + 9 * BOARD_CONFIG.CELL_SIZE),
        cy: String(BOARD_CONFIG.PADDING + 9 * BOARD_CONFIG.CELL_SIZE),
      },
      OTHERS: [
        {
          cx: String(BOARD_CONFIG.PADDING + 3 * BOARD_CONFIG.CELL_SIZE),
          cy: String(BOARD_CONFIG.PADDING + 3 * BOARD_CONFIG.CELL_SIZE),
        }, // 左上
        {
          cx: String(BOARD_CONFIG.PADDING + 9 * BOARD_CONFIG.CELL_SIZE),
          cy: String(BOARD_CONFIG.PADDING + 3 * BOARD_CONFIG.CELL_SIZE),
        }, // 上中
        {
          cx: String(BOARD_CONFIG.PADDING + 15 * BOARD_CONFIG.CELL_SIZE),
          cy: String(BOARD_CONFIG.PADDING + 3 * BOARD_CONFIG.CELL_SIZE),
        }, // 右上
        {
          cx: String(BOARD_CONFIG.PADDING + 3 * BOARD_CONFIG.CELL_SIZE),
          cy: String(BOARD_CONFIG.PADDING + 9 * BOARD_CONFIG.CELL_SIZE),
        }, // 左中
        {
          cx: String(BOARD_CONFIG.PADDING + 15 * BOARD_CONFIG.CELL_SIZE),
          cy: String(BOARD_CONFIG.PADDING + 9 * BOARD_CONFIG.CELL_SIZE),
        }, // 右中
        {
          cx: String(BOARD_CONFIG.PADDING + 3 * BOARD_CONFIG.CELL_SIZE),
          cy: String(BOARD_CONFIG.PADDING + 15 * BOARD_CONFIG.CELL_SIZE),
        }, // 左下
        {
          cx: String(BOARD_CONFIG.PADDING + 9 * BOARD_CONFIG.CELL_SIZE),
          cy: String(BOARD_CONFIG.PADDING + 15 * BOARD_CONFIG.CELL_SIZE),
        }, // 下中
        {
          cx: String(BOARD_CONFIG.PADDING + 15 * BOARD_CONFIG.CELL_SIZE),
          cy: String(BOARD_CONFIG.PADDING + 15 * BOARD_CONFIG.CELL_SIZE),
        }, // 右下
      ],
    };

    test('renders correct number of star points', () => {
      const starPoints = container.querySelectorAll('circle[r="3"]');
      expect(starPoints).toHaveLength(9);
    });

    test('renders tengen at correct position', () => {
      const starPoints = container.querySelectorAll('circle[r="3"]');
      const tengen = Array.from(starPoints).find(
        (point) =>
          point.getAttribute('cx') === STAR_POINTS.TENGEN.cx &&
          point.getAttribute('cy') === STAR_POINTS.TENGEN.cy
      );
      expect(tengen).toBeTruthy();
    });

    test('renders other star points at correct positions', () => {
      const starPoints = container.querySelectorAll('circle[r="3"]');
      STAR_POINTS.OTHERS.forEach((pos) => {
        const point = Array.from(starPoints).find(
          (p) =>
            p.getAttribute('cx') === pos.cx && p.getAttribute('cy') === pos.cy
        );
        expect(point).toBeTruthy();
      });
    });
  });

  describe('Stone Rendering', () => {
    const TEST_STONES = {
      BLACK: { x: 3, y: 3 },
      WHITE: { x: 15, y: 15 },
    };

    let mockBoardState: StoneColor[][];

    beforeEach(() => {
      mockBoardState = Array(BOARD_CONFIG.SIZE)
        .fill(null)
        .map(() => Array(BOARD_CONFIG.SIZE).fill(StoneColor.Empty));
      mockBoardState[TEST_STONES.BLACK.y][TEST_STONES.BLACK.x] =
        StoneColor.Black;
      mockBoardState[TEST_STONES.WHITE.y][TEST_STONES.WHITE.x] =
        StoneColor.White;

      mockUseMove.mockImplementation(() => ({
        boardState: mockBoardState,
        hoverPosition: null,
        handleMouseMove: defaultMockHandleMouseMove,
        handleClick: defaultMockHandleClick,
        nextColor: StoneColor.Black,
        moves: [],
      }));
      ({ container } = render(<GoBoard />));
    });

    test('renders stones with correct colors', () => {
      const stones = container.querySelectorAll('circle');
      const gameStones = Array.from(stones).filter(
        (stone) =>
          stone.getAttribute('r') === String(BOARD_CONFIG.CELL_SIZE / 2 - 1)
      );
      expect(gameStones).toHaveLength(2);

      const blackStone = gameStones.find(
        (stone) =>
          stone.getAttribute('fill') === 'black' &&
          stone.getAttribute('stroke') === 'none'
      );
      const whiteStone = gameStones.find(
        (stone) =>
          stone.getAttribute('fill') === 'white' &&
          stone.getAttribute('stroke') === 'black'
      );
      expect(blackStone).toBeTruthy();
      expect(whiteStone).toBeTruthy();
    });

    test('renders stones at correct positions', () => {
      const stones = container.querySelectorAll('circle');
      const gameStones = Array.from(stones).filter(
        (stone) =>
          stone.getAttribute('r') === String(BOARD_CONFIG.CELL_SIZE / 2 - 1)
      );

      const blackStone = gameStones.find(
        (stone) =>
          stone.getAttribute('cx') ===
            String(
              BOARD_CONFIG.PADDING +
                TEST_STONES.BLACK.x * BOARD_CONFIG.CELL_SIZE
            ) &&
          stone.getAttribute('cy') ===
            String(
              BOARD_CONFIG.PADDING +
                TEST_STONES.BLACK.y * BOARD_CONFIG.CELL_SIZE
            )
      );
      const whiteStone = gameStones.find(
        (stone) =>
          stone.getAttribute('cx') ===
            String(
              BOARD_CONFIG.PADDING +
                TEST_STONES.WHITE.x * BOARD_CONFIG.CELL_SIZE
            ) &&
          stone.getAttribute('cy') ===
            String(
              BOARD_CONFIG.PADDING +
                TEST_STONES.WHITE.y * BOARD_CONFIG.CELL_SIZE
            )
      );
      expect(blackStone).toBeTruthy();
      expect(whiteStone).toBeTruthy();
    });
  });

  describe('Preview Stone', () => {
    const PREVIEW_POSITION = { x: 5, y: 5 };

    beforeEach(() => {
      mockUseMove.mockImplementation(() => ({
        boardState: EMPTY_BOARD,
        hoverPosition: PREVIEW_POSITION,
        handleMouseMove: defaultMockHandleMouseMove,
        handleClick: defaultMockHandleClick,
        nextColor: StoneColor.Black,
        moves: [],
      }));
      ({ container } = render(<GoBoard />));
    });

    test('shows preview stone on hover', () => {
      const previewStone = container.querySelector('circle[opacity="0.5"]');
      expect(previewStone).toBeInTheDocument();
    });

    test('shows preview stone at correct position', () => {
      const previewStone = container.querySelector('circle[opacity="0.5"]');
      expect(previewStone).toHaveAttribute(
        'cx',
        String(
          BOARD_CONFIG.PADDING + PREVIEW_POSITION.x * BOARD_CONFIG.CELL_SIZE
        )
      );
      expect(previewStone).toHaveAttribute(
        'cy',
        String(
          BOARD_CONFIG.PADDING + PREVIEW_POSITION.y * BOARD_CONFIG.CELL_SIZE
        )
      );
    });

    test('shows preview stone with correct color', () => {
      mockUseMove.mockImplementation(() => ({
        boardState: EMPTY_BOARD,
        hoverPosition: PREVIEW_POSITION,
        handleMouseMove: defaultMockHandleMouseMove,
        handleClick: defaultMockHandleClick,
        nextColor: StoneColor.White,
        moves: [],
      }));
      ({ container } = render(<GoBoard />));

      const previewStone = container.querySelector('circle[opacity="0.5"]');
      expect(previewStone).toHaveAttribute('fill', 'white');
    });

    test('shows white preview stone with black border', () => {
      mockUseMove.mockImplementation(() => ({
        boardState: EMPTY_BOARD,
        hoverPosition: PREVIEW_POSITION,
        handleMouseMove: defaultMockHandleMouseMove,
        handleClick: defaultMockHandleClick,
        nextColor: StoneColor.White,
        moves: [],
      }));
      ({ container } = render(<GoBoard />));

      const previewStone = container.querySelector('circle[opacity="0.5"]');
      expect(previewStone).toHaveAttribute('stroke', 'black');
    });
  });

  describe('Mouse Events', () => {
    const createMouseEvent = (
      x: number,
      y: number
    ): React.MouseEvent<SVGElement> =>
      ({
        clientX: x,
        clientY: y,
        currentTarget: {
          getBoundingClientRect: () => ({
            left: BOARD_CONFIG.PADDING,
            top: BOARD_CONFIG.PADDING,
          }),
        },
      } as React.MouseEvent<SVGElement>);

    test('handles mouse move in valid range', () => {
      fireEvent.mouseMove(board!, createMouseEvent(100, 100));
      expect(defaultMockHandleMouseMove).toHaveBeenCalledWith({ x: 2, y: 2 });
    });

    test('handles mouse leave', () => {
      fireEvent.mouseLeave(board!);
      expect(defaultMockHandleMouseMove).toHaveBeenCalledWith(null);
    });

    test('handles mouse move outside board', () => {
      fireEvent.mouseMove(board!, createMouseEvent(700, 700));
      expect(defaultMockHandleMouseMove).toHaveBeenCalledWith(null);
    });
  });

  describe('Click Events', () => {
    test('handles click on empty intersection', () => {
      mockUseMove.mockImplementation(() => ({
        boardState: EMPTY_BOARD.map((row) => [...row]),
        hoverPosition: { x: 5, y: 5 },
        handleMouseMove: defaultMockHandleMouseMove,
        handleClick: defaultMockHandleClick,
        nextColor: StoneColor.Black,
        moves: [],
      }));
      ({ container } = render(<GoBoard />));
      board = container.querySelector('svg');

      fireEvent.click(board!);
      expect(defaultMockHandleClick).toHaveBeenCalledWith({ x: 5, y: 5 });
    });

    test('handles click on occupied position', () => {
      const mockBoardState = Array(BOARD_CONFIG.SIZE)
        .fill(null)
        .map(() => Array(BOARD_CONFIG.SIZE).fill(StoneColor.Empty));
      mockBoardState[5][5] = StoneColor.Black;
      const mockHandleClick = jest.fn();

      mockUseMove.mockImplementation(() => ({
        boardState: mockBoardState,
        hoverPosition: { x: 5, y: 5 },
        handleMouseMove: defaultMockHandleMouseMove,
        handleClick: mockHandleClick,
        nextColor: StoneColor.White,
        moves: [],
      }));

      ({ container } = render(<GoBoard />));
      board = container.querySelector('svg');

      fireEvent.click(board!);
      expect(mockHandleClick).not.toHaveBeenCalled();
    });

    test('handles click outside board', () => {
      const mockHandleClick = jest.fn();
      mockUseMove.mockImplementation(() => ({
        boardState: EMPTY_BOARD,
        hoverPosition: null,
        handleMouseMove: defaultMockHandleMouseMove,
        handleClick: mockHandleClick,
        nextColor: StoneColor.Black,
        moves: [],
      }));

      ({ container } = render(<GoBoard />));
      board = container.querySelector('svg');

      fireEvent.click(board!);
      expect(mockHandleClick).not.toHaveBeenCalled();
    });
  });

  describe('Board State', () => {
    test('updates board state after placing stone', () => {
      const currentState = EMPTY_BOARD.map((row) => [...row]);
      const mockHandleClick = jest.fn().mockImplementation((pos: Position) => {
        currentState[pos.y][pos.x] = StoneColor.Black;
      });

      mockUseMove.mockImplementation(() => ({
        boardState: currentState,
        hoverPosition: { x: 5, y: 5 },
        handleMouseMove: defaultMockHandleMouseMove,
        handleClick: mockHandleClick,
        nextColor: StoneColor.Black,
        moves: [],
      }));
      ({ container } = render(<GoBoard />));
      board = container.querySelector('svg');

      fireEvent.click(board!);

      mockUseMove.mockImplementation(() => ({
        boardState: currentState,
        hoverPosition: { x: 5, y: 5 },
        handleMouseMove: defaultMockHandleMouseMove,
        handleClick: mockHandleClick,
        nextColor: StoneColor.White,
        moves: [],
      }));
      render(<GoBoard />);

      const stones = container.querySelectorAll(
        `circle[r="${BOARD_CONFIG.CELL_SIZE / 2 - 1}"]`
      );
      expect(stones).toHaveLength(1);
      expect(stones[0]).toHaveAttribute('fill', 'black');
    });

    test('alternates between black and white stones', () => {
      let nextColor = StoneColor.Black;
      const mockHandleClick = jest.fn().mockImplementation(() => {
        nextColor =
          nextColor === StoneColor.Black ? StoneColor.White : StoneColor.Black;
      });

      mockUseMove.mockImplementation(() => ({
        boardState: EMPTY_BOARD,
        hoverPosition: { x: 5, y: 5 },
        handleMouseMove: defaultMockHandleMouseMove,
        handleClick: mockHandleClick,
        nextColor,
        moves: [],
      }));
      ({ container } = render(<GoBoard />));
      board = container.querySelector('svg');

      fireEvent.click(board!);
      expect(nextColor).toBe(StoneColor.White);

      mockUseMove.mockImplementation(() => ({
        boardState: EMPTY_BOARD,
        hoverPosition: { x: 5, y: 5 },
        handleMouseMove: defaultMockHandleMouseMove,
        handleClick: mockHandleClick,
        nextColor,
        moves: [],
      }));
      render(<GoBoard />);

      fireEvent.click(board!);
      expect(nextColor).toBe(StoneColor.Black);
    });

    test('records move history correctly', () => {
      const mockMoves: Move[] = [];
      const mockHandleClick = jest.fn().mockImplementation((pos: Position) => {
        mockMoves.push({
          x: pos.x,
          y: pos.y,
          color: StoneColor.Black,
          timestamp: Date.now(),
        });
      });

      mockUseMove.mockImplementation(() => ({
        boardState: EMPTY_BOARD,
        hoverPosition: { x: 5, y: 5 },
        handleMouseMove: defaultMockHandleMouseMove,
        handleClick: mockHandleClick,
        nextColor: StoneColor.Black,
        moves: mockMoves,
      }));
      ({ container } = render(<GoBoard />));
      board = container.querySelector('svg');

      fireEvent.click(board!);

      expect(mockMoves).toHaveLength(1);
      expect(mockMoves[0]).toMatchObject({
        x: 5,
        y: 5,
        color: StoneColor.Black,
      });
      expect(mockMoves[0].timestamp).toBeDefined();
    });
  });
});
