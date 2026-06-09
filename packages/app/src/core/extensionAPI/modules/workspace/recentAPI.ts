// src/core/extensionAPI/modules/workspace/recentAPI.ts

import { useRecentStore } from '@/store/recentStore';

export const createRecentAPI = () => ({
  /**
   * Retrieves the list of all recently opened workspaces.
   */
  get recentWorkspaces() {
    return useRecentStore.getState().recentWorkspaces;
  },

  /**
   * Retrieves the list of all user-saved bookmarks.
   */
  get bookmarks() {
    return useRecentStore.getState().bookmarks;
  },

  /**
   * Adds a new project or workspace to the history.
   * @param {string} name - The display name of the project.
   * @param {string} path - The absolute file system path of the workspace.
   */
  addRecentWorkspace: async (name: string, path: string) => {
    await useRecentStore.getState().addRecent(name, path);
  },

  /**
   * Clears the entire recent workspace history.
   */
  clearRecentWorkspaces: async () => {
    await useRecentStore.getState().clearRecents();
  },

  /**
   * Adds a folder to the bookmarks list.
   */
  addBookmark: async (name: string, path: string) => {
    await useRecentStore.getState().addBookmark(name, path);
  },

  /**
   * Removes a folder from the bookmarks list by its path.
   */
  removeBookmark: async (path: string) => {
    await useRecentStore.getState().removeBookmark(path);
  }
});