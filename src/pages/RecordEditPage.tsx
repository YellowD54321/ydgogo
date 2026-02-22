import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { CircularProgress, Alert } from '@mui/material';
import GoBoard from '@/components/GoBoard';
import ActionButtons from '@/components/ActionButtons';
import RecordToolbar from '@/components/RecordToolbar';
import { BOARD_CONFIG } from '@/constants/gameConfig';
import { MoveProvider } from '@/contexts/MoveProvider';
import { ServiceProvider } from '@/contexts/ServiceProvider';
import { useAuth } from '@/hooks/useAuth';
import { getRecord } from '@/services/api/recordsApi';
import { MoveTree } from '@/models/moveTree/MoveTree';

function RecordEditContent() {
  const { recordId } = useParams({ from: '/records/$recordId' });
  const auth = useAuth();
  const token = auth.token!;

  const [title, setTitle] = useState('');

  const recordQuery = useQuery({
    queryKey: ['record', recordId],
    queryFn: async () => {
      const record = await getRecord(token, recordId);
      setTitle(record.title);
      return record;
    },
  });

  if (recordQuery.isPending) {
    return (
      <div className='flex justify-center items-center h-full'>
        <CircularProgress />
      </div>
    );
  }

  if (recordQuery.isError) {
    return (
      <div className='flex justify-center items-center px-4 h-full'>
        <Alert severity='error'>載入棋譜失敗，請稍後再試</Alert>
      </div>
    );
  }

  const moveTree = MoveTree.deserialize(
    JSON.stringify(recordQuery.data.gameTree),
  );

  return (
    <div className='flex flex-col justify-center items-center pb-20 h-full'>
      <MoveProvider
        boardSize={BOARD_CONFIG.SIZE}
        initialMoveTree={moveTree}
        recordId={recordId}
        recordTitle={title}
        userId={auth.user?.userId}
      >
        <RecordToolbar
          recordId={recordId}
          title={title}
          onTitleChange={setTitle}
        />
        <GoBoard />
        <ActionButtons />
      </MoveProvider>
    </div>
  );
}

export default function RecordEditPage() {
  return (
    <ServiceProvider>
      <RecordEditContent />
    </ServiceProvider>
  );
}
