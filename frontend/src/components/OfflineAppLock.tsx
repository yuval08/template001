import React, { useState, useEffect } from 'react';
import { 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  Clock,
  Settings
} from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

interface OfflineAppLockProps {
  /**
   * Time in milliseconds before showing the lock screen
   * Default: 5000ms (5 seconds)
   */
  lockDelay?: number;
  
  /**
   * Whether to allow partial functionality in offline mode
   * If true, shows "Continue in offline mode" option
   */
  allowOfflineMode?: boolean;
  
  /**
   * Custom message to display when offline
   */
  customMessage?: string;
  
  /**
   * Callback when user chooses to continue offline
   */
  onContinueOffline?: () => void;
  
  /**
   * Additional actions to retry when coming back online
   */
  onRetryActions?: () => Promise<void>;
}

export const OfflineAppLock: React.FC<OfflineAppLockProps> = ({
  lockDelay = 5000,
  allowOfflineMode = false,
  customMessage,
  onContinueOffline,
  onRetryActions,
}) => {
  const { 
    isOnline, 
    checkConnectivity, 
    lastOfflineAt,
    getConnectionDescription 
  } = useNetworkStatus();
  
  const [showLock, setShowLock] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isInOfflineMode, setIsInOfflineMode] = useState(false);
  const [offlineDuration, setOfflineDuration] = useState<string>('');

  // Calculate offline duration
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (!isOnline && lastOfflineAt) {
      interval = setInterval(() => {
        const now = new Date();
        const diffMs = now.getTime() - lastOfflineAt.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffSeconds = Math.floor((diffMs % 60000) / 1000);
        
        if (diffMinutes > 0) {
          setOfflineDuration(`${diffMinutes}m ${diffSeconds}s`);
        } else {
          setOfflineDuration(`${diffSeconds}s`);
        }
      }, 1000);
    } else {
      setOfflineDuration('');
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isOnline, lastOfflineAt]);

  // Show lock screen after delay when going offline
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (!isOnline && !isInOfflineMode) {
      timeoutId = setTimeout(() => {
        setShowLock(true);
      }, lockDelay);
    } else if (isOnline) {
      setShowLock(false);
      setIsInOfflineMode(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isOnline, lockDelay, isInOfflineMode]);

  // Handle retry connection
  const handleRetry = async () => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    try {
      const connected = await checkConnectivity();
      
      if (connected && onRetryActions) {
        await onRetryActions();
      }
    } catch (error) {
      console.error('Error during retry:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  // Handle continue in offline mode
  const handleContinueOffline = () => {
    setIsInOfflineMode(true);
    setShowLock(false);
    onContinueOffline?.();
  };

  // Don't render if online or not showing lock
  if (isOnline || !showLock) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <WifiOff className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            <CardTitle className="text-xl">Connection Lost</CardTitle>
            <CardDescription>
              {customMessage || "You've lost internet connection. Some features are unavailable."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Information */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="destructive">{getConnectionDescription()}</Badge>
              </div>
              
              {offlineDuration && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Offline for:</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span>{offlineDuration}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Checking Connection...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </>
                )}
              </Button>

              {allowOfflineMode && (
                <Button 
                  variant="outline" 
                  onClick={handleContinueOffline}
                  className="w-full"
                >
                  Continue Offline
                </Button>
              )}
            </div>

            {/* Offline Mode Warning */}
            {allowOfflineMode && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      Limited functionality
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                      In offline mode, you can only view cached data. 
                      Changes won't be saved until connection is restored.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Troubleshooting tips:</p>
              <ul className="ml-4 space-y-1 list-disc">
                <li>Check your WiFi or mobile data connection</li>
                <li>Try moving to a location with better signal</li>
                <li>Restart your router or modem if using WiFi</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Hook to control app locking behavior
export const useOfflineAppLock = (options: {
  enabled?: boolean;
  lockDelay?: number;
  allowOfflineMode?: boolean;
} = {}) => {
  const { 
    enabled = true, 
    lockDelay = 5000, 
    allowOfflineMode = false 
  } = options;
  
  const { isOnline } = useNetworkStatus();
  const [isLocked, setIsLocked] = useState(false);
  const [isInOfflineMode, setIsInOfflineMode] = useState(false);

  // Handle app locking
  useEffect(() => {
    if (!enabled) return;

    let timeoutId: NodeJS.Timeout;
    
    if (!isOnline && !isInOfflineMode) {
      timeoutId = setTimeout(() => {
        setIsLocked(true);
      }, lockDelay);
    } else if (isOnline) {
      setIsLocked(false);
      setIsInOfflineMode(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isOnline, enabled, lockDelay, isInOfflineMode]);

  const continueOffline = () => {
    if (allowOfflineMode) {
      setIsInOfflineMode(true);
      setIsLocked(false);
    }
  };

  const unlock = () => {
    setIsLocked(false);
  };

  return {
    isLocked: enabled && isLocked,
    isInOfflineMode,
    continueOffline,
    unlock,
  };
};