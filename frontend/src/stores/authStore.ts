import { AuthUser } from '@/types';

// DEPRECATED: This file is deprecated. Please use the new store structure from @/stores
// This file is kept for backward compatibility only.

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

// Re-export the new auth store with backward compatibility
export { useAuthStore } from './core/auth.store';

// For components that still use the old interface, we maintain compatibility
// but recommend migrating to the new hooks and store structure