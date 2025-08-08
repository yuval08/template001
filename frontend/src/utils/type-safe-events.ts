/**
 * Type-safe event emitter and event handling utilities
 */

import type { TypeGuard } from '@/shared/types/utility-types';
import { isFunction, isString, isNonNullable } from '@/shared/types/type-guards';

/**
 * Event handler function type
 */
export type EventHandler<T = unknown> = (data: T) => void | Promise<void>;

/**
 * Event listener configuration
 */
export interface EventListenerConfig {
  once?: boolean;
  passive?: boolean;
  priority?: number;
}

/**
 * Event subscription interface
 */
export interface EventSubscription {
  unsubscribe(): void;
  isActive(): boolean;
}

/**
 * Event emitter options
 */
export interface EventEmitterOptions {
  maxListeners?: number;
  captureErrors?: boolean;
  errorHandler?: (error: Error, event: string, data?: unknown) => void;
}

/**
 * Type-safe event emitter class
 */
export class TypeSafeEventEmitter<TEventMap extends Record<string, unknown>> {
  private readonly listeners = new Map<keyof TEventMap, Set<EventListenerEntry>>();
  private readonly options: Required<EventEmitterOptions>;
  private destroyed = false;

  constructor(options: EventEmitterOptions = {}) {
    this.options = {
      maxListeners: options.maxListeners ?? 100,
      captureErrors: options.captureErrors ?? true,
      errorHandler: options.errorHandler ?? this.defaultErrorHandler,
    };
  }

  /**
   * Add event listener with type safety
   */
  on<K extends keyof TEventMap>(
    event: K,
    handler: EventHandler<TEventMap[K]>,
    config: EventListenerConfig = {}
  ): EventSubscription {
    this.assertNotDestroyed();
    this.validateEventName(event);
    this.validateHandler(handler);

    const listenerSet = this.getOrCreateListenerSet(event);
    
    // Check max listeners limit
    if (listenerSet.size >= this.options.maxListeners) {
      throw new Error(
        `Maximum number of listeners (${this.options.maxListeners}) exceeded for event: ${String(event)}`
      );
    }

    const entry: EventListenerEntry = {
      handler: handler as EventHandler<unknown>,
      config: { ...config },
      priority: config.priority ?? 0,
      active: true,
    };

    listenerSet.add(entry);
    this.sortListenersByPriority(listenerSet);

    return {
      unsubscribe: () => this.removeListener(event, entry),
      isActive: () => entry.active,
    };
  }

  /**
   * Add one-time event listener
   */
  once<K extends keyof TEventMap>(
    event: K,
    handler: EventHandler<TEventMap[K]>,
    config: Omit<EventListenerConfig, 'once'> = {}
  ): EventSubscription {
    return this.on(event, handler, { ...config, once: true });
  }

  /**
   * Remove specific event listener
   */
  off<K extends keyof TEventMap>(
    event: K,
    handler: EventHandler<TEventMap[K]>
  ): boolean {
    this.assertNotDestroyed();
    
    const listenerSet = this.listeners.get(event);
    if (!listenerSet) return false;

    for (const entry of listenerSet) {
      if (entry.handler === handler) {
        return this.removeListener(event, entry);
      }
    }

    return false;
  }

