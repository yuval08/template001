import { StoreApi, UseBoundStore } from 'zustand';

/**
 * Utility for combining multiple stores into a single hook
 * Useful for components that need multiple store states
 */
export function combineStores<T extends Record<string, any>>(stores: T) {
  return () => {
    const result = {} as {
      [K in keyof T]: T[K] extends UseBoundStore<infer S> ? S : never;
    };

    for (const [key, store] of Object.entries(stores)) {
      if (typeof store === 'function') {
        result[key as keyof T] = store();
      }
    }

    return result;
  };
}

/**
 * Create a selector that combines multiple store states
 */
export function createCombinedSelector<TStores extends Record<string, any>, TResult>(
  stores: TStores,
  selector: (states: {
    [K in keyof TStores]: TStores[K] extends UseBoundStore<infer S> ? S : never;
  }) => TResult
) {
  return () => {
    const states = {} as {
      [K in keyof TStores]: TStores[K] extends UseBoundStore<infer S> ? S : never;
    };

    for (const [key, store] of Object.entries(stores)) {
      if (typeof store === 'function') {
        states[key as keyof TStores] = store();
      }
    }

    return selector(states);
  };
}

/**
 * Reset multiple stores at once
 */
export function resetStores(...stores: Array<{ reset?: () => void }>) {
  stores.forEach(store => {
    if (store && typeof store.reset === 'function') {
      store.reset();
    }
  });
}

/**
 * Subscribe to multiple stores and call callback when any changes
 */
export function subscribeToStores<T extends Record<string, UseBoundStore<any>>>(
  stores: T,
  callback: (states: {
    [K in keyof T]: T[K] extends UseBoundStore<infer S> ? S : never;
  }) => void
) {
  const unsubscribers: Array<() => void> = [];

  const getCurrentStates = () => {
    const states = {} as {
      [K in keyof T]: T[K] extends UseBoundStore<infer S> ? S : never;
    };

    for (const [key, store] of Object.entries(stores)) {
      states[key as keyof T] = store.getState();
    }

    return states;
  };

  // Subscribe to each store
  for (const [key, store] of Object.entries(stores)) {
    const unsubscribe = store.subscribe(() => {
      callback(getCurrentStates());
    });
    unsubscribers.push(unsubscribe);
  }

  // Return cleanup function
  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
}

/**
 * Create a derived state that depends on multiple stores
 */
export function createDerivedState<TStores extends Record<string, UseBoundStore<any>>, TResult>(
  stores: TStores,
  derive: (states: {
    [K in keyof TStores]: TStores[K] extends UseBoundStore<infer S> ? S : never;
  }) => TResult
) {
  return {
    get current() {
      const states = {} as {
        [K in keyof TStores]: TStores[K] extends UseBoundStore<infer S> ? S : never;
      };

      for (const [key, store] of Object.entries(stores)) {
        states[key as keyof TStores] = store.getState();
      }

      return derive(states);
    },
    
    subscribe(callback: (value: TResult) => void) {
      return subscribeToStores(stores, (states) => {
        callback(derive(states));
      });
    }
  };
}