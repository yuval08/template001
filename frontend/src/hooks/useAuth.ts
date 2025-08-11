// DEPRECATED: This implementation is deprecated. Please use useAuth.refactored.ts
// This file is kept for backward compatibility only.

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, logout } = useAuthStore();
  const [authConfig, setAuthConfig] = useState<{ googleEnabled: boolean; microsoftEnabled: boolean; allowedDomain?: string }>({ googleEnabled: true, microsoftEnabled: false });

  // Only fetch auth config, not user data (that's handled by AuthProvider)
  useEffect(() => {
    const fetchAuthConfig = async () => {
      try {
        const config = await authService.getAuthConfig();
        setAuthConfig(config);
      } catch (error) {
        console.error('Error fetching auth config:', error);
      }
    };

    fetchAuthConfig();
  }, []); // Only run once for config

  const login = async (provider: 'google' | 'microsoft' = 'google') => {
    try {
      await authService.login(provider);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      logout();
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const hasRole = (role: string): boolean => {
    return authService.hasRole(user, role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return authService.hasAnyRole(user, roles);
  };

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      return null;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    authConfig,
    login,
    signOut,
    hasRole,
    hasAnyRole,
    checkAuth,
  };
};