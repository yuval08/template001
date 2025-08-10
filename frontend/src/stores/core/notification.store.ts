import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { NotificationStore, NotificationItem } from '../types';

interface ExtendedNotificationItem extends NotificationItem {
  isRead?: boolean;
  readAt?: Date;
  actionUrl?: string;
  metadata?: string;
}

interface ExtendedNotificationStore extends Omit<NotificationStore, 'items' | 'add'> {
  items: ExtendedNotificationItem[];
  persistentItems: ExtendedNotificationItem[];
  add: (notification: Omit<ExtendedNotificationItem, 'id' | 'timestamp'>) => string;
  setPersistentItems: (items: ExtendedNotificationItem[]) => void;
  addFromSignalR: (notification: any) => void;
}

const initialState = {
  items: [] as ExtendedNotificationItem[],
  persistentItems: [] as ExtendedNotificationItem[],
};

export const useNotificationStore = create<ExtendedNotificationStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      add: (notification: Omit<ExtendedNotificationItem, 'id' | 'timestamp'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newNotification: ExtendedNotificationItem = {
          ...notification,
          id,
          timestamp: new Date(),
          duration: notification.duration ?? 5000,
        };
        
        set((state) => ({
          items: [...state.items, newNotification],
        }));
        
        // Auto-remove notification after duration
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().remove(id);
          }, newNotification.duration);
        }
        
        return id;
      },
      
      setPersistentItems: (items: ExtendedNotificationItem[]) => {
        set({ persistentItems: items });
      },
      
      addFromSignalR: (notification: any) => {
        const newNotification: ExtendedNotificationItem = {
          id: notification.id || notification.Id,
          title: notification.title || notification.Title,
          description: notification.message || notification.Message,
          type: (notification.type || notification.Type || 'info') as any,
          timestamp: new Date(notification.timestamp || notification.Timestamp),
          isRead: notification.isRead || notification.IsRead || false,
          actionUrl: notification.actionUrl || notification.ActionUrl,
          metadata: notification.metadata || notification.Metadata,
          duration: 5000,
        };
        
        // Add to persistent items
        set((state) => ({
          persistentItems: [newNotification, ...state.persistentItems],
        }));
        
        // Also add to toast items for real-time display
        get().add(newNotification);
      },
      
      remove: (id: string) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
      
      clear: () => set({ items: [] }),
      
      markAsRead: (id: string) => set((state) => ({
        items: state.items.map((item) => 
          item.id === id ? { ...item, read: true } : item
        ),
      })),
    }),
    { name: 'NotificationStore' }
  )
);

// Selectors
export const notificationSelectors = {
  items: () => useNotificationStore((state) => state.items),
  unreadCount: () => useNotificationStore((state) => 
    state.items.filter(item => !('read' in item) || !item.read).length
  ),
  byType: (type: NotificationItem['type']) => useNotificationStore((state) => 
    state.items.filter(item => item.type === type)
  ),
};

// Actions
export const notificationActions = {
  add: (notification: Parameters<NotificationStore['add']>[0]) => useNotificationStore.getState().add(notification),
  remove: (id: string) => useNotificationStore.getState().remove(id),
  clear: () => useNotificationStore.getState().clear(),
  markAsRead: (id: string) => useNotificationStore.getState().markAsRead(id),
};