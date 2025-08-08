import { create } from 'zustand';
import { NotificationStore, NotificationItem } from '../types';
import { devtools, logger } from '../middleware';

const initialState = {
  items: [],
};

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    { name: 'NotificationStore', enabled: process.env.NODE_ENV === 'development' }
  )(
    logger(
      { name: 'Notification', enabled: process.env.NODE_ENV === 'development', collapsed: true }
    )(
      (set, get) => ({
        ...initialState,
        
        add: (notification) => {
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
        
        remove: (id) => set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
        
        clear: () => set({ items: [] }),
        
        markAsRead: (id) => set((state) => ({
          items: state.items.map((item) => 
            item.id === id ? { ...item, read: true } : item
          ),
        })),
      })
    )
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