// src/store/exploreStore.ts

import { create } from 'zustand';
import { loadGlobalState, saveGlobalState } from '@/core/services/storageService'; 
import { useRecentStore } from '@/store/recentStore';

export type InlineAction = {
  type: 'newFile' | 'newFolder' | 'rename';
  targetPath?: string; 
  parentPath: string;  
  initialValue: string;
};

interface ExplorerState {
  selectedItem: { path: string; isDirectory: boolean } | null;
  inlineAction: InlineAction | null;
  refreshId: number;
  workspaceName: string | null;
  workspacePath: string | null;
  expandedFolders: string[];
  
  setSelectedItem: (item: { path: string; isDirectory: boolean } | null) => void;
  setInlineAction: (action: InlineAction | null) => void;
  triggerRefresh: () => void;
  setWorkspace: (name: string | null, path: string | null) => void;
  toggleFolder: (path: string, isOpen: boolean) => void;
  initWorkspace: () => Promise<void>; 
}

/**
 * State store managing file explorer views, contextual interactive actions, 
 * active workspace loading coordinates, and folder visibility expansion history trees.
 */
export const useExplorerStore = create<ExplorerState>((set, get) => ({
  selectedItem: null,
  inlineAction: null,
  refreshId: 0,
  workspaceName: null,
  workspacePath: null,
  expandedFolders: [],
  
  setSelectedItem: (item) => set({ selectedItem: item }),
  setInlineAction: (action) => set({ inlineAction: action }),
  triggerRefresh: () => set((state) => ({ refreshId: state.refreshId + 1 })),
  
  toggleFolder: async (path, isOpen) => {
    set((state) => {
      const newFolders = isOpen 
        ? [...state.expandedFolders, path] 
        : state.expandedFolders.filter(p => p !== path);
      return { expandedFolders: newFolders };
    });

    // Mirror modification records context safely down into non-volatile configuration entries
    const currentGlobalState = await loadGlobalState() || {};
    const { workspaceName, workspacePath, expandedFolders } = get();
    
    await saveGlobalState({
      ...currentGlobalState,
      lastWorkspace: { 
        ...(currentGlobalState.lastWorkspace || {}),
        name: workspaceName, 
        path: workspacePath, 
        expandedFolders 
      }
    });
  },

  initWorkspace: async () => {
    const config = await loadGlobalState();
    if (config && config.lastWorkspace) {
      set({ 
        workspaceName: config.lastWorkspace.name, 
        workspacePath: config.lastWorkspace.path,
        expandedFolders: config.lastWorkspace.expandedFolders || []
      });
    }
  },

  setWorkspace: async (name, path) => {
    // Inject root directory anchor coordinate directly into structural expansion paths upon startup
    set({ workspaceName: name, workspacePath: path, expandedFolders: path ? [path] : [] });
    
    const currentGlobalState = await loadGlobalState() || {};
    await saveGlobalState({
      ...currentGlobalState,
      lastWorkspace: name && path ? { name, path, expandedFolders: [path] } : null
    });
    
    if (name && path) {
      await useRecentStore.getState().addRecent(name, path);
    }
  }
}));
