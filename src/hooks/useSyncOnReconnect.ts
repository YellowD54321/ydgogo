import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { useService } from './useService';
import { SyncService } from '@/services/SyncService';

export function useSyncOnReconnect() {
  const { token } = useAuth();
  const { draftService, isInitialized } = useService();
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (!isInitialized || !token) return;

    const sync = async () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;

      try {
        await SyncService.syncPendingToServer(draftService, token);
      } catch (error) {
        console.error('Sync on reconnect failed:', error);
      } finally {
        isSyncingRef.current = false;
      }
    };

    window.addEventListener('online', sync);

    if (navigator.onLine) {
      sync();
    }

    return () => {
      window.removeEventListener('online', sync);
    };
  }, [isInitialized, token, draftService]);
}
