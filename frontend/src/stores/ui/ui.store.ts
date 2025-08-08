import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { UIStore } from '../types';

const initialState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  modals: {} as Record<string, boolean>,
};

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        setSidebarOpen: (sidebarOpen: boolean) => set({ sidebarOpen }),
        
        setSidebarCollapsed: (sidebarCollapsed: boolean) => set({ sidebarCollapsed }),
        
        toggleSidebar: () => set((state) => ({ 
          sidebarOpen: !state.sidebarOpen 
        })),
        
        openModal: (modalId: string) => set((state) => ({
          modals: { ...state.modals, [modalId]: true },
        })),
        
        closeModal: (modalId: string) => set((state) => ({
          modals: { ...state.modals, [modalId]: false },
        })),
        
        toggleModal: (modalId: string) => set((state) => ({
          modals: { 
            ...state.modals, 
            [modalId]: !state.modals[modalId] 
          },
        })),
      }),
      {
        name: 'ui-storage',
        version: 1,
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);

// Selectors
export const uiSelectors = {
  sidebarOpen: () => useUIStore((state) => state.sidebarOpen),
  sidebarCollapsed: () => useUIStore((state) => state.sidebarCollapsed),
  isModalOpen: (modalId: string) => useUIStore((state) => !!state.modals[modalId]),
  modals: () => useUIStore((state) => state.modals),
};

// Actions
export const uiActions = {
  setSidebarOpen: (open: boolean) => useUIStore.getState().setSidebarOpen(open),
  setSidebarCollapsed: (collapsed: boolean) => useUIStore.getState().setSidebarCollapsed(collapsed),
  toggleSidebar: () => useUIStore.getState().toggleSidebar(),
  openModal: (modalId: string) => useUIStore.getState().openModal(modalId),
  closeModal: (modalId: string) => useUIStore.getState().closeModal(modalId),
  toggleModal: (modalId: string) => useUIStore.getState().toggleModal(modalId),
};