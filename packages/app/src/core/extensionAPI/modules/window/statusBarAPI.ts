// src/core/extensionAPI/modules/window/statusBarAPI.ts

import { statusBarRegistry } from '@/core/extensionAPI/registry/statusBarRegistry';
import { useStatusBarStore, type StatusBarItem } from '@/features/statusbar/store/statusBarStore';

export const createStatusBarAPI = (extId: string) => ({
  
  statusBar: {
    /**
     * Registers a new item into the Mono Studio Status Bar.
     * @param options Configuration for the status bar item.
     * @returns An object to update properties or cleanly remove the item.
     */
    registerItem: (options: Omit<StatusBarItem, 'id'> & { id: string }) => {
      // 1. Namespace the ID
      const fullId = options.id.startsWith(`${extId}.`) ? options.id : `${extId}.${options.id}`;
      
      const itemToRegister: StatusBarItem = {
        ...options,
        id: fullId,
        priority: options.priority ?? 0,
        alignment: options.alignment ?? 'left',
      };

      // 2. Save to Core Extension Registry (The Brain)
      statusBarRegistry.register(itemToRegister);
      
      // 3. Dispatch to Zustand Store to trigger UI Render (The Face)
      useStatusBarStore.getState().registerItem(itemToRegister);

      // 4. Return the API Controller for this specific item
      return {
        /**
         * Dynamically updates the item's properties (e.g., text, icon, color).
         * @param patch The properties to update.
         */
        update: (patch: Partial<Omit<StatusBarItem, 'id'>>) => {
          // Update both Registry and Store
          const currentItem = statusBarRegistry.getAll().find(i => i.id === fullId);
          if (currentItem) {
            statusBarRegistry.register({ ...currentItem, ...patch });
          }
          useStatusBarStore.getState().updateItem(fullId, patch);
        },
        
        /** Removes the item completely */
        dispose: () => {
          statusBarRegistry.unregister(fullId);
          useStatusBarStore.getState().removeItem(fullId);
        }
      };
    }
  }
});