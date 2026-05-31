// src/core/extensionAPI/modules/window/fileDecorationsAPI.ts
//
// Usage inside any extension:
//   mscode.window.fileDecorations.set('/src/App.tsx', { badge: 'M', color: '#e2c08d', tooltip: 'Modified', propagate: true });
//   mscode.window.fileDecorations.clear('/src/App.tsx');
//   mscode.window.fileDecorations.clearAll();

import { useDecorationStore } from '@/features/explorer/store/decorationStore';
import type { FileDecoration } from '@/features/explorer/store/decorationStore';

// ─── API Object ──────────────────────────────────────────────────────────────

export const fileDecorationsAPI = {

  /**
   * Set a decoration badge on a file or folder path.
   *
   * @example
   * mscode.window.fileDecorations.set('/src/App.tsx', {
   *   badge:    'M',
   *   color:    '#e2c08d',   // yellow — modified
   *   tooltip:  'Modified',
   *   propagate: true,       // parent folders will show a dot
   * });
   */
  set: (path: string, decoration: FileDecoration): void => {
    useDecorationStore.getState().setDecoration(path, decoration);
  },

  /**
   * Set decorations for many paths at once.
   * Ideal after a full `git status` scan.
   *
   * @example
   * mscode.window.fileDecorations.setBulk({
   *   '/src/App.tsx':    { badge: 'M', color: '#e2c08d', tooltip: 'Modified',  propagate: true },
   *   '/src/NewFile.ts': { badge: 'U', color: '#73c991', tooltip: 'Untracked', propagate: true },
   *   '/src/Deleted.ts': { badge: 'D', color: '#f44747', tooltip: 'Deleted',   propagate: true },
   * });
   */
  setBulk: (entries: Record<string, FileDecoration>): void => {
    useDecorationStore.getState().setDecorations(entries);
  },

  /**
   * Remove the decoration from a single path.
   */
  clear: (path: string): void => {
    useDecorationStore.getState().setDecoration(path, null);
  },

  /**
   * Remove all decorations (e.g. when user closes git extension).
   */
  clearAll: (): void => {
    useDecorationStore.getState().clearDecorations();
  },

  /**
   * Read the current decoration for a path (for internal use / testing).
   */
  get: (path: string): FileDecoration | null => {
    return useDecorationStore.getState().decorations[path] ?? null;
  },
};

export type FileDecorationsAPI = typeof fileDecorationsAPI;
