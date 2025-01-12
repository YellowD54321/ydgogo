import ActionButtons from '@/components/ActionButtons';
import GoBoard from '@/components/GoBoard';
import { BOARD_CONFIG } from '@/constants/gameConfig';
import { MoveProvider } from '@/contexts/MoveProvider';
import '@/App.css';

function App() {
  return (
    <div className='App'>
      <MoveProvider boardSize={BOARD_CONFIG.SIZE}>
        <GoBoard />
        <ActionButtons />
      </MoveProvider>
    </div>
  );
}

export default App;
