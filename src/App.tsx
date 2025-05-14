import ActionButtons from '@/components/ActionButtons';
import GoBoard from '@/components/GoBoard';
import { BOARD_CONFIG, DRAFT_CONFIG } from '@/constants/gameConfig';
import { MoveProvider } from '@/contexts/MoveProvider';
import { ServiceProvider } from '@/contexts/ServiceProvider';
import { useDraftLoader } from '@/hooks/useDraftLoader';

function NewGamePage() {
  const urlId = DRAFT_CONFIG.NEW_GAME_ID;

  const { draftTree, draftId, isLoading } = useDraftLoader({
    idSources: {
      urlId,
    },
  });

  return (
    <div className='relative flex flex-col items-center justify-center'>
      {isLoading ? (
        <div>Loading draft...</div>
      ) : (
        <MoveProvider
          boardSize={BOARD_CONFIG.SIZE}
          initialMoveTree={draftTree}
          initialDraftId={draftId}
        >
          <GoBoard />
          <ActionButtons />
        </MoveProvider>
      )}
    </div>
  );
}

function App() {
  return (
    <ServiceProvider>
      <NewGamePage />
    </ServiceProvider>
  );
}

export default App;
