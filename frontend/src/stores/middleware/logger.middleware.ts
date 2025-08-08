import { StateCreator } from 'zustand';

export interface LoggerConfig {
  enabled?: boolean;
  name?: string;
  collapsed?: boolean;
}

export const logger = <T>(config: LoggerConfig = {}) => 
  (createState: StateCreator<T, [], [], T>): StateCreator<T, [], [], T> =>
  (set, get, api) => {
    const loggedSet: typeof set = (...args) => {
      if (config.enabled && typeof window !== 'undefined') {
        const prevState = get();
        set(...args);
        const nextState = get();
        
        const groupName = `${config.name || 'Store'} Update`;
        const groupMethod = config.collapsed ? console.groupCollapsed : console.group;
        
        groupMethod(`%c${groupName}`, 'color: #10b981; font-weight: bold');
        console.log('%cPrevious State', 'color: #6b7280; font-weight: bold', prevState);
        console.log('%cNext State', 'color: #3b82f6; font-weight: bold', nextState);
        console.log('%cAction', 'color: #8b5cf6; font-weight: bold', args[0]);
        console.groupEnd();
      } else {
        set(...args);
      }
    };

    return createState(loggedSet, get, api);
  };