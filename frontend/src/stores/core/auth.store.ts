import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { AuthStore } from '../types';
import { AuthUser } from '@/types';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  lastUpdated: null,
  authConfig: null,
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        setUser: (user: AuthUser | null) => set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        }),
        
        setLoading: (isLoading: boolean) => set({ isLoading }),
        
        setError: (error: string | null) => set({ error, isLoading: false }),
        
        setAuthConfig: (authConfig: AuthStore['authConfig']) => set({ 
          authConfig,
          lastUpdated: new Date(),
        }),
        
        logout: () => set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        }),

        reset: () => {
          set({ 
            ...initialState,
            lastUpdated: new Date(),
          }, true);
        },
      }),
      {
        name: 'auth-storage',
        version: 1,
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          authConfig: state.authConfig,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

// Selectors for better performance
export const authSelectors = {
  user: () => useAuthStore((state) => state.user),
  isAuthenticated: () => useAuthStore((state) => state.isAuthenticated),
  isLoading: () => useAuthStore((state) => state.isLoading),
  error: () => useAuthStore((state) => state.error),
  authConfig: () => useAuthStore((state) => state.authConfig),
  hasRole: (role: string) => useAuthStore((state) => 
    state.user?.role === role || state.user?.role === 'Admin'
  ),
  hasAnyRole: (roles: string[]) => useAuthStore((state) => 
    roles.includes(state.user?.role || '') || state.user?.role === 'Admin'
  ),
};

// Actions for external use
export const authActions = {
  setUser: (user: Parameters<AuthStore['setUser']>[0]) => useAuthStore.getState().setUser(user),
  setLoading: (loading: boolean) => useAuthStore.getState().setLoading(loading),
  setError: (error: string | null) => useAuthStore.getState().setError(error),
  setAuthConfig: (config: Parameters<AuthStore['setAuthConfig']>[0]) => useAuthStore.getState().setAuthConfig(config),
  logout: () => useAuthStore.getState().logout(),
  reset: () => useAuthStore.getState().reset(),
};