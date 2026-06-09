// src/core/extensionAPI/modules/window/quickPickAPI.ts

import { usePaletteStore } from '@/store/paletteStore';
import type { QuickPickItem } from '@/store/paletteStore';

export const createQuickPickAPI = () => ({
  
  showQuickPick: (
    items: QuickPickItem[] | ((query: string) => QuickPickItem[]), 
    options?: { placeHolder?: string }
  ): Promise<QuickPickItem | undefined> => {
    return new Promise((resolve) => {
      usePaletteStore.getState().openQuickPick(
        options?.placeHolder || 'Select an option...',
        items,
        (selectedItem) => {
          resolve(selectedItem);
          usePaletteStore.getState().closePalette();
        }
      );
    });
  },

  showInputBox: (options?: { placeHolder?: string }): Promise<string | undefined> => {
    return new Promise((resolve) => {
      usePaletteStore.getState().openInputBox(
        options?.placeHolder || 'Type here...',
        (inputValue) => {
          resolve(inputValue);
          usePaletteStore.getState().closePalette();
        }
      );
    });
  }

});