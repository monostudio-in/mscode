// src/core/extensionAPI/modules/window/activityBarAPI.ts

import { useActivityBarStore } from '@/store/activityBarStore';
import { activityBarRegistry, type ActivityBarItem } from '@/core/extensionAPI/registry/activityBarRegistry';
import { msEvents } from '@/core/extensionAPI/events/EventManager';

/**
 * Factory function to create the Activity Bar API.
 * Enables extensions to contribute icons to the primary side container (Activity Bar).
 * * @param {string} extId - The unique identifier of the extension.
 */
export const createActivityBarAPI = (extId: string) => ({
  
  activityBar: {
    
    /**
     * Registers a new item/icon to the Activity Bar.
     * Items registered here typically represent primary views (like Explorer, Search, or Git).
     * 
     * @param options - Configuration for the activity bar item.
     * @returns A disposable object to remove the item from the Activity Bar.
     * 
     * @example
     * const myView = mscode.window.activityBar.registerItem({
     *   id: 'my-plugin-view',
     *   title: 'Plugin Manager',
     *   icon: 'package',
     *   openSidebarContent: true
     * });
     */
    registerItem: (options: Omit<ActivityBarItem, 'id'> & { id: string }) => {
      // Generate a namespaced ID to prevent collisions between extensions
      const fullId = options.id.startsWith(`${extId}.`) ? options.id : `${extId}.${options.id}`;
      
      activityBarRegistry.register({
        ...options,
        id: fullId,
        priority: options.priority ?? 100, // Default fallback
      });
      
      // Refresh the store to trigger a UI re-render
      useActivityBarStore.getState().refreshItems();

      return {
        /** Unregisters the item and refreshes the Activity Bar UI. */
        dispose: () => {
          activityBarRegistry.unregister(fullId);
          useActivityBarStore.getState().refreshItems();
        }
      };
    },

    // ────────────────────────────────────────────────────────
    // EVENT LISTENERS
    // ────────────────────────────────────────────────────────

    /**
     * Fired when the list of Activity Bar items changes (e.g., when an item is added or removed).
     * @param handler - Callback function receiving the updated array of ActivityBarItem objects.
     * @returns An object with a dispose method to unsubscribe from the event.
     */
    onDidChangeItems: (handler: (items: ActivityBarItem[]) => void) => {
      return { dispose: msEvents.on('onDidChangeActivityBarItems', handler) };
    }
  }
});