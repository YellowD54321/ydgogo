import { IconButton, Tooltip } from '@mui/material';
import { RestartAlt, ArrowBack, ArrowForward } from '@mui/icons-material';
import { useMove } from '@/hooks/useMove';

const ActionButtons = () => {
  const { handleClear, handlePreviousStep, handleNextStep, buttonStates } =
    useMove();
  const { canClear, canPrevious, canNext } = buttonStates;

  return (
    <div className='fixed z-10 flex gap-2 p-2 transform -translate-x-1/2 bg-white rounded-lg shadow-md bottom-4 left-1/2'>
      <Tooltip title='Clear'>
        <span>
          <IconButton onClick={handleClear} disabled={!canClear}>
            <RestartAlt />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title='Previous'>
        <span>
          <IconButton onClick={handlePreviousStep} disabled={!canPrevious}>
            <ArrowBack />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title='Next'>
        <span>
          <IconButton onClick={handleNextStep} disabled={!canNext}>
            <ArrowForward />
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};

export default ActionButtons;
