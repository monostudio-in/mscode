// src/core/extensionAPI/modules/languages/diagnosticsAPI.ts

import * as monaco from 'monaco-editor';
import { useProblemsStore } from '@/features/termis/components/problems/store/problemsStore';
import { msEvents } from '@/core/extensionAPI/events/EventManager';

/**
 * Factory function to create the Diagnostics API.
 * Enables extensions to read, publish, or listen to code warnings, errors, and linting markers.
 * 
 * @param {string} extId - The unique identifier of the extension.
 */
export const createDiagnosticsAPI = (extId: string) => ({
  /**
   * Retrieves all currently active diagnostics (problems) in the editor workspace.
   * 
   * @param {string} [uri] - Optional target file URI to filter diagnostics.
   * @returns {monaco.editor.IMarker[]} Array of diagnostic markers matching the criteria.
   */
  getDiagnostics: (uri?: string) => {
    const allMarkers = useProblemsStore.getState().markers;
    if (uri) return allMarkers.filter(m => m.resource.path === uri);
    return allMarkers;
  },

  /**
   * Creates a dedicated container for diagnostic markers. 
   * Useful for linking custom external linters, builders, or toolchains (e.g., ESLint).
   * 
   * @param {string} name - The human-readable name of the collection.
   * @returns An object managing the collection lifetime and markers state.
   */
  createDiagnosticCollection: (name: string) => {
    // Generate a unique namespaced owner key to group diagnostics for this collection
    const owner = `${extId}.${name}`;

    return {
      name,
      
      /**
       * Publishes an array of diagnostics for a specific file resource path.
       * This triggers native Monaco editor squiggles and updates the UI Problems Panel.
       * 
       * @param {string} uri - The absolute target document URI string.
       * @param {monaco.editor.IMarkerData[]} diagnostics - The markers metadata payload array.
       */
      set: (uri: string, diagnostics: monaco.editor.IMarkerData[]) => {
        const model = monaco.editor.getModel(monaco.Uri.parse(uri));
        if (model) {
          monaco.editor.setModelMarkers(model, owner, diagnostics);
        }
      },
      
      /** Wipes all active diagnostic markers published by this specific collection instance. */
      clear: () => {
        monaco.editor.removeAllMarkers(owner);
      },
      
      /** Disposes the collection container and clears all of its registered markers. */
      dispose: () => {
        monaco.editor.removeAllMarkers(owner);
      }
    };
  },

  // ────────────────────────────────────────────────────────
  // EVENT LISTENERS
  // ────────────────────────────────────────────────────────
  
  /**
   * Fired globally when file markers or diagnostics are added, changed, or completely cleared.
   * 
   * @param {Function} handler - Callback invoked when a system diagnostics sync occurs.
   * @returns {Object} A disposable instance object to detach the event listener hook securely.
   */
  onDidChangeDiagnostics: (handler: (diagnostics: monaco.editor.IMarker[]) => void) => {
    return { dispose: msEvents.on('onDidChangeDiagnostics', handler) };
  }
});
