import { StateCreator } from 'zustand';
import { PersistOptions, persist as zustandPersist } from 'zustand/middleware';

export interface PersistConfig<T> extends Partial<PersistOptions<T>> {
  name: string;
  version?: number;
  migrate?: (persistedState: unknown, version: number) => T;
  onRehydrateStorage?: (state: T) => ((state?: T, error?: unknown) => void) | void;
}

export const persistence = <T>(config: PersistConfig<T>) => 
  (createState: StateCreator<T, [], [], T>) =>
    zustandPersist<T>(createState, config as PersistOptions<T>);