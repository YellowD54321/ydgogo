import { useContext } from 'react';
import { ServiceContext } from '@/contexts/ServiceContext';

export const useService = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  return context;
};
