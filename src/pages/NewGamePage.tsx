import ActionButtons from '@/components/ActionButtons';
import GoBoard from '@/components/GoBoard';
import { BOARD_CONFIG, DRAFT_CONFIG } from '@/constants/gameConfig';
import { MoveProvider } from '@/contexts/MoveProvider';
import { ServiceProvider } from '@/contexts/ServiceProvider';
import { useDraftLoader } from '@/hooks/useDraftLoader';

export default function NewGamePage() {
  const urlId = DRAFT_CONFIG.NEW_GAME_ID;

  const { draftTree, draftId, isLoading } = useDraftLoader({
    idSources: {
      urlId,
    },
  });

  return (
    <ServiceProvider>
      <div className="flex relative flex-col justify-center items-center">
        {isLoading ? (
          <div>Loading draft...</div>
        ) : (
          <MoveProvider
            boardSize={BOARD_CONFIG.SIZE}
            initialMoveTree={draftTree}
            initialDraftId={draftId}
          >
            <div className="w-full h-40"></div>
            <GoBoard />
            <ActionButtons />
          </MoveProvider>
        )}
      </div>
    </ServiceProvider>
  );
}
