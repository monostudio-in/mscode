// src/store/backButtonStore.ts

import { create } from 'zustand';

/**
 * A callback function that determines whether the back action should be consumed.
 * @returns true if the event was handled and should stop propagation, false otherwise.
 */
export type BackButtonCallback = () => boolean | Promise<boolean>;

/**
 * A registered back button handler tied to a specific UI context or component.
 */
interface BackButtonHandler {
  id: string;
  callback: BackButtonCallback;
}

/**
 * State container for managing the stack of back button behavior overrides.
 * This allows components like modals, panels, or custom views to intercept 
 * the hardware back button event before it reaches the global application level.
 */
interface BackButtonStore {
  /** Array of currently registered back button handlers. */
  handlers: BackButtonHandler[];
  
  /** 
   * Registers a callback into the handler stack. 
   * If an existing handler with the same ID exists, it is replaced to prevent duplicates.
   */
  push: (id: string, callback: BackButtonCallback) => void;
  
  /** 
   * Removes a callback from the handler stack.
   */
  remove: (id: string) => void;
}

export const useBackButtonStore = create<BackButtonStore>((set) => ({
  handlers: [],
  
  push: (id, callback) => set((state) => {
    // Filter out existing handler with the same ID to ensure uniqueness
    const filtered = state.handlers.filter(h => h.id !== id);
    // Add new handler to the end of the stack
    return { handlers: [...filtered, { id, callback }] };
  }),

  remove: (id) => set((state) => ({
    handlers: state.handlers.filter(h => h.id !== id)
  }))
}));
