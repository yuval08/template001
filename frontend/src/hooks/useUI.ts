import { uiSelectors, uiActions } from '@/stores';

/**
 * UI state management hook
 * Provides centralized UI state for layout and modal management
 */
export const useUI = () => {
  const sidebarOpen = uiSelectors.sidebarOpen();
  const sidebarCollapsed = uiSelectors.sidebarCollapsed();
  const modals = uiSelectors.modals();

  const setSidebarOpen = (open: boolean) => {
    uiActions.setSidebarOpen(open);
  };

  const setSidebarCollapsed = (collapsed: boolean) => {
    uiActions.setSidebarCollapsed(collapsed);
  };

  const toggleSidebar = () => {
    uiActions.toggleSidebar();
  };

  const openModal = (modalId: string) => {
    uiActions.openModal(modalId);
  };

  const closeModal = (modalId: string) => {
    uiActions.closeModal(modalId);
  };

  const toggleModal = (modalId: string) => {
    uiActions.toggleModal(modalId);
  };

  const isModalOpen = (modalId: string): boolean => {
    return uiSelectors.isModalOpen(modalId);
  };

  return {
    // State
    sidebarOpen,
    sidebarCollapsed,
    modals,
    
    // Sidebar actions
    setSidebarOpen,
    setSidebarCollapsed,
    toggleSidebar,
    
    // Modal actions
    openModal,
    closeModal,
    toggleModal,
    isModalOpen,
    
    // Utilities
    isSidebarVisible: sidebarOpen && !sidebarCollapsed,
    hasOpenModals: Object.values(modals).some(Boolean),
  };
};