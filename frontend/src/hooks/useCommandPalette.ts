import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for managing the command palette state and global keyboard shortcuts
 * Handles Ctrl+K / Cmd+K shortcut to open the command palette
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+K (Windows/Linux) or Cmd+K (Mac)
      const isCommandK = (event.ctrlKey || event.metaKey) && event.key === 'k';
      
      if (isCommandK) {
        event.preventDefault();
        event.stopPropagation();
        toggle();
        return;
      }

      // Close on Escape (global)
      if (event.key === 'Escape' && isOpen) {
        close();
        return;
      }
    };

    // Add global event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, toggle, close]);

  // Prevent body scroll when command palette is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return {
    isOpen,
    open,
    close,
    toggle
  };
}