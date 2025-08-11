import { useEffect } from 'react';
import { authSelectors, authActions } from '@/stores';
import { authService } from '@/services/auth';

/**
 * Enhanced auth hook using refactored auth store
 * Provides authentication state and actions with proper separation of concerns
 */
export const useAuth = () => {
  const user = authSelectors.user();
  const isAuthenticated = authSelectors.isAuthenticated();
  const isLoading = authSelectors.isLoading();
  const error = authSelectors.error();
  const authConfig = authSelectors.authConfig();

  // Load auth config on mount if not already loaded
  useEffect(() => {
    if (!authConfig) {
      loadAuthConfig();
    }
  }, [authConfig]);

  const loadAuthConfig = async () => {
    try {
      const config = await authService.getAuthConfig();
      authActions.setAuthConfig(config);
    } catch (error) {
      console.error('Error fetching auth config:', error);
      authActions.setError('Failed to load authentication configuration');
    }
  };

  const login = async (provider: 'google' | 'microsoft' = 'google') => {
    try {
      authActions.setLoading(true);
      authActions.setError(null);
      await authService.login(provider);
    } catch (error) {
      console.error('Login error:', error);
      authActions.setError('Login failed. Please try again.');
      throw error;
    } finally {
      authActions.setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      authActions.setLoading(true);
      authActions.logout();
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      authActions.setError('Logout failed. Please try again.');
      throw error;
    } finally {
      authActions.setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      authActions.setLoading(true);
      authActions.setError(null);
      const currentUser = await authService.getUser();
      authActions.setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error('Auth check failed:', error);
      authActions.setUser(null);
      authActions.setError('Authentication check failed');
      return null;
    } finally {
      authActions.setLoading(false);
    }
  };

  const hasRole = (role: string): boolean => {
    return authService.hasRole(user, role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return authService.hasAnyRole(user, roles);
  };

  const clearError = () => {
    authActions.setError(null);
  };

  const refreshAuthConfig = () => {
    loadAuthConfig();
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    authConfig,
    
    // Actions
    login,
    signOut,
    checkAuth,
    clearError,
    refreshAuthConfig,
    
    // Utilities
    hasRole,
    hasAnyRole,
  };
};