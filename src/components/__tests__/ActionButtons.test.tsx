import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActionButtons from '../ActionButtons';
import { useMove } from '@/hooks/useMove';
import { MoveContextType } from '@/contexts/MoveContext';
import { StoneColor } from '@/constants/gameConfig';
import { MoveTree } from '@/models/moveTree/MoveTree';

interface IconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

interface TooltipProps {
  children: React.ReactNode;
  title: string;
}

interface DialogProps {
  children: React.ReactNode;
  open: boolean;
  onClose?: () => void;
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
  autoFocus?: boolean;
}

jest.mock('@mui/material', () => ({
  IconButton: ({ children, onClick, disabled }: IconButtonProps) => (
    <button onClick={onClick} disabled={disabled} data-testid='icon-button'>
      {children}
    </button>
  ),
  Tooltip: ({ children, title }: TooltipProps) => (
    <div data-tooltip={title}>{children}</div>
  ),
  Dialog: ({ children, open, onClose }: DialogProps) =>
    open ? (
      <div data-testid='dialog' onClick={onClose}>
        {children}
      </div>
    ) : null,
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='dialog-title'>{children}</div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='dialog-content'>{children}</div>
  ),
  DialogContentText: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='dialog-content-text'>{children}</div>
  ),
  DialogActions: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='dialog-actions'>{children}</div>
  ),
  Button: ({ children, onClick, color, autoFocus }: ButtonProps) => (
    <button
      onClick={onClick}
      data-testid='dialog-button'
      data-color={color}
      data-autofocus={autoFocus}
    >
      {children}
    </button>
  ),
}));

jest.mock('@mui/icons-material', () => ({
  RestartAlt: () => <span data-testid='clear-icon'>Clear</span>,
  ArrowBack: () => <span data-testid='previous-icon'>Previous</span>,
  ArrowForward: () => <span data-testid='next-icon'>Next</span>,
}));

jest.mock('../../hooks/useMove');
const mockUseMove = useMove as jest.MockedFunction<typeof useMove>;

const createMockContext = (overrides = {}): MoveContextType => ({
  boardState: Array(19)
    .fill(null)
    .map(() => Array(19).fill(StoneColor.Empty)),
  moveTree: new MoveTree(),
  hoverPosition: null,
  nextColor: StoneColor.Black,
  buttonStates: {
    canClear: false,
    canPrevious: false,
    canNext: false,
  },
  handleMouseMove: jest.fn(),
  handleClick: jest.fn(),
  handlePreviousStep: jest.fn(),
  handleNextStep: jest.fn(),
  handleClear: jest.fn(),
  handleSwitchNode: jest.fn(),
  ...overrides,
});

describe('ActionButtons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMove.mockReturnValue(createMockContext());
  });

  it('should render all buttons with correct tooltips', () => {
    const { container } = render(<ActionButtons />);

    expect(
      container.querySelector('[data-tooltip="Clear"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-tooltip="Previous"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-tooltip="Next"]')
    ).toBeInTheDocument();
  });

  it('should render all icons', () => {
    const { getByTestId } = render(<ActionButtons />);

    expect(getByTestId('clear-icon')).toBeInTheDocument();
    expect(getByTestId('previous-icon')).toBeInTheDocument();
    expect(getByTestId('next-icon')).toBeInTheDocument();
  });

  it('should disable buttons when no moves available', () => {
    const { container } = render(<ActionButtons />);

    const buttons = container.querySelectorAll('[data-testid="icon-button"]');
    buttons.forEach((button: Element) => {
      expect(button).toBeDisabled();
    });
  });

  it('should enable buttons based on buttonStates', () => {
    mockUseMove.mockReturnValue(
      createMockContext({
        buttonStates: {
          canClear: true,
          canPrevious: true,
          canNext: true,
        },
      })
    );

    const { container } = render(<ActionButtons />);

    const buttons = container.querySelectorAll('[data-testid="icon-button"]');
    buttons.forEach((button: Element) => {
      expect(button).toBeEnabled();
    });
  });

  it('should call handlers when buttons are clicked', () => {
    const mockHandlers = {
      handleClear: jest.fn(),
      handlePreviousStep: jest.fn(),
      handleNextStep: jest.fn(),
    };

    mockUseMove.mockReturnValue(
      createMockContext({
        ...mockHandlers,
        buttonStates: {
          canClear: true,
          canPrevious: true,
          canNext: true,
        },
      })
    );

    const { container } = render(<ActionButtons />);

    const buttons = container.querySelectorAll('[data-testid="icon-button"]');
    const previousButton = buttons[1];
    const nextButton = buttons[2];

    fireEvent.click(previousButton);
    fireEvent.click(nextButton);

    expect(mockHandlers.handlePreviousStep).toHaveBeenCalled();
    expect(mockHandlers.handleNextStep).toHaveBeenCalled();
  });

  it('should show confirmation dialog when clear button is clicked', () => {
    mockUseMove.mockReturnValue(
      createMockContext({
        buttonStates: {
          canClear: true,
          canPrevious: false,
          canNext: false,
        },
      })
    );

    const { container, queryByTestId } = render(<ActionButtons />);

    // 確認對話框一開始不存在
    expect(queryByTestId('dialog')).not.toBeInTheDocument();

    // 點擊清除按鈕
    const buttons = container.querySelectorAll('[data-testid="icon-button"]');
    const clearButton = buttons[0];
    fireEvent.click(clearButton);

    // 確認對話框出現
    expect(queryByTestId('dialog')).toBeInTheDocument();
    expect(queryByTestId('dialog-content-text')).toHaveTextContent(
      '確認要清除所有棋子嗎？'
    );
  });

  it('should call handleClear when confirm button is clicked', () => {
    const mockHandleClear = jest.fn();
    mockUseMove.mockReturnValue(
      createMockContext({
        handleClear: mockHandleClear,
        buttonStates: {
          canClear: true,
          canPrevious: false,
          canNext: false,
        },
      })
    );

    const { container, getAllByTestId } = render(<ActionButtons />);

    // 點擊清除按鈕以顯示對話框
    const buttons = container.querySelectorAll('[data-testid="icon-button"]');
    const clearButton = buttons[0];
    fireEvent.click(clearButton);

    // 找到對話框中的按鈕（取消和確認）
    const dialogButtons = getAllByTestId('dialog-button');
    const confirmButton = dialogButtons[1]; // 確認按鈕是第二個

    // 點擊確認按鈕
    fireEvent.click(confirmButton);

    // 確認 handleClear 被調用
    expect(mockHandleClear).toHaveBeenCalled();
  });

  it('should close dialog when cancel button is clicked', () => {
    mockUseMove.mockReturnValue(
      createMockContext({
        buttonStates: {
          canClear: true,
          canPrevious: false,
          canNext: false,
        },
      })
    );

    const { container, getAllByTestId, queryByTestId } = render(
      <ActionButtons />
    );

    // 點擊清除按鈕以顯示對話框
    const buttons = container.querySelectorAll('[data-testid="icon-button"]');
    const clearButton = buttons[0];
    fireEvent.click(clearButton);

    // 確認對話框存在
    expect(queryByTestId('dialog')).toBeInTheDocument();

    // 找到對話框中的取消按鈕
    const dialogButtons = getAllByTestId('dialog-button');
    const cancelButton = dialogButtons[0]; // 取消按鈕是第一個

    // 點擊取消按鈕
    fireEvent.click(cancelButton);

    // 確認對話框關閉
    expect(queryByTestId('dialog')).not.toBeInTheDocument();
  });
});
