// src/core/extensionAPI/modules/window/editorAPI.ts

import { useTabStore } from '@/store/tabStore';

/**
 * Factory function to create the Editor API.
 * Allows extensions to interact with the active document and its metadata.
 */
export const createEditorAPI = () => ({
  /**
   * Retrieves the currently active editor instance and its document details.
   * @returns {Object | null} An object containing document metadata (uri, languageId, fileName), 
   * or null if no editor is active.
   */
  getActiveEditor: () => {
    const { activeTabId, tabs } = useTabStore.getState();
    const tab = tabs.find(t => t.id === activeTabId);
    
    if (!tab) return null;
    const t = tab as any;
    
    return {
      document: {
        /** The full path or URI of the file. */
        uri: t.path ?? (tab.id.startsWith('file://') ? tab.id : `file://${tab.id}`),
        /** The programming language identifier (e.g., 'javascript', 'typescript'). */
        languageId: t.languageId || tab.title.split('.').pop() || '',
        /** The display name of the file. */
        fileName: tab.title,
      }
    };
  }
});
