import { IconButton, Tooltip } from '@mui/material';
import { RestartAlt, ArrowBack, ArrowForward } from '@mui/icons-material';
import { useMove } from '@/hooks/useMove';

const ActionButtons = () => {
  const { handleClear, handlePreviousStep, handleNextStep, buttonStates } =
    useMove();
  const { canClear, canPrevious, canNext } = buttonStates;

  return (
    <div className='flex gap-2'>
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
