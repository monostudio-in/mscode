// src/features/editor/store/editorViewStateStore.ts
import { create } from 'zustand';
import { saveEditorViewState, loadEditorViewState } from '@/core/services/storageService';

export interface EditorViewState {
  content?: string;      
  isDirty?: boolean;     
  selection?: any;       
  scrollPos?: number;    
  folds?: Array<{from: number, to: number}>; 
  cursorLine?: number;
  cursorColumn?: number;
  languageId?: string;
  encoding?: string;
  tabSize?: number;
  insertSpaces?: boolean;
}

interface EditorViewStateStore {
  currentWorkspacePath: string | null;
  viewStates: Record<string, EditorViewState>; 
  initViewStates: (workspacePath: string | null) => Promise<void>;
  updateViewState: (id: string, state: Partial<EditorViewState>) => void;
  setTabDirty: (id: string, isDirty: boolean) => void;
  saveToStorage: () => Promise<void>;
  clearViewStates: () => void;
}

export const useEditorViewStateStore = create<EditorViewStateStore>((set, get) => ({
  currentWorkspacePath: null,
  viewStates: {},

  initViewStates: async (workspacePath) => {
    const data = await loadEditorViewState(workspacePath);
    if (data && data.viewStates) {
      set({ currentWorkspacePath: workspacePath, viewStates: data.viewStates });
    } else {
      set({ currentWorkspacePath: workspacePath, viewStates: {} });
    }
  },

  updateViewState: (id, state) => {
    set((prev) => ({
      viewStates: {
        ...prev.viewStates,
        [id]: { ...(prev.viewStates[id] || {}), ...state }
      }
    }));
  },

  setTabDirty: (id, isDirty) => {
    get().updateViewState(id, { isDirty });
  },

  saveToStorage: async () => {
    const { currentWorkspacePath, viewStates } = get();
    if (!currentWorkspacePath) return; // Don't Save if path doesn't exist
    await saveEditorViewState(currentWorkspacePath, { viewStates });
  },

  clearViewStates: () => set({ viewStates: {} })
}));