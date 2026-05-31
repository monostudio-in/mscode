// src/store/quickKeyboardStore.ts

import { create } from 'zustand';

/**
 * Represents a single auxiliary key action displayed in the mobile quick-access bar.
 */
export interface QuickKey {
  /** Unique identifier for the key binding. */
  id: string;
  /** Visible label or symbol displayed on the key. */
  label?: string;
  /** Optional icon name for the key. */
  icon?: string;
  /** The command ID or action trigger string executed when pressed. */
  action: string; 
}

/**
 * State management for the mobile-specific quick-access keyboard overlay.
 * Controls visibility and the dynamic configuration of active keys.
 */
interface QuickKeyboardState {
  /** Visibility state of the quick keyboard bar. */
  isVisible: boolean;
  /** The list of keys currently rendered in the toolbar. */
  keys: QuickKey[];
  
  /** Modifier State */
  modifiers: { ctrl: boolean; alt: boolean; shift: boolean };
  
  /** Toggles the display state of the keyboard bar. */
  toggleVisibility: () => void;
  /** Updates the keys displayed based on context (e.g., loaded from user settings). */
  setKeys: (keys: QuickKey[]) => void;
  toggleModifier: (mod: 'ctrl' | 'alt' | 'shift') => void;
  resetModifiers: () => void;
}

/**
 * Store implementation for managing mobile quick keyboard access buttons.
 * Useful for providing standard modifier keys like Ctrl, Alt, and arrows 
 * to touch-based mobile environments.
 */
export const useQuickKeyboardStore = create<QuickKeyboardState>((set) => ({
  isVisible: false, 
  keys: [], 
  modifiers: { ctrl: false, alt: false, shift: false },
  toggleVisibility: () => set((s) => ({ isVisible: !s.isVisible })),
  
  setKeys: (keys: QuickKey[]) => set({ keys }),
  
  toggleModifier: (mod) => set((s) => ({ modifiers: { ...s.modifiers, [mod]: !s.modifiers[mod] } })),
  resetModifiers: () => set({ modifiers: { ctrl: false, alt: false, shift: false } })
  
}));
