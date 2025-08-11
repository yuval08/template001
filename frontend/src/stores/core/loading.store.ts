import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { LoadingStore, LoadingItem, LoadingPriority } from '../types';

const initialState = {
  items: {} as Record<string, LoadingItem>,
  globalLoading: false,
  criticalLoading: false,
};

// Helper function to generate unique IDs
const generateId = (): string => `loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper function to calculate loading states
const calculateLoadingStates = (items: Record<string, LoadingItem>) => {
  const itemList = Object.values(items);
  const globalLoading = itemList.length > 0;
  const criticalLoading = itemList.some(item => item.priority === 'critical');
  
  return { globalLoading, criticalLoading };
};

// Helper function to clean expired items
const cleanExpiredItems = (items: Record<string, LoadingItem>): Record<string, LoadingItem> => {
  const now = new Date();
  const cleanedItems: Record<string, LoadingItem> = {};
  
  Object.values(items).forEach(item => {
    if (item.timeout) {
      const elapsed = now.getTime() - item.startTime.getTime();
      if (elapsed < item.timeout) {
        cleanedItems[item.id] = item;
      }
    } else {
      cleanedItems[item.id] = item;
    }
  });
  
  return cleanedItems;
};

export const useLoadingStore = create<LoadingStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      startLoading: (key: string, options = {}) => {
        const id = options.id || generateId();
        const priority = options.priority || 'normal';
        const timeout = options.timeout;
        const metadata = options.metadata;
        
        const newItem: LoadingItem = {
          id,
          key,
          priority,
          startTime: new Date(),
          timeout,
          metadata,
        };
        
        set((state) => {
          const newItems = { ...state.items, [id]: newItem };
          const { globalLoading, criticalLoading } = calculateLoadingStates(newItems);
          
          return {
            items: newItems,
            globalLoading,
            criticalLoading,
          };
        });
        
        // Auto-cleanup for items with timeout
        if (timeout) {
          setTimeout(() => {
            const currentState = get();
            if (currentState.items[id]) {
              get().stopLoading(id);
            }
          }, timeout);
        }
        
        return id;
      },
      
      stopLoading: (keyOrId: string) => {
        set((state) => {
          const newItems = { ...state.items };
          
          // Remove by ID first
          if (newItems[keyOrId]) {
            delete newItems[keyOrId];
          } else {
            // Remove by key
            Object.entries(newItems).forEach(([itemId, item]) => {
              if (item.key === keyOrId) {
                delete newItems[itemId];
              }
            });
          }
          
          const { globalLoading, criticalLoading } = calculateLoadingStates(newItems);
          
          return {
            items: newItems,
            globalLoading,
            criticalLoading,
          };
        });
      },
      
      stopAllLoading: () => {
        set({
          items: {},
          globalLoading: false,
          criticalLoading: false,
        });
      },
      
      isLoading: (key?: string) => {
        const state = get();
        
        if (!key) {
          return state.globalLoading;
        }
        
        return Object.values(state.items).some(item => item.key === key);
      },
      
      getLoadingItems: (key?: string) => {
        const state = get();
        const items = Object.values(state.items);
        
        if (!key) {
          return items;
        }
        
        return items.filter(item => item.key === key);
      },
      
      clearExpiredItems: () => {
        set((state) => {
          const cleanedItems = cleanExpiredItems(state.items);
          const { globalLoading, criticalLoading } = calculateLoadingStates(cleanedItems);
          
          return {
            items: cleanedItems,
            globalLoading,
            criticalLoading,
          };
        });
      },
    }),
    { name: 'LoadingStore' }
  )
);

// Selectors for easy access
export const loadingSelectors = {
  globalLoading: () => useLoadingStore((state) => state.globalLoading),
  criticalLoading: () => useLoadingStore((state) => state.criticalLoading),
  isLoading: (key?: string) => useLoadingStore((state) => state.isLoading(key)),
  getLoadingItems: (key?: string) => useLoadingStore((state) => state.getLoadingItems(key)),
};

// Actions for external access
export const loadingActions = {
  startLoading: (key: string, options?: Parameters<LoadingStore['startLoading']>[1]) => 
    useLoadingStore.getState().startLoading(key, options),
  stopLoading: (keyOrId: string) => useLoadingStore.getState().stopLoading(keyOrId),
  stopAllLoading: () => useLoadingStore.getState().stopAllLoading(),
  isLoading: (key?: string) => useLoadingStore.getState().isLoading(key),
  getLoadingItems: (key?: string) => useLoadingStore.getState().getLoadingItems(key),
  clearExpiredItems: () => useLoadingStore.getState().clearExpiredItems(),
};