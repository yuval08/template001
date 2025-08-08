import React, { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Check if user is already authenticated - ONLY ONCE
        const currentUser = await authService.getUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Only initialize once on app load
    initializeAuth();
  }, []); // Empty dependency array - runs once

  return <>{children}</>;
};