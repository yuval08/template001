import { act } from '@testing-library/react';
import { useAuthStore, authActions, authSelectors } from '../core/auth.store';
import { StoreTestUtils, PersistentStoreTestUtils } from '../utils/store-testing';
import { AuthUser } from '@/types';

// Setup test utilities
const authStoreTest = StoreTestUtils.createStoreTest(useAuthStore);
const { mockLocalStorage } = PersistentStoreTestUtils;

describe('Auth Store', () => {
  let mockStorage: ReturnType<typeof mockLocalStorage>;

  beforeEach(() => {
    mockStorage = mockLocalStorage();
    authStoreTest.resetStore();
  });

  afterEach(() => {
    mockStorage.clearStorage();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = authStoreTest.renderStore();
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.authConfig).toBeNull();
    });
  });

  describe('User Management', () => {
    const mockUser: AuthUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      fullName: 'Test User',
      role: 'User',
      isAuthenticated: true,
      isActive: true,
    };

    it('should set user correctly', () => {
      const { result } = authStoreTest.renderStore();
      
      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should clear user on logout', () => {
      const { result } = authStoreTest.renderStore();
      
      // Set user first
      act(() => {
        result.current.setUser(mockUser);
      });

      // Then logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should set null user when provided null', () => {
      const { result } = authStoreTest.renderStore();
      
      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Loading State', () => {
    it('should set loading state', () => {
      const { result } = authStoreTest.renderStore();
      
      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
      
      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should set and clear errors', () => {
      const { result } = authStoreTest.renderStore();
      const errorMessage = 'Authentication failed';
      
      act(() => {
        result.current.setError(errorMessage);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
      
      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Auth Config', () => {
    const mockAuthConfig = {
      googleEnabled: true,
      microsoftEnabled: false,
      allowedDomain: 'example.com',
    };

    it('should set auth config', () => {
      const { result } = authStoreTest.renderStore();
      
      act(() => {
        result.current.setAuthConfig(mockAuthConfig);
      });

      expect(result.current.authConfig).toEqual(mockAuthConfig);
    });
  });

  describe('Selectors', () => {
    const mockUser: AuthUser = {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      fullName: 'Admin User',
      role: 'Admin',
      isAuthenticated: true,
      isActive: true,
    };

    beforeEach(() => {
      authStoreTest.mockState({ user: mockUser, isAuthenticated: true });
    });

    it('should check user role correctly', () => {
      expect(authSelectors.hasRole('Admin')()).toBe(true);
      expect(authSelectors.hasRole('User')()).toBe(true); // Admin has all roles
      expect(authSelectors.hasRole('Manager')()).toBe(true);
    });

    it('should check any role correctly', () => {
      expect(authSelectors.hasAnyRole(['User', 'Manager'])()).toBe(true);
      expect(authSelectors.hasAnyRole(['Guest'])()).toBe(true); // Admin has all roles
    });
  });

  describe('Actions', () => {
    const mockUser: AuthUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      fullName: 'Test User',
      role: 'User',
      isAuthenticated: true,
      isActive: true,
    };

    it('should call actions correctly', () => {
      authActions.setUser(mockUser);
      expect(authSelectors.user()).toEqual(mockUser);

      authActions.setLoading(false);
      expect(authSelectors.isLoading()).toBe(false);

      authActions.setError('Test error');
      expect(authSelectors.error()).toBe('Test error');

      authActions.logout();
      expect(authSelectors.user()).toBeNull();
      expect(authSelectors.isAuthenticated()).toBe(false);
    });
  });

  describe('Persistence', () => {
    const mockUser: AuthUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      fullName: 'Test User',
      role: 'User',
      isAuthenticated: true,
      isActive: true,
    };

    it('should persist user data', () => {
      authActions.setUser(mockUser);
      
      PersistentStoreTestUtils.expectPersisted('auth-storage', {
        user: mockUser,
        isAuthenticated: true,
      });
    });

    it('should not persist loading state', () => {
      authActions.setLoading(true);
      
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.isLoading).toBeUndefined();
      }
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to initial state', () => {
      const { result } = authStoreTest.renderStore();
      const mockUser: AuthUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
        role: 'User',
        isAuthenticated: true,
        isActive: true,
      };
      
      // Set some state
      act(() => {
        result.current.setUser(mockUser);
        result.current.setError('Some error');
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });
});