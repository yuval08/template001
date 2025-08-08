import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const user = await authService.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setUser, setLoading]);

  const login = async () => {
    try {
      await authService.signinRedirect();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleCallback = async () => {
    try {
      setLoading(true);
      const user = await authService.signinCallback();
      setUser(user);
      return user;
    } catch (error) {
      console.error('Callback error:', error);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      logout();
      await authService.signoutRedirect();
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

  const refreshToken = async () => {
    try {
      const refreshedUser = await authService.renewToken();
      setUser(refreshedUser);
      return refreshedUser;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      throw error;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    signOut,
    handleCallback,
    hasRole,
    hasAnyRole,
    refreshToken,
  };
};