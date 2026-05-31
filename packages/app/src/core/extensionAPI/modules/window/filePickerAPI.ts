// src/core/extensionAPI/modules/window/filePickerAPI.ts

import { useFilePickerStore, type PickerOptions } from '@/store/filePickerStore';
import { msEvents } from '@/core/extensionAPI/events/EventManager';

export const createFilePickerAPI = () => ({
  /**
   * Shows a file or folder picker dialog to the user.
   * @param {PickerOptions} options - Configuration for the picker (e.g., mode, title).
   * @returns {Promise<string | null>} A promise that resolves to the selected path, or null if the user cancelled.
   */
  showOpenDialog: (options: PickerOptions): Promise<string | null> => {
    return useFilePickerStore.getState().showPicker(options);
  },

  // ────────────────────────────────────────────────────────
  // EVENT LISTENERS
  // ────────────────────────────────────────────────────────

  /**
   * Fired when the file/folder picker dialog is opened.
   * @param handler Callback function receiving the `PickerOptions` used to open the dialog.
   * @returns A disposable object to unregister the listener.
   */
  onDidOpenFilePicker: (handler: (options: PickerOptions) => void) => {
    return { dispose: msEvents.on('onDidOpenFilePicker', handler) };
  },

  /**
   * Fired when the file/folder picker dialog is closed.
   * @param handler Callback function receiving the selected path as a string, or `null` if the dialog was cancelled.
   * @returns A disposable object to unregister the listener.
   */
  onDidCloseFilePicker: (handler: (selectedPath: string | null) => void) => {
    return { dispose: msEvents.on('onDidCloseFilePicker', handler) };
  }
});









// Extension Code Example:
/*
```javascript
// Listen for when a picker is opened
const openSub = mscode.window.onDidOpenFilePicker((options) => {
    console.log(`User is currently browsing for a ${options.mode}...`);
});

// Listen for when the user makes a selection or cancels
const closeSub = mscode.window.onDidCloseFilePicker((path) => {
    if (path) {
        console.log(`Global listener detected a selection: ${path}`);
    } else {
        console.log(`Global listener detected picker cancellation.`);
    }
});

// Cleanup listeners on deactivation
// openSub.dispose();
// closeSub.dispose();
```
*/