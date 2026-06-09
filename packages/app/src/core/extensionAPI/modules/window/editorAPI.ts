// src/core/extensionAPI/modules/window/editorAPI.ts

import { useTabStore } from '@/store/tabStore';
import { useEditorViewStateStore } from '@/features/editor/store/editorViewStateStore';
import * as monaco from 'monaco-editor';
export const createEditorAPI = () => ({
  
  /**
   * Retrieves the currently active editor instance and its document details.
   * Accessed directly via `mscode.window.activeTextEditor`
   */
  get activeTextEditor() {
    const { activeTabId, tabs } = useTabStore.getState();
    const tab = tabs.find(t => t.id === activeTabId);
    
    if (!tab || tab.type !== 'code') return undefined;

    const viewStates = useEditorViewStateStore.getState().viewStates;
    const currentViewState = viewStates[tab.id] || {};
    
    const t = tab as any;
    // Ensure standard file:// URI format
    const uriString = t.path ?? (tab.id.startsWith('file://') ? tab.id : `file://${tab.id}`);
    
    // ─── HELPER: FIND NATIVE MONACO INSTANCE ───
    const getMonacoInstance = () => {
      // Monaco internally keeps track of all mounted editor instances!
      const editors = monaco.editor.getEditors();
      // Match the editor by checking if its model URI matches our active tab URI
      return editors.find(e => e.getModel()?.uri.toString() === uriString) || null;
    };

    return {
      document: {
        uri: uriString,
        languageId: t.languageId || tab.title.split('.').pop() || '',
        fileName: tab.title,
        getText: () => currentViewState.content ?? '',
      },
      selection: currentViewState.selection ?? null,
      cursor: {
        line: currentViewState.cursorLine ?? 1,
        column: currentViewState.cursorColumn ?? 1,
      },
      options: {
        tabSize: currentViewState.tabSize ?? 4,
        insertSpaces: currentViewState.insertSpaces ?? true,
      },

      // ────────────────────────────────────────────────────────
      // 1. STANDARD API WAY (The Safe Edit Wrapper)
      // ────────────────────────────────────────────────────────
      /**
       * Safely edits the text in the active editor.
       * @example 
       * editor.edit((editBuilder) => {
       *    editBuilder.insert(1, 1, "Hello World");
       * });
       */
      edit: (callback: (editBuilder: any) => void) => {
        const editorInstance = getMonacoInstance();
        if (!editorInstance) {
          console.warn("[EditorAPI] Cannot edit: Monaco instance not found or focused.");
          return false;
        }

        const edits: monaco.editor.IIdentifiedSingleEditOperation[] = [];
        
        // Mocking the VS Code EditBuilder pattern
        const editBuilder = {
          insert: (line: number, column: number, text: string) => {
            edits.push({
              range: new monaco.Range(line, column, line, column),
              text: text,
              forceMoveMarkers: true
            });
          },
          replace: (startLine: number, startCol: number, endLine: number, endCol: number, text: string) => {
            edits.push({
              range: new monaco.Range(startLine, startCol, endLine, endCol),
              text: text
            });
          }
        };

        // Let the extension developer push their edits
        callback(editBuilder);

        // Execute the edits safely in Monaco (this also adds it to the Undo/Redo stack!)
        if (edits.length > 0) {
          editorInstance.executeEdits('mscode-extension-api', edits);
          return true;
        }
        return false;
      },

      // ────────────────────────────────────────────────────────
      // 2. THE ESCAPE HATCH (The Raw Monaco Instance)
      // ────────────────────────────────────────────────────────
      /**
       * ⚠️ ADVANCED: Returns the raw underlying Monaco Editor instance.
       * Modifying the editor directly may bypass internal MS Code event listeners.
       */
      get _rawMonacoEditor() {
        return getMonacoInstance();
      }
    };
  }
});