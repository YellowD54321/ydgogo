import {
  useRef,
  useMemo,
  useCallback,
  useEffect,
  useState,
  ReactNode,
  FC,
} from 'react';
import { BOARD_CONFIG, StoneColor } from '@/constants/gameConfig';
import { MoveTree } from '@/models/moveTree/MoveTree';
import { IMoveNode } from '@/models/moveNode/types';
import { MoveContext } from './MoveContext';
import { CaptureService } from '@/models/capture/CaptureService';
import { Point } from '@/types/point';
import { Group } from '@/models/capture/types';
import { useService } from '@/hooks/useService';

interface MoveProviderProps {
  boardSize: number;
  initialMoveTree?: MoveTree | null;
  initialDraftId?: string | null;
  children: ReactNode;
}

export const MoveProvider: FC<MoveProviderProps> = ({
  boardSize,
  initialMoveTree = null,
  initialDraftId = null,
  children,
}) => {
  const moveTreeRef = useRef<MoveTree>(initialMoveTree || new MoveTree());
  const autoSaveDraftIdRef = useRef<string>(initialDraftId || '');
  const { draftService, isInitialized } = useService();

  // TODO: 重構為 Board 類別，封裝取得座標的方法，避免容易搞混 x, y 的順序
  // x, y 的順序是 boardState[y][x]
  const [boardState, setBoardState] = useState<StoneColor[][]>(
    Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill(StoneColor.Empty))
  );
  const [hoverPosition, setHoverPosition] = useState<Point | null>(null);

  const buttonStates = useMemo(() => {
    const currentNode = moveTreeRef.current.pointer.currentNode;
    return {
      canClear: currentNode !== moveTreeRef.current.rootNode,
      canPrevious: currentNode !== moveTreeRef.current.rootNode,
      canNext: currentNode.childrenNodes.length > 0,
    };
    // moveTree 是 useRef 的物件，所以不會觸發 re-render
    // 這邊以 boardState 來觸發 re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardState]);

  const saveDraft = async () => {
    if (!isInitialized) return;

    try {
      const draftId = await draftService.saveDraft(
        moveTreeRef.current,
        'New Game',
        autoSaveDraftIdRef.current
      );
      autoSaveDraftIdRef.current = draftId;
    } catch (error) {
      console.error('Save draft failed:', error);
    }
  };

  const updateBoardState = useCallback(() => {
    const newBoardState = Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill(StoneColor.Empty));

    const nodes: IMoveNode[] = [];
    let currentNode: IMoveNode | null = moveTreeRef.current.pointer.currentNode;
    while (currentNode) {
      if (currentNode.x >= 0 && currentNode.y >= 0) {
        nodes.unshift(currentNode);
      }
      currentNode = currentNode.parentNode;
    }

    // 按照路徑順序放置棋子
    nodes.forEach((node) => {
      const { x, y, color, capturedGroups } = node;

      if (x >= 0 && y >= 0) {
        // 先處理被吃掉的棋子
        capturedGroups?.forEach((group: Group) => {
          group.stones.forEach((point: Point) => {
            newBoardState[point.y][point.x] = StoneColor.Empty;
          });
        });

        // 再放置當前棋子
        newBoardState[y][x] = color;
      }
    });

    setBoardState(newBoardState);
  }, [boardSize]);

  useEffect(() => {
    if (initialMoveTree) {
      updateBoardState();
    }
  }, [initialMoveTree, updateBoardState]);

  const handleMouseMove = (position: Point | null) => {
    const captureService = new CaptureService(BOARD_CONFIG.SIZE);
    if (
      !captureService.isLegalMove(
        { x: position?.x, y: position?.y, color: nextColor },
        boardState
      )
    ) {
      setHoverPosition(null);
      return;
    }

    setHoverPosition(position);
  };

  const handleClick = (position: Point) => {
    const { x, y } = position;
    const captureService = new CaptureService(BOARD_CONFIG.SIZE);

    if (!captureService.isLegalMove({ x, y, color: nextColor }, boardState)) {
      return;
    }

    const capturedGroups = captureService.getCapturedGroups(
      { x, y, color: nextColor },
      boardState
    );

    moveTreeRef.current.addMove({ x, y, color: nextColor }, capturedGroups);

    updateBoardState();

    saveDraft();
  };

  const handlePreviousStep = () => {
    if (moveTreeRef.current.previousStep()) {
      updateBoardState();
    }
  };

  const handleNextStep = () => {
    if (moveTreeRef.current.nextStep()) {
      updateBoardState();
    }
  };

  const handleClear = () => {
    moveTreeRef.current.clear();
    updateBoardState();
  };

  const handleSwitchNode = (node: IMoveNode) => {
    moveTreeRef.current.switchToNode(node);
    updateBoardState();
  };

  const nextColor =
    moveTreeRef.current.pointer.currentNode.color === StoneColor.Black
      ? StoneColor.White
      : StoneColor.Black;

  const value = {
    boardState,
    moveTree: moveTreeRef.current,
    hoverPosition,
    nextColor,
    buttonStates,
    handleMouseMove,
    handleClick,
    handlePreviousStep,
    handleNextStep,
    handleClear,
    handleSwitchNode,
  };

  return <MoveContext.Provider value={value}>{children}</MoveContext.Provider>;
};