  /**
   * Emit event to all listeners
   */
  async emit<K extends keyof TEventMap>(
    event: K,
    data: TEventMap[K]
  ): Promise<void> {
    this.assertNotDestroyed();
    this.validateEventName(event);

    const listenerSet = this.listeners.get(event);
    if (!listenerSet || listenerSet.size === 0) return;

    const listeners = Array.from(listenerSet).filter(entry => entry.active);
    const promises: Promise<void>[] = [];

    for (const entry of listeners) {
      try {
        const result = entry.handler(data);
        
        if (result instanceof Promise) {
          promises.push(result);
        }

        // Remove one-time listeners
        if (entry.config.once) {
          this.removeListener(event, entry);
        }
      } catch (error) {
        this.handleError(error as Error, String(event), data);
      }
    }

    // Wait for all async handlers to complete
    if (promises.length > 0) {
      await Promise.allSettled(promises).then(results => {
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            this.handleError(result.reason, String(event), data);
          }
        });
      });
    }
  }

  /**
   * Emit event synchronously (non-async handlers only)
   */
  emitSync<K extends keyof TEventMap>(
    event: K,
    data: TEventMap[K]
  ): void {
    this.assertNotDestroyed();
    this.validateEventName(event);

    const listenerSet = this.listeners.get(event);
    if (!listenerSet || listenerSet.size === 0) return;

    const listeners = Array.from(listenerSet).filter(entry => entry.active);

    for (const entry of listeners) {
      try {
        const result = entry.handler(data);
        
        if (result instanceof Promise) {
          console.warn(
            `Async handler detected in emitSync for event: ${String(event)}. ` +
            'Consider using emit() for async handlers.'
          );
        }

        // Remove one-time listeners
        if (entry.config.once) {
          this.removeListener(event, entry);
        }
      } catch (error) {
        this.handleError(error as Error, String(event), data);
      }
    }
  }

  /**
   * Get the number of listeners for an event
   */
  listenerCount<K extends keyof TEventMap>(event: K): number {
    const listenerSet = this.listeners.get(event);
    return listenerSet ? Array.from(listenerSet).filter(entry => entry.active).length : 0;
  }

  /**
   * Get all event names that have listeners
   */
  eventNames(): (keyof TEventMap)[] {
    return Array.from(this.listeners.keys()).filter(event => 
      this.listenerCount(event) > 0
    );
  }

  /**
   * Remove all listeners for a specific event
   */
  removeAllListeners<K extends keyof TEventMap>(event?: K): void {
    this.assertNotDestroyed();
    
    if (event !== undefined) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Check if there are any listeners for an event
   */
  hasListeners<K extends keyof TEventMap>(event: K): boolean {
    return this.listenerCount(event) > 0;
  }

  /**
   * Create a promise that resolves when an event is emitted
   */
  waitFor<K extends keyof TEventMap>(
    event: K,
    timeout?: number
  ): Promise<TEventMap[K]> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined;
      
      const subscription = this.once(event, (data) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve(data);
      });

      if (timeout !== undefined && timeout > 0) {
        timeoutId = setTimeout(() => {
          subscription.unsubscribe();
          reject(new Error(`Timeout waiting for event: ${String(event)}`));
        }, timeout);
      }
    });
  }

  /**
   * Destroy the event emitter
   */
  destroy(): void {
    this.listeners.clear();
    this.destroyed = true;
  }

  /**
   * Check if the event emitter is destroyed
   */
  isDestroyed(): boolean {
    return this.destroyed;
  }

  // Private methods
  private getOrCreateListenerSet<K extends keyof TEventMap>(
    event: K
  ): Set<EventListenerEntry> {
    let listenerSet = this.listeners.get(event);
    if (!listenerSet) {
      listenerSet = new Set();
      this.listeners.set(event, listenerSet);
    }
    return listenerSet;
  }

  private removeListener<K extends keyof TEventMap>(
    event: K,
    entry: EventListenerEntry
  ): boolean {
    const listenerSet = this.listeners.get(event);
    if (!listenerSet) return false;

    entry.active = false;
    const removed = listenerSet.delete(entry);
    
    if (listenerSet.size === 0) {
      this.listeners.delete(event);
    }

    return removed;
  }

  private sortListenersByPriority(listenerSet: Set<EventListenerEntry>): void {
    const entries = Array.from(listenerSet);
    entries.sort((a, b) => b.priority - a.priority);
    
    listenerSet.clear();
    entries.forEach(entry => listenerSet.add(entry));
  }

  private handleError(error: Error, event: string, data?: unknown): void {
    if (this.options.captureErrors) {
      this.options.errorHandler(error, event, data);
    } else {
      throw error;
    }
  }

  private defaultErrorHandler = (error: Error, event: string, data?: unknown): void => {
    console.error(`EventEmitter error in event "${event}":`, error, data);
  };

  private assertNotDestroyed(): void {
    if (this.destroyed) {
      throw new Error('EventEmitter has been destroyed');
    }
  }

  private validateEventName(event: keyof TEventMap): void {
    if (!isString(event) && typeof event !== 'symbol') {
      throw new Error('Event name must be a string or symbol');
    }
  }

  private validateHandler(handler: unknown): void {
    if (!isFunction(handler)) {
      throw new Error('Event handler must be a function');
    }
  }
}

