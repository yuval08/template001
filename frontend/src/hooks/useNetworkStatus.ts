import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  lastOnlineAt: Date | null;
  lastOfflineAt: Date | null;
}

interface NetworkInformation extends EventTarget {
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  type?: string;
  addEventListener(type: 'change', listener: () => void): void;
  removeEventListener(type: 'change', listener: () => void): void;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
}

/**
 * Hook for monitoring network connectivity status and connection quality
 * Provides comprehensive network information including connection type, speed, and latency
 */
export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(() => ({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: null,
    effectiveType: null,
    downlink: null,
    rtt: null,
    lastOnlineAt: navigator.onLine ? new Date() : null,
    lastOfflineAt: navigator.onLine ? null : new Date(),
  }));

  // Get network connection information
  const getConnectionInfo = useCallback((): Partial<NetworkStatus> => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (!connection) {
      return {
        connectionType: null,
        effectiveType: null,
        downlink: null,
        rtt: null,
        isSlowConnection: false,
      };
    }

    const isSlowConnection = 
      connection.effectiveType === 'slow-2g' || 
      connection.effectiveType === '2g' ||
      (connection.downlink !== undefined && connection.downlink < 1) ||
      (connection.rtt !== undefined && connection.rtt > 2000);

    return {
      connectionType: connection.type || null,
      effectiveType: connection.effectiveType || null,
      downlink: connection.downlink || null,
      rtt: connection.rtt || null,
      isSlowConnection,
    };
  }, []);

  // Update network status
  const updateNetworkStatus = useCallback((isOnline: boolean) => {
    const connectionInfo = getConnectionInfo();
    const now = new Date();

    setNetworkStatus(prev => ({
      ...prev,
      isOnline,
      ...connectionInfo,
      lastOnlineAt: isOnline ? now : prev.lastOnlineAt,
      lastOfflineAt: isOnline ? prev.lastOfflineAt : now,
    }));
  }, [getConnectionInfo]);

  // Handle online event
  const handleOnline = useCallback(() => {
    updateNetworkStatus(true);
    console.log('🟢 Network: Back online');
  }, [updateNetworkStatus]);

  // Handle offline event
  const handleOffline = useCallback(() => {
    updateNetworkStatus(false);
    console.log('🔴 Network: Gone offline');
  }, [updateNetworkStatus]);

  // Handle connection change
  const handleConnectionChange = useCallback(() => {
    const connectionInfo = getConnectionInfo();
    setNetworkStatus(prev => ({
      ...prev,
      ...connectionInfo,
    }));
    
    console.log('📡 Network: Connection changed', connectionInfo);
  }, [getConnectionInfo]);

  // Ping test to verify actual connectivity
  const performConnectivityTest = useCallback(async (): Promise<boolean> => {
    if (!navigator.onLine) {
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('Network connectivity test failed:', error);
      return false;
    }
  }, []);

  // Enhanced connectivity verification
  const verifyConnectivity = useCallback(async () => {
    const actuallyOnline = await performConnectivityTest();
    
    if (networkStatus.isOnline !== actuallyOnline) {
      console.log(`🔄 Network: Status corrected - ${actuallyOnline ? 'online' : 'offline'}`);
      updateNetworkStatus(actuallyOnline);
    }
  }, [networkStatus.isOnline, performConnectivityTest, updateNetworkStatus]);

  // Setup event listeners and initial state
  useEffect(() => {
    // Update initial state with connection info
    updateNetworkStatus(navigator.onLine);

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Periodic connectivity verification (every 30 seconds)
    const intervalId = setInterval(verifyConnectivity, 30000);

    // Cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
      
      clearInterval(intervalId);
    };
  }, [handleOnline, handleOffline, handleConnectionChange, verifyConnectivity, updateNetworkStatus]);

  // Manual connectivity check
  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    const isConnected = await performConnectivityTest();
    updateNetworkStatus(isConnected);
    return isConnected;
  }, [performConnectivityTest, updateNetworkStatus]);

  // Get human-readable connection description
  const getConnectionDescription = useCallback((): string => {
    if (!networkStatus.isOnline) {
      return 'Offline';
    }

    if (networkStatus.isSlowConnection) {
      return 'Slow connection';
    }

    if (networkStatus.effectiveType) {
      switch (networkStatus.effectiveType) {
        case 'slow-2g':
          return 'Very slow (2G)';
        case '2g':
          return 'Slow (2G)';
        case '3g':
          return 'Good (3G)';
        case '4g':
          return 'Fast (4G)';
        default:
          return 'Online';
      }
    }

    return 'Online';
  }, [networkStatus]);

  return {
    ...networkStatus,
    checkConnectivity,
    getConnectionDescription,
  };
};