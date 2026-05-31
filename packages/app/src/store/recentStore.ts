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
        bookmarks: config.bookmarks || [] // Load bookmarks
      });
    }
  },

  addRecent: async (name, path) => {
    const currentList = get().recentWorkspaces;
    const filteredList = currentList.filter(w => w.path !== path);
    const updatedList = [ { name, path, lastOpened: Date.now() }, ...filteredList ].slice(0, 10); 
    set({ recentWorkspaces: updatedList });

    const config = await loadGlobalState() || {};
    await saveGlobalState({ ...config, recentWorkspaces: updatedList });
  },

  clearRecents: async () => {
    set({ recentWorkspaces: [] });
    const config = await loadGlobalState() || {};
    await saveGlobalState({ ...config, recentWorkspaces: [] });
  },

  // ─── Bookmark Methods ──────────────────────────────────────────────────
  addBookmark: async (name, path) => {
    const currentList = get().bookmarks;

    if (currentList.some(b => b.path === path)) return;

    const updatedList = [...currentList, { name, path }];
    set({ bookmarks: updatedList });

    const config = await loadGlobalState() || {};
    await saveGlobalState({ ...config, bookmarks: updatedList });
  },

  removeBookmark: async (path) => {
    const updatedList = get().bookmarks.filter(b => b.path !== path);
    set({ bookmarks: updatedList });

    const config = await loadGlobalState() || {};
    await saveGlobalState({ ...config, bookmarks: updatedList });
  }
}));