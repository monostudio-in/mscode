// src/core/extensionAPI/modules/workspace/workspaceAPI.ts

import { useExplorerStore } from '@/features/explorer/store/exploreStore';
import { msEvents } from '@/core/extensionAPI/events/EventManager';

export const createWorkspaceAPI = () => ({
  /**
   * The absolute path of the currently open workspace (e.g., '/sdcard/Projects/MyApp').
   */
  get workspacePath(): string | undefined {
    return useExplorerStore.getState().workspacePath || undefined;
  },

  /**
   * The name of the current workspace.
   */
  get name(): string | undefined {
    return useExplorerStore.getState().workspaceName || undefined;
  },

  /**
   * Open a new workspace folder .
   */
  openWorkspace: (name: string, path: string) => {
    useExplorerStore.getState().setWorkspace(name, path);
  },

  // ────────────────────────────────────────────────────────
  // EVENT LISTENERS
  // ────────────────────────────────────────────────────────

  /**
   * Fired when the active workspace folder changes.
   */
  onDidChangeWorkspace: (handler: (workspace: { name: string | null, path: string | null }) => void) => {
    return { dispose: msEvents.on('onDidChangeWorkspace', handler) };
  }
});