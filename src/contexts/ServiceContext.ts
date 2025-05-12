import { createContext } from 'react';
import { DraftService } from '@/services/DraftService';

export interface ServiceContextType {
  draftService: DraftService;
  isInitialized: boolean;
}

export const ServiceContext = createContext<ServiceContextType | null>(null);
