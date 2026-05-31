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
  /**
   * Adds a new item/icon to the Activity Bar.
   * Items registered here typically represent primary views (like Explorer, Search, or Git).
   * * @param {Object} options - Configuration for the activity bar item.
   * @param {string} options.id - Local identifier for the item.
   * @param {string} options.title - Tooltip and accessible name for the icon.
   * @param {string} options.icon - The icon name or path to display.
   * @param {Function} [options.onClick] - Optional callback triggered when the icon is clicked.
   * * @example
   * const myView = mscode.window.createActivityBarItem({
   * id: 'my-plugin-view',
   * title: 'Plugin Manager',
   * icon: 'package',
   * onClick: () => console.log('View opened')
   * });
   * * @returns {Object} A disposable object to remove the item from the Activity Bar.
   */
  createActivityBarItem: (options: { id: string; title: string; icon: string; onClick?: () => void }) => {
    // Generate a namespaced ID to prevent collisions between extensions
    const fullId = `${extId}.${options.id}`;
    
    activityBarRegistry.registerItem({
      id: fullId,
      label: options.title,
      icon: options.icon,
      priority: 0,
      onClick: options.onClick || (() => {})
    });
    
    // Refresh the store to trigger a UI re-render
    useActivityBarStore.getState().refreshItems();

    return {
      /** Unregisters the item and refreshes the Activity Bar UI. */
      dispose: () => {
        activityBarRegistry.unregisterItem(fullId);
        useActivityBarStore.getState().refreshItems();
      }
    };
  },

  // ────────────────────────────────────────────────────────
  // EVENT LISTENERS
  // ────────────────────────────────────────────────────────

  /**
   * Fired when the list of Activity Bar items changes (e.g., when an item is added or removed).
   * * @param {Function} handler - Callback function receiving the updated array of ActivityBarItem objects.
   * @returns {Object} An object with a dispose method to unsubscribe from the event.
   */
  onDidChangeActivityBarItems: (handler: (items: ActivityBarItem[]) => void) => {
    return { dispose: msEvents.on('onDidChangeActivityBarItems', handler) };
  }
});