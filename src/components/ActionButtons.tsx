import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { RestartAlt, ArrowBack, ArrowForward } from '@mui/icons-material';
import { useMove } from '@/hooks/useMove';
import { useState } from 'react';

const ActionButtons = () => {
  const { handleClear, handlePreviousStep, handleNextStep, buttonStates } =
    useMove();
  const { canClear, canPrevious, canNext } = buttonStates;
  const [openClearDialog, setOpenClearDialog] = useState(false);

  const handleClearClick = () => {
    setOpenClearDialog(true);
  };

  const handleCancelClear = () => {
    setOpenClearDialog(false);
  };

  const handleConfirmClear = () => {
    setOpenClearDialog(false);
    handleClear();
  };

  return (
    <>
      <div className='flex fixed bottom-4 left-1/2 z-10 gap-2 p-2 bg-white rounded-lg shadow-md transform -translate-x-1/2'>
        <Tooltip title='Clear'>
          <span>
            <IconButton onClick={handleClearClick} disabled={!canClear}>
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

      <Dialog open={openClearDialog} onClose={handleCancelClear}>
        <DialogTitle>確認清除</DialogTitle>
        <DialogContent>
          <DialogContentText>確認要清除所有棋子嗎？</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClear}>取消</Button>
          <Button onClick={handleConfirmClear} color='primary' autoFocus>
            確認
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ActionButtons;
