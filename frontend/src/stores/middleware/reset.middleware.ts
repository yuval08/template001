import { StateCreator } from 'zustand';

export interface Resettable {
  reset: () => void;
}

export const reset = <T extends Resettable>(
  createState: StateCreator<T, [], [], T>
): StateCreator<T, [], [], T> =>
  (set, get, api) => {
    const initialState = createState(set, get, api);
    
    return {
      ...initialState,
      reset: () => {
        const resetState = createState(set, get, api);
        set(resetState, true); // Replace state entirely
      },
    } as T;
  };