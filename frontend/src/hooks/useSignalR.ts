import { useEffect, useCallback } from 'react';
import { HubConnectionState } from '@microsoft/signalr';
import { signalRService } from '@/services/signalr';
import { useAuth } from './useAuth';
import { NotificationMessage } from '@/types';
import type { UserId } from '@/shared/types/branded';

export const useSignalR = () => {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    let mounted = true;
    let connectionTimeout: NodeJS.Timeout;

    const initializeConnection = async () => {
      if (isAuthenticated && user && mounted) {
        // Add a small delay to handle React StrictMode double-mounting
        connectionTimeout = setTimeout(async () => {
          if (mounted) {
            try {
              await signalRService.startConnection();
            } catch (error) {
              console.error('Failed to start SignalR connection:', error);
            }
          }
        }, 100);
      }
    };

    const cleanupConnection = async () => {
      clearTimeout(connectionTimeout);
      // Only stop connection if component is truly unmounting (not StrictMode re-render)
      if (!mounted) {
        // Don't stop the connection immediately - it might be a StrictMode re-render
        // The SignalR service will handle reconnection if needed
      }
    };

    if (isAuthenticated) {
      initializeConnection();
    }

    return () => {
      mounted = false;
      cleanupConnection();
    };
  }, [isAuthenticated, user]);

  const sendMessage = useCallback(
    async (message: string, targetUserId?: UserId) => {
      await signalRService.sendMessage(message, targetUserId);
    },
    []
  );

  const notifyProjectUpdate = useCallback(
    async (projectId: string) => {
      await signalRService.notifyProjectUpdate(projectId);
    },
    []
  );

  const getConnectionState = useCallback((): HubConnectionState => {
    return signalRService.getConnectionState();
  }, []);

  const isConnected = useCallback((): boolean => {
    return signalRService.isConnected();
  }, []);

  return {
    sendMessage,
    notifyProjectUpdate,
    getConnectionState,
    isConnected,
    signalRService,
  };
};

// Hook for listening to job completion events
export const useJobCompletion = (callback: (jobInfo: any) => void) => {
  useEffect(() => {
    const cleanup = signalRService.onJobCompleted(callback);
    return cleanup;
  }, [callback]);
};

// Hook for listening to job failure events
export const useJobFailure = (callback: (jobInfo: any) => void) => {
  useEffect(() => {
    const cleanup = signalRService.onJobFailed(callback);
    return cleanup;
  }, [callback]);
};

// Hook for listening to project update events
export const useProjectUpdates = (callback: (projectData: any) => void) => {
  useEffect(() => {
    const cleanup = signalRService.onProjectUpdated(callback);
    return cleanup;
  }, [callback]);
};

// Hook for listening to notification events
export const useNotifications = (callback: (notification: NotificationMessage) => void) => {
  useEffect(() => {
    const cleanup = signalRService.onNotification(callback);
    return cleanup;
  }, [callback]);
};

// Hook for listening to notification refresh events
export const useNotificationRefresh = (callback: () => void) => {
  useEffect(() => {
    const cleanup = signalRService.onRefreshNotifications(callback);
    return cleanup;
  }, [callback]);
};

// Hook for listening to unread count updates
export const useUnreadCountUpdate = (callback: (count: number) => void) => {
  useEffect(() => {
    const cleanup = signalRService.onUnreadCountUpdated(callback);
    return cleanup;
  }, [callback]);
};