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

jest.mock('@mui/material', () => ({
  IconButton: ({ children, onClick, disabled }: IconButtonProps) => (
    <button onClick={onClick} disabled={disabled} data-testid='icon-button'>
      {children}
    </button>
  ),
  Tooltip: ({ children, title }: TooltipProps) => (
    <div data-tooltip={title}>{children}</div>
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
    const clearButton = buttons[0];
    const previousButton = buttons[1];
    const nextButton = buttons[2];

    fireEvent.click(clearButton);
    fireEvent.click(previousButton);
    fireEvent.click(nextButton);

    expect(mockHandlers.handleClear).toHaveBeenCalled();
    expect(mockHandlers.handlePreviousStep).toHaveBeenCalled();
    expect(mockHandlers.handleNextStep).toHaveBeenCalled();
  });
});
