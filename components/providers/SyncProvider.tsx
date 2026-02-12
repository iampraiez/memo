"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { syncService } from '@/services/sync.service';
import { useSession } from 'next-auth/react';

interface SyncContextValue {
  isOnline: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  manualSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isOnline, setIsOnline] = useState(syncService.getOnlineStatus());
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync session user ID to localStorage for offline access
  useEffect(() => {
    if (session?.user?.id && typeof window !== 'undefined') {
      localStorage.setItem('currentUserId', session.user.id);
    }
  }, [session]);

  // Subscribe to online/offline changes
  useEffect(() => {
    const unsubscribe = syncService.subscribe((online) => {
      setIsOnline(online);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Update pending sync count
  const updatePendingCount = useCallback(async () => {
    const count = await syncService.getPendingSyncCount();
    setPendingSyncCount(count);
  }, []);

  // Poll for pending sync count
  useEffect(() => {
    updatePendingCount();

    const interval = setInterval(() => {
      updatePendingCount();
    }, 5000);

    return () => clearInterval(interval);
  }, [updatePendingCount]);

  const manualSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await syncService.processSyncQueue();
      await updatePendingCount();
    } finally {
      setIsSyncing(false);
    }
  }, [updatePendingCount]);

  return (
    <SyncContext.Provider value={{ isOnline, pendingSyncCount, isSyncing, manualSync }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return context;
}
