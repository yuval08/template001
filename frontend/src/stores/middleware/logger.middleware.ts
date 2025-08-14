export interface LoggerConfig {
  enabled?: boolean;
  name?: string;
  collapsed?: boolean;
}

export const logger = <T>(config: LoggerConfig = {}) => 
  (createState: (...args: any[]) => T) =>
  (set: any, get: any, api: any): T => {
    const loggedSet = (...args: any[]) => {
      if (config.enabled && typeof window !== 'undefined') {
        const prevState = get();
        set(...args);
        const nextState = get();
        
        const groupName = `${config.name || 'Store'} Update`;
        const groupMethod = config.collapsed ? console.groupCollapsed : console.group;
        
        groupMethod(`%c${groupName}`, 'color: #10b981; font-weight: bold');
        console.log('%cPrevious State', 'color: #6b7280; font-weight: bold', prevState);
        console.log('%cNext State', 'color: #2563eb; font-weight: bold', nextState);
        console.log('%cAction', 'color: #f59e0b; font-weight: bold', args[0]);
        console.groupEnd();
      } else {
        set(...args);
      }
    };

    return createState(loggedSet, get, api);
  };