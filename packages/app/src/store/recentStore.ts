// src/store/recentStore.ts

import { create } from 'zustand';
import { loadGlobalState, saveGlobalState } from '@/core/services/storageService';

// Recents
export interface RecentWorkspace {
  name: string;
  path: string;
  lastOpened: number;
}

// Bookmarks
export interface BookmarkFolder {
  name: string;
  path: string;
}

interface RecentStore {
  recentWorkspaces: RecentWorkspace[];
  bookmarks: BookmarkFolder[];
  
  // Recent Actions
  loadRecents: () => Promise<void>;
  addRecent: (name: string, path: string) => Promise<void>;
  clearRecents: () => Promise<void>;

  // Bookmark Actions
  addBookmark: (name: string, path: string) => Promise<void>;
  removeBookmark: (path: string) => Promise<void>;
}

export const useRecentStore = create<RecentStore>((set, get) => ({
  recentWorkspaces: [],
  bookmarks: [],

  loadRecents: async () => {
    const config = await loadGlobalState();
    if (config) {
      set({ 
        recentWorkspaces: config.recentWorkspaces || [],
        bookmarks: config.bookmarks || []
      });
    }
  },

  addRecent: async (name, path) => {
    const config = await loadGlobalState() || {};
    const currentList = config.recentWorkspaces || get().recentWorkspaces;

    const filteredList = currentList.filter((w: RecentWorkspace) => w.path !== path);
    const updatedList = [ { name, path, lastOpened: Date.now() }, ...filteredList ].slice(0, 10); 
    
    set({ recentWorkspaces: updatedList });
    await saveGlobalState({ ...config, recentWorkspaces: updatedList });
  },

  clearRecents: async () => {
    set({ recentWorkspaces: [] });
    const config = await loadGlobalState() || {};
    await saveGlobalState({ ...config, recentWorkspaces: [] });
  },

  // ─── Bookmark Methods ──────────────────────────────────────────────────
  addBookmark: async (name, path) => {
    const config = await loadGlobalState() || {};
    const currentList = config.bookmarks || get().bookmarks;

    if (currentList.some((b: BookmarkFolder) => b.path === path)) return;

    const updatedList = [...currentList, { name, path }];
    
    set({ bookmarks: updatedList });
    await saveGlobalState({ ...config, bookmarks: updatedList });
  },

  removeBookmark: async (path) => {
    const config = await loadGlobalState() || {};
    const currentList = config.bookmarks || get().bookmarks;

    const updatedList = currentList.filter((b: BookmarkFolder) => b.path !== path);
    
    set({ bookmarks: updatedList });
    await saveGlobalState({ ...config, bookmarks: updatedList });
  }
}));