import { act, renderHook } from '@testing-library/react';
import { StoreApi, UseBoundStore } from 'zustand';

/**
 * Utility for testing Zustand stores
 */
export class StoreTestUtils {
  /**
   * Create a test wrapper for a store hook
   */
  static createStoreTest<T>(useStore: UseBoundStore<StoreApi<T>>) {
    return {
      /**
       * Render the hook and return utilities for testing
       */
      renderStore: () => {
        const { result, rerender } = renderHook(() => useStore());
        
        return {
          result,
          rerender,
          getState: () => result.current,
          setState: (partial: Partial<T>) => {
            act(() => {
              useStore.setState(partial);
            });
          },
          subscribe: (callback: (state: T) => void) => useStore.subscribe(callback),
          destroy: () => useStore.destroy(),
        };
      },

      /**
       * Reset store to initial state for testing
       */
      resetStore: () => {
        act(() => {
          const store = useStore as any;
          if (store.getState().reset) {
            store.getState().reset();
          } else {
            // Fallback: Clear all state
            useStore.setState({} as any, true);
          }
        });
      },

      /**
       * Mock store state for testing
       */
      mockState: (mockState: Partial<T>) => {
        act(() => {
          useStore.setState(mockState as any, true);
        });
      },

      /**
       * Wait for store state to match condition
       */
      waitFor: async (condition: (state: T) => boolean, timeout = 5000) => {
        return new Promise<T>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            unsubscribe();
            reject(new Error(`Timeout waiting for store condition after ${timeout}ms`));
          }, timeout);

          const unsubscribe = useStore.subscribe((state) => {
            if (condition(state)) {
              clearTimeout(timeoutId);
              unsubscribe();
              resolve(state);
            }
          });

          // Check initial state
          const initialState = useStore.getState();
          if (condition(initialState)) {
            clearTimeout(timeoutId);
            unsubscribe();
            resolve(initialState);
          }
        });
      },
    };
  }

  /**
   * Create mock implementations for store actions
   */
  static createActionMocks<T extends Record<string, (...args: any[]) => any>>(
    actions: T
  ): { [K in keyof T]: jest.MockedFunction<T[K]> } {
    const mocks = {} as any;
    
    for (const [key, action] of Object.entries(actions)) {
      mocks[key] = jest.fn(action);
    }
    
    return mocks;
  }

  /**
   * Verify that store actions were called with expected arguments
   */
  static expectActionCalled<T extends Record<string, jest.MockedFunction<any>>>(
    mocks: T,
    actionName: keyof T,
    ...expectedArgs: Parameters<T[typeof actionName]>
  ) {
    const mock = mocks[actionName];
    expect(mock).toHaveBeenCalledWith(...expectedArgs);
  }

  /**
   * Reset all action mocks
   */
  static resetActionMocks<T extends Record<string, jest.MockedFunction<any>>>(mocks: T) {
    Object.values(mocks).forEach(mock => {
      if (jest.isMockFunction(mock)) {
        mock.mockClear();
      }
    });
  }
}

/**
 * Test helper for stores with persistence
 */
export class PersistentStoreTestUtils {
  /**
   * Mock localStorage for testing persistent stores
   */
  static mockLocalStorage() {
    const store: Record<string, string> = {};

    const localStorageMock = {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach(key => delete store[key]);
      }),
      get length() {
        return Object.keys(store).length;
      },
      key: jest.fn((index: number) => Object.keys(store)[index] || null),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    return {
      localStorage: localStorageMock,
      clearStorage: () => localStorageMock.clear(),
      getStorageData: () => ({ ...store }),
    };
  }

  /**
   * Verify that data is persisted correctly
   */
  static expectPersisted(key: string, expectedData: any) {
    const stored = localStorage.getItem(key);
    expect(stored).toBeTruthy();
    
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.state).toEqual(expectedData);
    }
  }
}