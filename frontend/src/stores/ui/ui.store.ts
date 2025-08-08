import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UIStore } from '../types';
import { devtools, logger } from '../middleware';

const initialState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  modals: {} as Record<string, boolean>,
};

export const useUIStore = create<UIStore>()(
  devtools(
    { name: 'UIStore', enabled: process.env.NODE_ENV === 'development' }
  )(
    logger(
      { name: 'UI', enabled: process.env.NODE_ENV === 'development', collapsed: true }
    )(
      persist(
        (set, get) => ({
          ...initialState,
          
          setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
          
          setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
          
          toggleSidebar: () => set((state) => ({ 
            sidebarOpen: !state.sidebarOpen 
          })),
          
          openModal: (modalId) => set((state) => ({
            modals: { ...state.modals, [modalId]: true },
          })),
          
          closeModal: (modalId) => set((state) => ({
            modals: { ...state.modals, [modalId]: false },
          })),
          
          toggleModal: (modalId) => set((state) => ({
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
      )
    )
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