/**
 * Internal event listener entry
 */
interface EventListenerEntry {
  handler: EventHandler;
  config: EventListenerConfig;
  priority: number;
  active: boolean;
}

/**
 * Global application events
 */
export interface AppEvents extends Record<string, unknown> {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string; timestamp: number };
  'theme:changed': { theme: 'light' | 'dark' | 'system' };
  'error:occurred': { error: Error; context?: string };
  'navigation:changed': { path: string; previousPath?: string };
  'notification:received': { id: string; type: string; message: string };
  'project:created': { projectId: string; name: string };
  'project:updated': { projectId: string; changes: Record<string, unknown> };
  'file:uploaded': { fileId: string; name: string; size: number };
  'connection:status': { connected: boolean; reason?: string };
}

/**
 * Global application event emitter instance
 */
export const appEvents = new TypeSafeEventEmitter<AppEvents>({
  maxListeners: 200,
  captureErrors: true,
  errorHandler: (error, event, data) => {
    console.error(`App event error [${event}]:`, error);
    
    // Report to error tracking service in production
    if (import.meta.env.PROD) {
      // Integration with error tracking would go here
      console.error('Event error details:', { event, data, error: error.message });
    }
  },
});

/**
 * Type-safe DOM event helpers
 */
export class TypeSafeDOMEvents {
  private readonly subscriptions = new Set<() => void>();
  
  /**
   * Add typed DOM event listener
   */
  addEventListener<K extends keyof WindowEventMap>(
    target: Window,
    event: K,
    handler: (event: WindowEventMap[K]) => void,
    options?: AddEventListenerOptions
  ): () => void;
  addEventListener<K extends keyof DocumentEventMap>(
    target: Document,
    event: K,
    handler: (event: DocumentEventMap[K]) => void,
    options?: AddEventListenerOptions
  ): () => void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    event: K,
    handler: (event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions
  ): () => void;
  addEventListener(
    target: EventTarget,
    event: string,
    handler: (event: Event) => void,
    options?: AddEventListenerOptions
  ): () => void {
    target.addEventListener(event, handler, options);
    
    const cleanup = () => {
      target.removeEventListener(event, handler, options);
      this.subscriptions.delete(cleanup);
    };
    
    this.subscriptions.add(cleanup);
    return cleanup;
  }

  /**
   * Clean up all DOM event listeners
   */
  cleanup(): void {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
  }
}

/**
 * Create a type-safe event emitter for custom events
 */
export function createEventEmitter<T extends Record<string, unknown>>(
  options?: EventEmitterOptions
): TypeSafeEventEmitter<T> {
  return new TypeSafeEventEmitter<T>(options);
}

/**
 * Hook for React components to handle DOM events safely
 */
export function createDOMEventManager(): TypeSafeDOMEvents {
  return new TypeSafeDOMEvents();
}

/**
 * Debounced event emitter wrapper
 */
export function createDebouncedEmitter<T extends Record<string, unknown>>(
  emitter: TypeSafeEventEmitter<T>,
  delay: number = 300
) {
  const timeouts = new Map<keyof T, NodeJS.Timeout>();

  return {
    emit<K extends keyof T>(event: K, data: T[K]): void {
      const existingTimeout = timeouts.get(event);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      const timeout = setTimeout(() => {
        emitter.emit(event, data);
        timeouts.delete(event);
      }, delay);

      timeouts.set(event, timeout);
    },
    
    emitImmediate<K extends keyof T>(event: K, data: T[K]): void {
      const existingTimeout = timeouts.get(event);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        timeouts.delete(event);
      }
      emitter.emit(event, data);
    },

    cleanup(): void {
      timeouts.forEach(timeout => clearTimeout(timeout));
      timeouts.clear();
    },
  };
}