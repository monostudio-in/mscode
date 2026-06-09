// src/core/extensionAPI/modules/menusModule.ts
//
// Dynamic context menu / toolbar item registration.
// Extensions add items to editor context menus, the activity bar, etc.

import { useMenuStore } from '@/store/menuStore';
import type { MenuItem } from '@/store/menuStore';

export const createMenusModule = (_extId: string) => ({
  /**
   * Registers a single dynamic menu item into a named menu path (Panel ID).
   * * ** Advanced Progressive/Deep Merge Override System:**
   * MS Code uses a highly advanced deep-merge resolution engine. 
   * - If multiple extensions register an item to the SAME `menuPath` and `id`, they merge!
   * - **Implicit Children Rule:** It is highly recommended to place your execution logic inside the `children` array.
   * - **Auto-Flattening (The Magic Rule):** If an Option ID contains EXACTLY ONE child, it "flattens" out and acts as a direct Action Button.
   *
   * @param menuPath Target Panel ID (e.g., 'editor/title', 'editor/context').
   * @param item Defines the action, icon, submenu (children), ordering, and structural flatness.
   * @returns A disposable object to remove the item on deactivate.
   */
  registerMenuItem: (menuPath: string, item: MenuItem) => {
    useMenuStore.getState().registerMenuItem(menuPath, item);
    return {
      dispose: () => useMenuStore.getState().unregisterMenuItem(menuPath, item.id),
    };
  },
  
  /**
   * Registers multiple dynamic menu items or complete blocks (with separators) 
   * into a named menu path at once. 
   * Returns a batch disposable to clean up all injected items on extension deactivate.
   * * @param menuPath Target Panel ID (e.g., 'editor/title', 'editor/context').
   * @param items Array of MenuItem objects including separators.
   */
  registerMenuItems: (menuPath: string, items: MenuItem[]) => {
    useMenuStore.getState().registerMenuItems(menuPath, items);
    return {
      dispose: () => {
        const itemIds = items.map(item => item.id);
        useMenuStore.getState().unregisterMenuItems(menuPath, itemIds);
      },
    };
  },
});

export type MenusModule = ReturnType<typeof createMenusModule>;

/**
 * ─── EXTENSION API USAGE EXAMPLES & BEST PRACTICES ────────────────────────
 * 
 * @example
 * // =========================================================================
 * // SCENARIO 1: The Proper Way (Recommended)
 * // Registering an action using the 'children' array.
 * // Result: Shows a direct 'Play' icon. Why? Because Auto-Flattening kicks in 
 * // for single children! The child's order (10) becomes the main order.
 * // =========================================================================
 * const properWay = mscode.menus.registerMenuItem('editor/title', {
 *   id: 'coderunner.run-btn', // The Anchor / Option ID
 *   label: 'Run Code',
 *   icon: 'play',
 *   children: [
 *     {
 *       id: 'coderunner.run-action', // The Child ID
 *       label: 'Run with Code Runner',
 *       icon: 'zap',
 *       order: 10, 
 *       onClick: () => mscode.commands.executeCommand('coderunner.run')
 *     }
 *   ]
 * });
 * 
 * @example
 * // =========================================================================
 * // SCENARIO 2: Extending an Existing Button (The Deep Merge Magic!)
 * // If another extension runs this, it injects a new child into the EXISTING 
 * // 'coderunner.run-btn'. 
 * // Result: The single 'Play' button instantly transforms into a Dropdown Menu 
 * // containing TWO options, sorted by their internal child order!
 * // =========================================================================
 * const injectNewOption = mscode.menus.registerMenuItem('editor/title', {
 *   id: 'coderunner.run-btn', // Targeting the existing Anchor ID
 *   children: [
 *     {
 *       id: 'other-ext.run-in-terminal',
 *       label: 'Run in Terminal',
 *       icon: 'terminal',
 *       order: 20, // Places this below the original 'Run with Code Runner' option
 *       onClick: () => mscode.commands.executeCommand('other.terminalRun')
 *     }
 *   ]
 * });
 *
 * @example
 * // =========================================================================
 * // SCENARIO 3: The Lazy Way (Auto Implicit Child)
 * // If a developer provides an 'onClick' directly WITHOUT 'children', MS Code
 * // automatically converts it to: children: [{ id: 'myExt.fastAction.children-1' }]
 * // =========================================================================
 * const lazyWay = mscode.menus.registerMenuItem('editor/title', {
 *   id: 'myExt.fastAction',
 *   label: 'Fast Action',
 *   icon: 'rocket',
 *   order: 50,
 *   onClick: () => console.log('I was auto-wrapped!')
 * });
 * 
 * @example
 * // =========================================================================
 * // SCENARIO 4: Overriding Labels/Icons safely
 * // You can override just the label of an existing item without breaking its onClick logic!
 * // =========================================================================
 * const overrideLabel = mscode.menus.registerMenuItem('editor/title', {
 *   id: 'coderunner.run-btn',
 *   children: [
 *     {
 *       id: 'coderunner.run-action', // Targeting the exact Child ID
 *       label: 'Run Code (Renamed by me!)' // Only label changes, everything else remains intact!
 *     }
 *   ]
 * });
 */