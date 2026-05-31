// src/store/tabStore.ts
import { create } from 'zustand';
import { saveWorkspaceState, loadWorkspaceState } from '@/core/services/storageService';
import { accessLRUItem, removeLRUItem } from '@/utils/lruUtils';
import { msEvents } from '@/core/extensionAPI/events/EventManager';

/**
 * Defines the schema for a workspace tab.
 */
export interface Tab {
  id: string;
  type: 'code' | 'extension' | 'page' | 'settings' | 'image' | 'welcome' | 'termis' | 'keybindings' | 'diff' ;
  title: string;
  filePath?: string;
  icon?: string;
  showQuickBar?: boolean; 
  showStatusBar?: boolean;
  showBreadcrumb?: boolean;
  diffData?: {
    originalContent: string;
    modifiedContent: string | null;
    readOnly: boolean;
    filePath: string;
  };
}

/**
 * Interface representing the tab manager state and operations.
 */
interface TabState {
  currentWorkspacePath: string | null;
  tabs: Tab[];
  activeTabId: string | null;
  recentTabIds: string[]; 
  
  addTab: (tab: Tab) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  reorderTabs: (ids: string[]) => void;
  
  updateTab: (id: string, updates: Partial<Tab>) => void;
  /** Updates tab IDs and file paths recursively, typically after folder/file renames. */
  updateTabPaths: (oldPath: string, newPath: string) => void;

  initTabs: (workspacePath: string | null) => Promise<void>;
  saveTabsToStorage: () => Promise<void>;
  clearTabs: () => void;
}

/**
 * Global store for managing active workspace tabs, active selection, and history.
 */
export const useTabStore = create<TabState>((set, get) => ({
  currentWorkspacePath: null,
  tabs: [],
  activeTabId: null,
  recentTabIds: [],

  addTab: (tab) => {
    const { tabs, recentTabIds, saveTabsToStorage } = get();
    const processedTab: Tab = {
      ...tab,
      showStatusBar: tab.showStatusBar ?? (tab.type === 'page' || tab.type === 'code'),
      showBreadcrumb: tab.showBreadcrumb ?? (tab.type === 'code')
    };

    const exists = tabs.find(t => t.id === processedTab.id);
    if (!exists) {
      set({ 
        tabs: [...tabs, processedTab], 
        activeTabId: processedTab.id,
        recentTabIds: accessLRUItem(recentTabIds, processedTab.id)
      });
    } else {
      // Update existing tab data if it re-opens
      const updatedTabs = tabs.map(t => 
        t.id === processedTab.id ? { ...t, ...processedTab } : t
      );
      
      set({ 
        tabs: updatedTabs,
        activeTabId: processedTab.id,
        recentTabIds: accessLRUItem(recentTabIds, processedTab.id)
      });
    }
    
    msEvents.emit('onDidOpenTab', processedTab);
    saveTabsToStorage();
  },

  closeTab: (id) => {
    const { tabs, activeTabId, recentTabIds, saveTabsToStorage } = get();
    const newTabs = tabs.filter(t => t.id !== id);
    const newRecentIds = removeLRUItem(recentTabIds, id); 
    
    let newActive = activeTabId;
    if (activeTabId === id) {
      newActive = newRecentIds.length > 0 ? newRecentIds[0] : null; 
    }
    
    set({ tabs: newTabs, activeTabId: newActive, recentTabIds: newRecentIds });
    msEvents.emit('onDidCloseTab', id);
    saveTabsToStorage();
  },

  setActiveTab: (id) => {
    set(state => ({ 
      activeTabId: id,
      recentTabIds: accessLRUItem(state.recentTabIds, id)
    }));
    
    const activeTab = get().tabs.find(t => t.id === id);
    msEvents.emit('onDidChangeActiveTab', activeTab);
    
    get().saveTabsToStorage();
  },

  reorderTabs: (ids) => {
    const { tabs, saveTabsToStorage } = get();
    const reordered = ids
      .map(id => tabs.find(t => t.id === id))
      .filter((t): t is Tab => t !== undefined);

    const changed = reordered.some((t, i) => tabs[i]?.id !== t.id);
    if (!changed) return;

    set({ tabs: reordered });
    saveTabsToStorage();
  },
  
  // Perticular tab's data update
  updateTab: (id, updates) => set((state) => ({
    tabs: state.tabs.map(tab => tab.id === id ? { ...tab, ...updates } : tab)
  })),

  updateTabPaths: (oldPath, newPath) => {
    const { tabs, activeTabId, recentTabIds, saveTabsToStorage } = get();
    
    let changed = false;
    const newTabs = tabs.map(t => {
      // Handle file path updates for single files or within renamed folders
      if (t.id === oldPath || t.id.startsWith(oldPath + '/')) {
        changed = true;
        const updatedId = t.id === oldPath ? newPath : newPath + t.id.substring(oldPath.length);
        const updatedTitle = updatedId.split('/').pop() || t.title;
        return { ...t, id: updatedId, filePath: updatedId, title: updatedTitle };
      }
      return t;
    });

    if (!changed) return;

    const newActive = activeTabId === oldPath || activeTabId?.startsWith(oldPath + '/')
      ? (activeTabId === oldPath ? newPath : newPath + activeTabId.substring(oldPath.length))
      : activeTabId;

    const newRecent = recentTabIds.map(id => {
      if (id === oldPath) return newPath;
      if (id.startsWith(oldPath + '/')) return newPath + id.substring(oldPath.length);
      return id;
    });

    set({ tabs: newTabs, activeTabId: newActive, recentTabIds: newRecent });
    saveTabsToStorage();
  },

  initTabs: async (workspacePath) => {
    const data = await loadWorkspaceState(workspacePath);
    if (data) {
      set({ 
        currentWorkspacePath: workspacePath,
        tabs: data.tabs || [], 
        activeTabId: data.activeTabId || null,
        recentTabIds: data.recentTabIds || [] 
      });
    } else {
      set({ currentWorkspacePath: workspacePath, tabs: [], activeTabId: null, recentTabIds: [] });
    }
  },

  saveTabsToStorage: async () => {
    const { tabs, activeTabId, recentTabIds, currentWorkspacePath } = get();
    await saveWorkspaceState(currentWorkspacePath, { tabs, activeTabId, recentTabIds });
  },

  clearTabs: () => {
    set({ tabs: [], activeTabId: null, recentTabIds: [] });
  },
}));
