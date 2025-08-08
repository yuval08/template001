import { useEffect, useCallback } from 'react';
import { HubConnectionState } from '@microsoft/signalr';
import { signalRService } from '@/services/signalr';
import { useAuth } from './useAuth';
import { NotificationMessage } from '@/types';

export const useSignalR = () => {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    let mounted = true;

    const initializeConnection = async () => {
      if (isAuthenticated && user && mounted) {
        try {
          await signalRService.startConnection();
        } catch (error) {
          console.error('Failed to start SignalR connection:', error);
        }
      }
    };

    const cleanupConnection = async () => {
      try {
        await signalRService.stopConnection();
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
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
    async (message: string, targetUserId?: string) => {
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