import { useContext } from 'react';
import { MoveContext } from '@/contexts/MoveContext';

export const useMove = () => {
  const context = useContext(MoveContext);
  if (!context) {
    throw new Error('useMove must be used within a MoveProvider');
  }
  return context;
};
