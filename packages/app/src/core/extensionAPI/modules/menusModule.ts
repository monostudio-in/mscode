// src/core/extensionAPI/modules/menusModule.ts
//
// Dynamic context menu / toolbar item registration.
// Extensions add items to editor context menus, the activity bar, etc.

import { useMenuStore } from '@/store/menuStore';
import type { MenuItem } from '@/store/menuStore';

export const createMenusModule = (_extId: string) => ({
  /**
   * Register a single dynamic menu item into a named menu path.
   * Returns a disposable to remove the item on deactivate.
   *
   * @param menuPath Target path (e.g., 'editor/context', 'sidebar/files/file-tree/actions')
   * @param item Defines the action, icon, submenu (children), ordering, and structural flatness.
   *
   * @example
   * const item = mscode.menus.registerItem('editor/title/context', {
   * id:      'myExt.runFile',
   * label:   'Run File',
   * icon:    'play',
   * order:   0,
   * onClick: () => console.log("Run executed!")
   * });
   * // Later: item.dispose();
   */
  registerItem: (menuPath: string, item: MenuItem) => {
    useMenuStore.getState().registerMenuItem(menuPath, item);
    return {
      dispose: () => useMenuStore.getState().unregisterMenuItem(menuPath, item.id),
    };
  },
  
  /**
   * Register multiple dynamic menu items or complete blocks (with separators) 
   * into a named menu path at once. 
   * Returns a batch disposable to clean up all injected items on extension deactivate.
   * * @param menuPath Target path (e.g., 'editor/title', 'editor/context')
   * @param items Array of MenuItem objects including separators.
   * * @example
   * const batch = mscode.menus.registerItems('editor/title', [
   * { id: 'ext-feat-1', label: 'Feature One', icon: 'zap', order: 210 },
   * { id: 'ext-sep-1',  type: 'separator', order: 215 },
   * { 
   *    id: 'ext-feat-2', 
   *    label: 'Feature Two', 
   *    icon: 'gear', 
   *    order: 220 ,
   *    showOnlyWhenSubOptionAvailable: true,
   *    children: [
   *       { id: 'sub-option-a',  label: 'Option A',  icon: 'verified-filled',  order: 0, onClick: () => commands.executeCommand('extension.myext.a')  },
   *       { id: 'sub-option-b',    label: 'Option B',   icon: 'verified-filled', order: 1, onClick: () => commands.executeCommand('extension.myext.b')   },
   *    ],
   * }
   * ]);
   */
  registerItems: (menuPath: string, items: MenuItem[]) => {
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
 * ─── EXTENSION API USAGE EXAMPLES ─────────────────────────────────────────
 * * @example
 * function activate(context) {
 * * // 1. Adding a single simple item to the editor context menu
 * const translateBtn = mscode.menus.registerItem('editor/context', {
 * id: 'ext-translate',
 * label: 'Translate to Bengali',
 * icon: 'globe',
 * when: 'workspacePath != null',
 * onClick: () => mscode.window.showInformationMessage('Translating...')
 * });
 * * // 2. Injecting MULTIPLE items at once with a SEPARATOR between them
 * //    Notice the unique IDs and explicitly mapped incremental 'order' property.
 * const myToolGroup = mscode.menus.registerItems('editor/title', [
 * {
 * id: 'myExt.compile',
 * label: 'Compile Build',
 * icon: 'package',
 * order: 250, // Lands inside the user/extension block space
 * onClick: () => mscode.commands.executeCommand('ext.compileProject')
 * },
 * {
 * id: 'myExt.sep.tools',
 * type: 'separator', // Creates a clean visual line between buttons
 * order: 255          // Placed strictly between 250 and 260
 * },
 * {
 * id: 'myExt.deploy',
 * label: 'Deploy to Cloud',
 * icon: 'cloud-upload',
 * order: 260,
 * onClick: () => mscode.commands.executeCommand('ext.cloudDeploy')
 * }
 * ]);
 * * // 3. Injecting an advanced 'Flat Unpacked' container item
 * const advancedTools = mscode.menus.registerItem('sidebar/files/header/actions', {
 * id: 'ext-tools-container',
 * flat: true, // Unpacks children directly into the parent header menu!
 * order: 10,
 * children: [
 * { id: 'ext-subtool-1', icon: 'zap', label: 'Magic Tool' },
 * { id: 'ext-subtool-2', icon: 'bug', label: 'Debug Mode' }
 * ]
 * });
 * * // Push all disposables to subscription stack for absolute lifecycle cleanups
 * context.subscriptions.push(translateBtn, myToolGroup, advancedTools);
 * }
 */