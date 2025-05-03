import ActionButtons from '@/components/ActionButtons';
import GoBoard from '@/components/GoBoard';
import { BOARD_CONFIG } from '@/constants/gameConfig';
import { MoveProvider } from '@/contexts/MoveProvider';

function App() {
  return (
    <div className='relative flex flex-col items-center justify-center'>
      <MoveProvider boardSize={BOARD_CONFIG.SIZE}>
        <GoBoard />
        <ActionButtons />
      </MoveProvider>
    </div>
  );
}

export default App;
