import ActionButtons from '@/components/ActionButtons';
import GoBoard from '@/components/GoBoard';
import { BOARD_CONFIG } from '@/constants/gameConfig';
import { MoveProvider } from '@/contexts/MoveProvider';
import { ServiceProvider } from '@/contexts/ServiceProvider';

function App() {
  return (
    <ServiceProvider>
      <div className='relative flex flex-col items-center justify-center'>
        <MoveProvider boardSize={BOARD_CONFIG.SIZE}>
          <GoBoard />
          <ActionButtons />
        </MoveProvider>
      </div>
    </ServiceProvider>
  );
}

export default App;
