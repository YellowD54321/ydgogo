import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IconButton, TextField, Snackbar, Alert, Tooltip } from '@mui/material';
import { Save, Check, Edit } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { useMove } from '@/hooks/useMove';
import { updateRecord } from '@/services/api/recordsApi';
import { ISerializedMoveTree } from '@/models/serialize/types';

interface RecordToolbarProps {
  recordId: string;
  title: string;
  onTitleChange: (title: string) => void;
}

export default function RecordToolbar({
  recordId,
  title,
  onTitleChange,
}: RecordToolbarProps) {
  const auth = useAuth();
  const { moveTree } = useMove();
  const queryClient = useQueryClient();
  const token = auth.token!;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    severity: 'success' | 'error';
    message: string;
  }>({ open: false, severity: 'success', message: '' });

  const saveMutation = useMutation({
    mutationFn: () => {
      const gameTree: ISerializedMoveTree = JSON.parse(moveTree.serialize());
      return updateRecord(token, recordId, { title, gameTree });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['record', recordId] });
      setSnackbar({ open: true, severity: 'success', message: '儲存成功' });
    },
    onError: () => {
      setSnackbar({
        open: true,
        severity: 'error',
        message: '儲存失敗，請稍後再試',
      });
    },
  });

  const handleTitleConfirm = () => {
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleConfirm();
    }
  };

  return (
    <>
      <div className='flex gap-2 items-center px-2 mb-2'>
        {isEditingTitle ? (
          <>
            <TextField
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              size='small'
              autoFocus
              variant='standard'
            />
            <IconButton size='small' onClick={handleTitleConfirm}>
              <Check fontSize='small' />
            </IconButton>
          </>
        ) : (
          <>
            <span className='text-lg font-semibold'>{title}</span>
            <IconButton size='small' onClick={() => setIsEditingTitle(true)}>
              <Edit fontSize='small' />
            </IconButton>
          </>
        )}

        <Tooltip title='儲存到雲端'>
          <span>
            <IconButton
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              color='primary'
            >
              <Save />
            </IconButton>
          </span>
        </Tooltip>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
