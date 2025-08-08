import { devtools as zustandDevtools } from 'zustand/middleware';
import type { StateCreator } from 'zustand';

export interface DevtoolsConfig {
  name: string;
  enabled?: boolean;
}

export const devtools = <T>(config: DevtoolsConfig) => 
  (createState: StateCreator<T, [], [], T>) =>
    config.enabled !== false 
      ? zustandDevtools(createState, { name: config.name })
      : createState;