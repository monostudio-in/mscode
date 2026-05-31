// src/store/clipboardStore.ts
import { create } from 'zustand';

/**
 * Interface representing the global clipboard state.
 * Manages both text copy history and file system operations (Copy/Cut/Paste).
 */
interface ClipboardState {
  // ────────────────────────────────────────────────────────
  // TEXT CLIPBOARD
  // ────────────────────────────────────────────────────────
  
  /** An array of recently copied text strings. */
  history: string[];

  /**
   * Adds a new string to the clipboard history.
   * Uses LRU logic: the new item is moved to the top, and duplicates are removed.
   * @param text The string to be saved.
   */
  addCopiedText: (text: string) => void;

  /** Wipes all saved text history. */
  clearHistory: () => void;
  
  // ────────────────────────────────────────────────────────
  // EXPLORER (FILE) CLIPBOARD
  // ────────────────────────────────────────────────────────
  
  /** Stores metadata for the file currently staged for a copy or cut operation. */
  clipboardFile: { path: string; action: 'copy' | 'cut' } | null;

  /**
   * Sets a file path to the clipboard for explorer operations.
   * @param path The absolute path of the file/folder.
   * @param action Whether the file is being 'copied' or 'cut' (moved).
   */
  setClipboardFile: (path: string, action: 'copy' | 'cut') => void;

  /** Resets the file clipboard to null. */
  clearClipboard: () => void;
}

/**
 * Zustand store for managing clipboard operations within Mono Studio.
 */
export const useClipboardStore = create<ClipboardState>((set) => ({
  
  // Text State
  history: [], 
  
  addCopiedText: (text) => set((state) => {
    // Prevent saving empty or whitespace-only strings
    if (!text.trim()) return state; 

    /**
     * LRU Logic: 
     * 1. Remove existing instances of this text to avoid duplicates.
     * 2. Place the new text at the beginning of the array.
     * 3. Cap the history at 20 items to optimize memory.
     */
    const newHistory = [text, ...state.history.filter(t => t !== text)].slice(0, 20);
    return { history: newHistory };
  }),

  clearHistory: () => set({ history: [] }),
  
  // Explorer State
  clipboardFile: null,

  setClipboardFile: (path, action) => set({ 
    clipboardFile: { path, action } 
  }),

  clearClipboard: () => set({ 
    clipboardFile: null 
  })
  
}));
