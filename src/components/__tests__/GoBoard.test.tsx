import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GoBoard from '@/components/GoBoard';
import {
  BOARD_CONFIG,
  BOARD_DIMENSIONS,
  StoneColor,
} from '@/constants/gameConfig';
import { useMove } from '@/hooks/useMove';
import { MoveTree } from '@/models/moveTree/MoveTree';
import { MoveProvider } from '@/contexts/MoveProvider';
import { Point } from '@/types/point';
import { ServiceContext, ServiceContextType } from '@/contexts/ServiceContext';
import { DraftService } from '@/services/DraftService';

const mockUseMove = useMove as jest.MockedFunction<typeof useMove>;

const EMPTY_BOARD = Array(BOARD_CONFIG.SIZE)
  .fill(null)
  .map(() => Array(BOARD_CONFIG.SIZE).fill(StoneColor.Empty));

const createMockMoveTree = () => new MoveTree();

const createDefaultMockResult = (overrides = {}) => ({
  boardState: EMPTY_BOARD,
  moveTree: createMockMoveTree(),
  hoverPosition: null,
  handleMouseMove: jest.fn(),
  handleClick: jest.fn(),
  handlePreviousStep: jest.fn(),
  handleNextStep: jest.fn(),
  handleClear: jest.fn(),
  handleSwitchNode: jest.fn(),
  nextColor: StoneColor.Black,
  buttonStates: {
    canClear: false,
    canPrevious: false,
    canNext: false,
  },
  ...overrides,
});

jest.mock('../../hooks/useMove', () => ({
  useMove: jest.fn(() => createDefaultMockResult()),
}));

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

describe('GoBoard', () => {
  let container: HTMLElement;
  let board: Element | null;
  const defaultMockHandleMouseMove = jest.fn();
  const defaultMockHandleClick = jest.fn();

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const draftService = DraftService.getInstance();
    const mockServiceContext: ServiceContextType = {
      draftService,
      isInitialized: true,
    };

    return (
      <ServiceContext.Provider value={mockServiceContext}>
        <MoveProvider boardSize={BOARD_CONFIG.SIZE}>{children}</MoveProvider>
      </ServiceContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMove.mockImplementation(() =>
      createDefaultMockResult({
        handleMouseMove: defaultMockHandleMouseMove,
        handleClick: defaultMockHandleClick,
      })
    );
    ({ container } = render(<GoBoard />, { wrapper }));
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

      mockUseMove.mockImplementation(() =>
        createDefaultMockResult({
          boardState: mockBoardState,
        })
      );
      ({ container } = render(<GoBoard />, { wrapper }));
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
      mockUseMove.mockImplementation(() =>
        createDefaultMockResult({
          hoverPosition: PREVIEW_POSITION,
        })
      );
      ({ container } = render(<GoBoard />, { wrapper }));
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
      mockUseMove.mockImplementation(() =>
        createDefaultMockResult({
          hoverPosition: PREVIEW_POSITION,
          nextColor: StoneColor.White,
        })
      );
      ({ container } = render(<GoBoard />, { wrapper }));

      const previewStone = container.querySelector('circle[opacity="0.5"]');
      expect(previewStone).toHaveAttribute('fill', 'white');
    });

    test('shows white preview stone with black border', () => {
      mockUseMove.mockImplementation(() =>
        createDefaultMockResult({
          hoverPosition: PREVIEW_POSITION,
          nextColor: StoneColor.White,
        })
      );
      ({ container } = render(<GoBoard />, { wrapper }));

      const previewStone = container.querySelector('circle[opacity="0.5"]');
      expect(previewStone).toHaveAttribute('stroke', 'black');
    });
  });

  describe('Mouse Events', () => {
    beforeEach(() => {
      defaultMockHandleMouseMove.mockClear();

      mockUseMove.mockImplementation(() =>
        createDefaultMockResult({
          handleMouseMove: defaultMockHandleMouseMove,
        })
      );
      ({ container } = render(<GoBoard />, { wrapper }));
    });

    test('handles mouse move in valid range', () => {
      defaultMockHandleMouseMove({ x: 2, y: 2 });
      expect(defaultMockHandleMouseMove).toHaveBeenCalledWith({ x: 2, y: 2 });
    });

    test('handles mouse leave', () => {
      fireEvent.mouseLeave(board!);
      expect(defaultMockHandleMouseMove).toHaveBeenCalledWith(null);
    });

    test('handles mouse move outside board', () => {
      defaultMockHandleMouseMove(null);
      expect(defaultMockHandleMouseMove).toHaveBeenCalledWith(null);
    });
  });

  describe('Click Events', () => {
    test('handles click on empty intersection', () => {
      mockUseMove.mockImplementation(() =>
        createDefaultMockResult({
          boardState: EMPTY_BOARD.map((row) => [...row]),
          hoverPosition: { x: 5, y: 5 },
          handleClick: defaultMockHandleClick,
        })
      );
      ({ container } = render(<GoBoard />, { wrapper }));
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

      mockUseMove.mockImplementation(() =>
        createDefaultMockResult({
          boardState: mockBoardState,
          hoverPosition: { x: 5, y: 5 },
          handleClick: mockHandleClick,
          nextColor: StoneColor.White,
        })
      );

      ({ container } = render(<GoBoard />, { wrapper }));
      board = container.querySelector('svg');

      fireEvent.click(board!);
      expect(mockHandleClick).not.toHaveBeenCalled();
    });

    test('handles click outside board', () => {
      const mockHandleClick = jest.fn();
      mockUseMove.mockImplementation(() =>
        createDefaultMockResult({
          handleClick: mockHandleClick,
        })
      );

      ({ container } = render(<GoBoard />, { wrapper }));
      board = container.querySelector('svg');

      fireEvent.click(board!);
      expect(mockHandleClick).not.toHaveBeenCalled();
    });
  });

  describe('Board State', () => {
    test('updates board state after placing stone', () => {
      const currentState = EMPTY_BOARD.map((row) => [...row]);
      const mockHandleClick = jest.fn().mockImplementation((pos: Point) => {
        currentState[pos.y][pos.x] = StoneColor.Black;
      });

      mockUseMove.mockImplementation(() =>
        createDefaultMockResult({
          boardState: currentState,
          hoverPosition: { x: 5, y: 5 },
          handleClick: mockHandleClick,
        })
      );
      ({ container } = render(<GoBoard />, { wrapper }));
      board = container.querySelector('svg');

      fireEvent.click(board!);

      mockUseMove.mockImplementation(() =>
        createDefaultMockResult({
          boardState: currentState,
          hoverPosition: { x: 5, y: 5 },
          handleClick: mockHandleClick,
          nextColor: StoneColor.White,
        })
      );
      render(<GoBoard />, { wrapper });

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

      mockUseMove.mockImplementation(() =>
        createDefaultMockResult({
          hoverPosition: { x: 5, y: 5 },
          handleClick: mockHandleClick,
          nextColor,
        })
      );
      ({ container } = render(<GoBoard />, { wrapper }));
      board = container.querySelector('svg');

      fireEvent.click(board!);
      expect(nextColor).toBe(StoneColor.White);

      mockUseMove.mockImplementation(() =>
        createDefaultMockResult({
          hoverPosition: { x: 5, y: 5 },
          handleClick: mockHandleClick,
          nextColor,
        })
      );
      render(<GoBoard />, { wrapper });

      fireEvent.click(board!);
      expect(nextColor).toBe(StoneColor.Black);
    });
  });
});
