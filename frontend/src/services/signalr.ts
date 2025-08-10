import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/toastStore';
import { NotificationMessage } from '@/types';
import type {
  JobCompletedMessage,
  JobFailedMessage,
  ProjectUpdatedMessage,
  SystemAnnouncementMessage,
  UserJoinedMessage,
  UserLeftMessage,
  SignalRConnectionState,
  SignalRServiceConfig
} from '@/types/signalr.types';
import type { UserId } from '@/shared/types/branded';

class SignalRService {
  private connection: HubConnection | null = null;
  private hubUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;

  constructor() {
    this.hubUrl = import.meta.env.VITE_SIGNALR_HUB_URL || 'http://localhost:5000/hubs/notifications';
  }

  async startConnection(): Promise<void> {
    // Prevent starting if already connected or connecting
    if (this.connection?.state === HubConnectionState.Connected || 
        this.connection?.state === HubConnectionState.Connecting) {
      return;
    }

    const { user, isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated || !user) {
      console.warn('User not authenticated for SignalR connection');
      return;
    }

    try {
      this.connection = new HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          // Use cookies for authentication instead of tokens
          withCredentials: true
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount < this.maxReconnectAttempts) {
              return this.reconnectDelay;
            }
            return null; // Stop reconnecting
          },
        })
        .build();

      // Set up event handlers
      this.setupEventHandlers();

      await this.connection.start();
      console.log('SignalR connection established');
      this.reconnectAttempts = 0;

      // Join user-specific group  
      await this.joinUserGroup(user.id as UserId);

    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      this.handleReconnection();
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Connection event handlers
    this.connection.onclose((error) => {
      console.log('SignalR connection closed', error);
      this.handleReconnection();
    });

    this.connection.onreconnecting((error) => {
      console.log('SignalR reconnecting...', error);
      toast.info({ title: 'Connection lost', description: 'Attempting to reconnect...' });
    });

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR reconnected', connectionId);
      toast.success({ title: 'Connection restored', description: 'Real-time updates are now available.' });
      this.reconnectAttempts = 0;
      
      // Re-join user group after reconnection
      const { user } = useAuthStore.getState();
      if (user) {
        this.joinUserGroup(user.id as UserId);
      }
    });

    // Message handlers
    this.connection.on('ReceiveNotification', (notification: NotificationMessage) => {
      this.handleNotification(notification);
    });

    this.connection.on('JobCompleted', (jobInfo: JobCompletedMessage) => {
      toast.success({ title: 'Job Completed', description: jobInfo.message });
      
      // Emit custom event for job completion
      const event = new CustomEvent('signalr:jobCompleted', {
        detail: jobInfo,
      });
      window.dispatchEvent(event);
    });

    this.connection.on('JobFailed', (jobInfo: { jobId: string; error: string; message: string }) => {
      toast.error({ title: 'Job Failed', description: jobInfo.message });
      
      // Emit custom event for job failure
      const event = new CustomEvent('signalr:jobFailed', {
        detail: jobInfo,
      });
      window.dispatchEvent(event);
    });

    this.connection.on('ProjectUpdated', (projectData: ProjectUpdatedMessage) => {
      toast.info({ title: 'Project Updated', description: `Project "${projectData.name}" has been updated.` });
      
      // Emit custom event for project updates
      const event = new CustomEvent('signalr:projectUpdated', {
        detail: projectData,
      });
      window.dispatchEvent(event);
    });

    this.connection.on('UserJoined', (userData: { userId: string; userName: string }) => {
      toast.info({ title: 'User Joined', description: `${userData.userName} has joined the workspace.` });
    });

    this.connection.on('UserLeft', (userData: { userId: string; userName: string }) => {
      toast.info({ title: 'User Left', description: `${userData.userName} has left the workspace.` });
    });

    // System-wide announcements
    this.connection.on('SystemAnnouncement', (announcement: { 
      title: string; 
      message: string; 
      type: 'info' | 'warning' | 'maintenance' 
    }) => {
      const toastType = announcement.type === 'warning' || announcement.type === 'maintenance' 
        ? 'warning' 
        : 'info';
        
      toast[toastType]({ title: announcement.title, description: announcement.message });
    });
  }

  private handleNotification(notification: NotificationMessage): void {
    // Import the notification store dynamically to avoid circular dependencies
    import('../stores/core/notification.store').then(({ useNotificationStore }) => {
      useNotificationStore.getState().addFromSignalR(notification);
    });

    // Add to toast notifications for backward compatibility
    const toastType = notification.type === 'error' ? 'error' : 
                     notification.type === 'warning' ? 'warning' : 
                     notification.type === 'success' ? 'success' : 'info';
                     
    toast[toastType]({ title: notification.title, description: notification.message });

    // Emit custom event for notifications
    const event = new CustomEvent('signalr:notification', {
      detail: notification,
    });
    window.dispatchEvent(event);
  }

  private async handleReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      toast.error({ title: 'Connection lost', description: 'Unable to restore real-time connection. Please refresh the page.' });
      return;
    }

    this.reconnectAttempts++;
    console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

    setTimeout(() => {
      this.startConnection();
    }, this.reconnectDelay);
  }

  async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('SignalR connection stopped');
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
      this.connection = null;
    }
  }

  async joinUserGroup(userId: UserId): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('JoinUserGroup', String(userId));
        console.log(`Joined user group: ${userId}`);
      } catch (error) {
        console.error('Error joining user group:', error);
      }
    }
  }

  async leaveUserGroup(userId: UserId): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('LeaveUserGroup', String(userId));
        console.log(`Left user group: ${userId}`);
      } catch (error) {
        console.error('Error leaving user group:', error);
      }
    }
  }

  async sendMessage(message: string, targetUserId?: UserId): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      try {
        if (targetUserId) {
          await this.connection.invoke('SendMessageToUser', String(targetUserId), message);
        } else {
          await this.connection.invoke('SendMessageToAll', message);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error({ title: 'Failed to send message' });
      }
    }
  }

  async notifyProjectUpdate(projectId: string): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('NotifyProjectUpdate', projectId);
      } catch (error) {
        console.error('Error notifying project update:', error);
      }
    }
  }

  getConnectionState(): HubConnectionState {
    return this.connection?.state || HubConnectionState.Disconnected;
  }

  isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }

  // Event subscription helpers
  onJobCompleted(callback: (jobInfo: JobCompletedMessage) => void): () => void {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('signalr:jobCompleted', handler as EventListener);
    
    return () => {
      window.removeEventListener('signalr:jobCompleted', handler as EventListener);
    };
  }

  onJobFailed(callback: (jobInfo: JobFailedMessage) => void): () => void {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('signalr:jobFailed', handler as EventListener);
    
    return () => {
      window.removeEventListener('signalr:jobFailed', handler as EventListener);
    };
  }

  onProjectUpdated(callback: (projectData: ProjectUpdatedMessage) => void): () => void {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('signalr:projectUpdated', handler as EventListener);
    
    return () => {
      window.removeEventListener('signalr:projectUpdated', handler as EventListener);
    };
  }

  onNotification(callback: (notification: NotificationMessage) => void): () => void {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('signalr:notification', handler as EventListener);
    
    return () => {
      window.removeEventListener('signalr:notification', handler as EventListener);
    };
  }
}

export const signalRService = new SignalRService();