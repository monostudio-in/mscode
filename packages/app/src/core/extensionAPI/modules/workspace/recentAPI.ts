// src/core/extensionAPI/modules/workspace/recentAPI.ts

import { useRecentStore } from '@/store/recentStore';

/**
 * Factory function to create the Recent API.
 * Provides management for the workspace history (Recently Opened Projects).
 */
export const createRecentAPI = () => ({
  /**
   * Retrieves the list of all recently opened workspaces.
   * @returns {Array<{name: string, path: string}>} A list of recent workspace entries.
   */
  getRecentWorkspaces: () => {
    return useRecentStore.getState().recentWorkspaces;
  },

  /**
   * Adds a new project or workspace to the history.
   * @param {string} name - The display name of the project.
   * @param {string} path - The absolute file system path of the workspace.
   * @returns {Promise<void>} Resolves when the workspace is added to persistence.
   */
  addRecentWorkspace: async (name: string, path: string) => {
    await useRecentStore.getState().addRecent(name, path);
  },

  /**
   * Clears the entire recent workspace history.
   * @returns {Promise<void>} Resolves when the history is wiped.
   */
  clearRecentWorkspaces: async () => {
    await useRecentStore.getState().clearRecents();
  }
});
