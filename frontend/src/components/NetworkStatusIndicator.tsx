import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Signal, 
  SignalLow, 
  SignalMedium, 
  SignalHigh,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NetworkStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
  showRetryButton?: boolean;
  onRetry?: () => void;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  className,
  showDetails = false,
  showRetryButton = false,
  onRetry,
}) => {
  const { 
    isOnline, 
    isSlowConnection, 
    effectiveType, 
    getConnectionDescription,
    checkConnectivity
  } = useNetworkStatus();
  
  const [isChecking, setIsChecking] = useState(false);

  // Get appropriate icon based on connection status
  const getConnectionIcon = () => {
    if (!isOnline) {
      return WifiOff;
    }

    if (isSlowConnection) {
      return SignalLow;
    }

    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return SignalLow;
      case '3g':
        return SignalMedium;
      case '4g':
        return SignalHigh;
      default:
        return Wifi;
    }
  };

  // Get color classes based on connection status
  const getStatusColors = () => {
    if (!isOnline) {
      return {
        icon: 'text-red-500',
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      };
    }

    if (isSlowConnection) {
      return {
        icon: 'text-yellow-500',
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      };
    }

    return {
      icon: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };
  };

  const ConnectionIcon = getConnectionIcon();
  const statusColors = getStatusColors();
  const description = getConnectionDescription();

  // Handle manual connectivity check
  const handleCheckConnectivity = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      await checkConnectivity();
      if (onRetry) {
        onRetry();
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Compact indicator (just icon with tooltip)
  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full transition-colors',
              statusColors.bg,
              statusColors.border,
              'border',
              className
            )}>
              <ConnectionIcon className={cn('w-4 h-4', statusColors.icon)} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-medium">{description}</p>
              {isOnline && effectiveType && (
                <p className="text-xs text-muted-foreground mt-1">
                  Connection: {effectiveType.toUpperCase()}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed indicator with status text and optional retry button
  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
      statusColors.bg,
      statusColors.border,
      className
    )}>
      <ConnectionIcon className={cn('w-4 h-4', statusColors.icon)} />
      
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className={statusColors.badge}>
          {description}
        </Badge>
        
        {showRetryButton && !isOnline && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCheckConnectivity}
            disabled={isChecking}
            className="h-6 px-2 text-xs"
          >
            {isChecking ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              'Retry'
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

// Network status banner for critical offline states
export const NetworkStatusBanner: React.FC<{
  onRetry?: () => void;
  onDismiss?: () => void;
}> = ({ onRetry, onDismiss }) => {
  const { isOnline, checkConnectivity } = useNetworkStatus();
  const [isChecking, setIsChecking] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Reset dismissal when coming back online
  useEffect(() => {
    if (isOnline) {
      setIsDismissed(false);
    }
  }, [isOnline]);

  // Handle retry action
  const handleRetry = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      const connected = await checkConnectivity();
      if (connected && onRetry) {
        onRetry();
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Handle dismissal
  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  // Don't show banner if online or dismissed
  if (isOnline || isDismissed) {
    return null;
  }

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                You're currently offline
              </p>
              <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                Some features may not work properly. Check your internet connection.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isChecking}
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              {isChecking ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-1" />
              )}
              Retry
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};