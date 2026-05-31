// src/core/extensionAPI/modules/window/statusBarAPI.ts

import { useStatusBarStore, type StatusBarAlignment } from '@/features/statusbar/store/statusBarStore';
import { commands } from '@/core/extensionAPI/registry/commandRegistry';

/**
 * Interface representing a Status Bar Item created by an extension.
 * Allows dynamic updates to text, icons, tooltips, and click commands.
 */
export interface StatusBarItemAPI {
  /** The universally unique identifier generated for this item. */
  readonly id: string;
  /** The alignment position ('left' or 'right') in the status bar. */
  readonly alignment: StatusBarAlignment;
  /** The layout priority. Higher numbers are placed closer to the outer edges. */
  readonly priority: number;

  /** Updates the text/label displayed in the status bar. */
  text: string;
  /** Updates the hover tooltip text shown to the user. */
  tooltip: string;
  /** Updates the foreground color of the item (e.g., 'var(--ms-error)' or '#ff0000'). */
  color: string;
  /** Updates the icon displayed next to the text (e.g., 'sync', 'check'). */
  icon: string;
  /** * Sets the ID of a registered command to execute when the item is clicked. 
   * @example myItem.command = 'myExtension.runLinter';
   */
  command: string;

  /** Makes the item visible in the status bar. */
  show: () => void;
  /** Hides the item from the status bar without destroying it. */
  hide: () => void;
  /** Completely removes the item and cleans up memory resources. */
  dispose: () => void;
}

/**
 * Factory function to create the StatusBar API for a specific extension.
 * @param {string} extId - The unique identifier of the extension creating the status bar item.
 */
export const createStatusBarAPI = (extId: string) => ({
  
  /**
   * Creates a new status bar item. The item is initially hidden and must be explicitly shown.
   * * @param {StatusBarAlignment} [alignment='left'] - Position of the item ('left' or 'right').
   * @param {number} [priority=0] - Layout priority (higher numbers appear closer to the edges).
   * @returns {StatusBarItemAPI} An object to control the status bar item's properties.
   * * @example
   * // 1. Create the item (aligned left, high priority to be near the edge)
   * const prettierStatus = mscode.window.createStatusBarItem('left', 100);
   * * // 2. Configure properties
   * prettierStatus.text = "Prettier";
   * prettierStatus.tooltip = "Prettier is running";
   * prettierStatus.icon = "check";
   * prettierStatus.command = "prettier.formatDocument";
   * * // 3. Make it visible
   * prettierStatus.show();
   * * // 4. Update it dynamically later (e.g., on error)
   * prettierStatus.color = "var(--ms-error)";
   * prettierStatus.icon = "warning";
   * prettierStatus.tooltip = "Prettier syntax error";
   * * // 5. Cleanup when extension deactivates
   * prettierStatus.dispose();
   */
  createStatusBarItem: (alignment: StatusBarAlignment = 'left', priority: number = 0): StatusBarItemAPI => {
    // Generate a secure unique ID for the item
    const id = `${extId}-statusbar-${Math.random().toString(36).substr(2, 9)}`;
    const store = useStatusBarStore.getState();

    // Register initially as a hidden item (standard IDE behavior)
    store.registerItem({ id, alignment, priority, hidden: true });

    return {
      get id() { return id; },
      get alignment() { return alignment; },
      get priority() { return priority; },

      set text(value: string) { store.updateItem(id, { label: value }); },
      set tooltip(value: string) { store.updateItem(id, { tooltip: value }); },
      set color(value: string) { store.updateItem(id, { color: value }); },
      set icon(value: string) { store.updateItem(id, { icon: value }); },
      
      set command(commandId: string) {
        store.updateItem(id, {
          onClick: () => commands.executeCommand(commandId)
        });
      },

      show: () => store.updateItem(id, { hidden: false }),
      hide: () => store.updateItem(id, { hidden: true }),
      dispose: () => store.removeItem(id),
    };
  }
});