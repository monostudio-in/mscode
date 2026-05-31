// src/core/extensionAPI/registry/treeViewRegistry.ts

import { create } from 'zustand';

// ─── Public Types (Extensions use these) ─────────────────────────────────────

export interface TreeItem {
  id:                 string;
  label:              string;
  description?:       string;          // Dimmed text after the label
  icon?:              string;          // Icon name (matches your IconRegistry)
  badge?:             string;          // Small badge e.g. '3'
  badgeColor?:        string;          // CSS color for the badge
  tooltip?:           string;
  collapsibleState:   'none' | 'collapsed' | 'expanded';
  contextValue?:      string;          // Used for right-click menus later
}

export interface TreeDataProvider {
  /** Called to get root items (element = undefined) or children of an item */
  getChildren: (element?: TreeItem) => Promise<TreeItem[]>;

  /** Optional: called when the user clicks an item */
  onItemClick?: (item: TreeItem) => void;
}

export interface RegisteredTreeView {
  viewId:       string;
  title:        string;               // Panel header title e.g. "Git Commits"
  provider:     TreeDataProvider;
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface TreeViewRegistryStore {
  views: RegisteredTreeView[];

  register:   (view: RegisteredTreeView) => void;
  unregister: (viewId: string) => void;
}

export const useTreeViewRegistry = create<TreeViewRegistryStore>((set) => ({
  views: [],

  register: (view) =>
    set((state) => ({
      // Replace if same viewId is re-registered (extension reload)
      views: [
        ...state.views.filter(v => v.viewId !== view.viewId),
        view,
      ],
    })),

  unregister: (viewId) =>
    set((state) => ({
      views: state.views.filter(v => v.viewId !== viewId),
    })),
}));
