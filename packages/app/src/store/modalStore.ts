// src/store/modalStore.ts
import { create } from 'zustand';

/**
 * Options blueprint required to spin up a global workflow message prompt.
 */
export interface ModalOptions {
  /** Title header text shown on the confirmation window framework. */
  title: string;
  
  /** Contextual body content or descriptive message context. */
  message: string;
  
  /** Optional icon descriptor from the core glyph registry. */
  iconName?: string;
  
  /**
   * Action triggers rendered dynamically inside the dialog action frame.
   * @example ['Yes', 'No', 'Cancel']
   */
  buttons?: string[];
}

/**
 * Core state layout schema managing async confirmation windows natively.
 */
interface ModalState {
  /** Toggles the global display state visibility mapping layer. */
  isOpen: boolean;
  
  /** Active configuration state loaded inside the operational prompt container. */
  options: ModalOptions | null;
  
  /** Intercepted callback resolution loop tracker keeping the Promise context alive. */
  resolvePromise: ((value: string | null) => void) | null;
  
  /**
   * Mounts a custom window message overlay context and suspends flow control until resolved.
   * @param options Structure handling titles, logs, and footer control layouts.
   * @returns Resolves directly to the string value of the clicked button or null if dismissed.
   */
  showModal: (options: ModalOptions) => Promise<string | null>;
  
  /**
   * Clears the current window frame memory context and dispatches unresolved promise payloads.
   * @param selectedValue The text identity value of the pressed button component.
   */
  closeModal: (selectedValue: string | null) => void;
}

/**
 * Internal Platform Store Engine: Async Modal orchestration bridge.
 * Helps decoupled systems prompt confirmations cleanly without tracking block state arrays inside views.
 * * @internal This is a core private store module. Do not expose this wrapper directly to the Extension API layer.
 */
export const useModalStore = create<ModalState>((set, get) => ({
  isOpen: false,
  options: null,
  resolvePromise: null,

  showModal: (options) => {
    return new Promise((resolve) => {
      set({ isOpen: true, options, resolvePromise: resolve });
    });
  },

  closeModal: (selectedValue) => {
    const { resolvePromise } = get();
    if (resolvePromise) resolvePromise(selectedValue);
    set({ isOpen: false, options: null, resolvePromise: null });
  }
}));