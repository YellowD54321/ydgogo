import React, { useEffect, useState } from 'react';
import { DraftService } from '@/services/DraftService';
import { ServiceContext } from './ServiceContext';

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const draftService = DraftService.getInstance();

  useEffect(() => {
    const initializeServices = async () => {
      try {
        await draftService.init();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize services:', error);
      }
    };

    initializeServices();
  }, [draftService]);

  return (
    <ServiceContext.Provider value={{ draftService, isInitialized }}>
      {children}
    </ServiceContext.Provider>
  );
};
