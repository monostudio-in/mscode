// src/core/extensionAPI/modules/window/quickPickAPI.ts

import { usePaletteStore } from '@/store/paletteStore';
import type { QuickPickItem } from '@/store/paletteStore';

/**
 * Factory function to create the QuickPick API.
 * Allows extensions to prompt the user to select from a list of items using the Palette UI.
 */
export const createQuickPickAPI = () => ({
  /**
   * Shows a selection list to the user.
   * @param {QuickPickItem[]} items - The array of items to display in the list.
   * @param {Object} [options] - Configuration options for the QuickPick.
   * @param {string} [options.placeHolder] - Text to display in the input field as a hint.
   * @returns {Promise<QuickPickItem | undefined>} A promise that resolves to the selected item, 
   * or undefined if the user cancels the selection.
   */
  showQuickPick: (items: QuickPickItem[], options?: { placeHolder?: string }): Promise<QuickPickItem | undefined> => {
    return new Promise((resolve) => {
      usePaletteStore.getState().openQuickPick(
        options?.placeHolder || 'Select an option...',
        items,
        (selectedItem) => {
          // Resolve the promise with the selected item and close the palette
          resolve(selectedItem);
          usePaletteStore.getState().closePalette();
        }
      );
      
      /** 
       * Note: If a cancellation mechanism (Esc/Blur) is added to paletteStore in the future,
       * an 'onCancel' hook should be implemented here to resolve with 'undefined'.
       */
    });
  }
});

