import React from 'react';
import { createPortal } from 'react-dom';
import { useGlobalLoading } from '@/hooks/useLoading';
import { cn } from '@/utils/cn';
import { Progress } from './progress';

interface GlobalLoadingIndicatorProps {
  /**
   * Whether to show a progress bar at the top of the screen
   */
  showProgressBar?: boolean;
  
  /**
   * Whether to show a loading overlay for critical operations
   */
  showCriticalOverlay?: boolean;
  
  /**
   * Custom class name for the progress bar
   */
  progressClassName?: string;
  
  /**
   * Custom class name for the overlay
   */
  overlayClassName?: string;
  
  /**
   * Portal container for the loading indicator
   */
  container?: Element;
}

/**
 * Global loading progress bar component
 */
export function LoadingProgressBar({ 
  className,
  show = false
}: { 
  className?: string;
  show?: boolean;
}) {
  if (!show) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 h-1",
      className
    )}>
      <div className="h-full bg-primary/20 overflow-hidden">
        <div className="h-full bg-primary animate-pulse relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-slide-right" />
        </div>
      </div>
    </div>
  );
}

/**
 * Critical loading overlay component
 */
export function CriticalLoadingOverlay({
  className,
  show = false,
  children
}: {
  className?: string;
  show?: boolean;
  children?: React.ReactNode;
}) {
  if (!show) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
      "flex items-center justify-center",
      className
    )}>
      <div className="flex flex-col items-center space-y-4 p-8 bg-card rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        <div className="text-center">
          <div className="font-medium">Processing...</div>
          <div className="text-sm text-muted-foreground mt-1">
            Please wait while we complete this operation
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

/**
 * Global loading indicator that shows different states based on loading priority
 */
export function GlobalLoadingIndicator({
  showProgressBar = true,
  showCriticalOverlay = true,
  progressClassName,
  overlayClassName,
  container = document.body
}: GlobalLoadingIndicatorProps) {
  const { globalLoading, criticalLoading, items, getLoadingByPriority } = useGlobalLoading();

  // Don't render anything if there's no loading
  if (!globalLoading) return null;

  const criticalItems = getLoadingByPriority('critical');
  const hasCritical = criticalItems.length > 0;

  const indicator = (
    <>
      {/* Progress bar for general loading */}
      {showProgressBar && globalLoading && !hasCritical && (
        <LoadingProgressBar 
          show={true}
          className={progressClassName}
        />
      )}
      
      {/* Critical loading overlay */}
      {showCriticalOverlay && hasCritical && (
        <CriticalLoadingOverlay 
          show={true}
          className={overlayClassName}
        >
          {criticalItems.length > 1 && (
            <div className="text-xs text-muted-foreground">
              {criticalItems.length} operations in progress
            </div>
          )}
        </CriticalLoadingOverlay>
      )}
    </>
  );

  // Use portal to render outside component tree
  return createPortal(indicator, container);
}

/**
 * Loading indicator that shows loading state for specific operations
 */
export function LoadingIndicator({
  loadingKey,
  showProgress = true,
  showOverlay = false,
  className,
  children
}: {
  loadingKey: string;
  showProgress?: boolean;
  showOverlay?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const { getLoadingByKey } = useGlobalLoading();
  const items = getLoadingByKey(loadingKey);
  const isLoading = items.length > 0;

  if (!isLoading) return null;

  const hasCritical = items.some(item => item.priority === 'critical');

  return (
    <>
      {showProgress && !hasCritical && (
        <LoadingProgressBar 
          show={true}
          className={className}
        />
      )}
      
      {showOverlay && hasCritical && (
        <CriticalLoadingOverlay 
          show={true}
          className={className}
        >
          {children}
        </CriticalLoadingOverlay>
      )}
    </>
  );
}

/**
 * Hook for managing loading indicators in components
 */
export function useLoadingIndicator(loadingKey: string) {
  const { getLoadingByKey } = useGlobalLoading();
  const items = getLoadingByKey(loadingKey);
  const isLoading = items.length > 0;
  const hasCritical = items.some(item => item.priority === 'critical');
  const hasHigh = items.some(item => item.priority === 'high');

  return {
    isLoading,
    hasCritical,
    hasHigh,
    items,
    shouldShowProgress: isLoading && !hasCritical,
    shouldShowOverlay: hasCritical
  };
}