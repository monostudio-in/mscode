// src/core/extensionAPI/modules/workspace/workspaceInfoAPI.ts

import { useExplorerStore } from '@/features/explorer/store/exploreStore';

/**
 * Factory function to create the Workspace Info API.
 * Exposes metadata regarding the currently active workspace/folder.
 */
export const createWorkspaceInfoAPI = () => ({
  /**
   * The absolute path of the currently open workspace (e.g., '/sdcard/Projects/MyApp').
   * @returns {string | undefined} The path string, or undefined if no folder is open.
   */
  get workspacePath(): string | undefined {
    const path = useExplorerStore.getState().workspacePath;
    return path ? path : undefined;
  },

  /**
   * The name of the current workspace, derived from the last segment of the workspace path.
   * @returns {string | undefined} The folder name, or undefined if no workspace is active.
   */
  get name(): string | undefined {
    const path = useExplorerStore.getState().workspacePath;
    return path ? path.split('/').pop() : undefined;
  }
});
