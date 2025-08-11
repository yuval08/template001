import { devtools as zustandDevtools } from 'zustand/middleware';

export interface DevtoolsConfig {
  name: string;
  enabled?: boolean;
}

export const devtools = <T>(config: DevtoolsConfig) => 
  (createState: (...args: any[]) => T) =>
    config.enabled !== false 
      ? zustandDevtools(createState, { name: config.name })
      : createState;