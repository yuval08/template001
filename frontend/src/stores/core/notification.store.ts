import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { NotificationStore, NotificationItem } from '../types';

const initialState = {
  items: [] as NotificationItem[],
};

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      add: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newNotification: NotificationItem = {
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