import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import {
  listRecords,
  createRecord,
  deleteRecord,
} from '@/services/api/recordsApi';
import { RecordListItem } from '@/types/apis/recordsApi.types';
import { MoveTree } from '@/models/moveTree/MoveTree';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RecordListPage() {
  const auth = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = auth.token!;

  const [deleteTarget, setDeleteTarget] = useState<RecordListItem | null>(null);

  const recordsQuery = useQuery({
    queryKey: ['records'],
    queryFn: () => listRecords(token),
  });

  const createMutation = useMutation({
    mutationFn: () => {
      const emptyTree = new MoveTree();
      const gameTree = JSON.parse(emptyTree.serialize());
      return createRecord(token, { title: '未命名棋譜', gameTree });
    },
    onSuccess: (data) => {
      router.navigate({
        to: '/records/$recordId',
        params: { recordId: data.recordId },
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (recordId: string) => deleteRecord(token, recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      setDeleteTarget(null);
    },
  });

  const handleDeleteClick = (e: React.MouseEvent, record: RecordListItem) => {
    e.stopPropagation();
    setDeleteTarget(record);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.recordId);
    }
  };

  return (
    <div className='flex flex-col items-center px-4 py-6 mx-auto max-w-lg'>
      <div className='flex justify-between items-center mb-4 w-full'>
        <h1 className='text-xl font-bold'>我的棋譜</h1>
        <Button
          variant='contained'
          startIcon={<Add />}
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
        >
          新增棋譜
        </Button>
      </div>

      {recordsQuery.isPending && <CircularProgress className='mt-8' />}

      {recordsQuery.isError && (
        <Alert severity='error' className='w-full'>
          載入棋譜列表失敗，請稍後再試
        </Alert>
      )}

      {createMutation.isError && (
        <Alert severity='error' className='mb-2 w-full'>
          新增棋譜失敗，請稍後再試
        </Alert>
      )}

      {recordsQuery.isSuccess && recordsQuery.data.records.length === 0 && (
        <p className='mt-8 text-neutral-500'>尚無棋譜，點擊「新增棋譜」開始</p>
      )}

      {recordsQuery.isSuccess && recordsQuery.data.records.length > 0 && (
        <List className='w-full'>
          {recordsQuery.data.records.map((record) => (
            <ListItem
              key={record.recordId}
              disablePadding
              secondaryAction={
                <IconButton
                  edge='end'
                  onClick={(e) => handleDeleteClick(e, record)}
                  disabled={deleteMutation.isPending}
                >
                  <Delete />
                </IconButton>
              }
            >
              <ListItemButton
                onClick={() =>
                  router.navigate({
                    to: '/records/$recordId',
                    params: { recordId: record.recordId },
                  })
                }
              >
                <ListItemText
                  primary={record.title}
                  secondary={formatDate(record.updatedAt)}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>確認刪除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            確認要刪除「{deleteTarget?.title}」嗎？此操作無法復原。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>取消</Button>
          <Button
            onClick={handleConfirmDelete}
            color='error'
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? '刪除中...' : '刪除'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
