// src/core/extensionAPI/modules/window/sidebarAPI.ts

import { sidebarRegistry, sidebarMenuId } from '../../registry/sidebarRegistry';
import type { SidebarPanelDef, SidebarSectionDef } from '../../registry/sidebarRegistry';
import type { MenuItem } from '@/store/menuStore';
import { useMenuStore }  from '@/store/menuStore';
import { useSidebarStore, type SidebarState } from '@/store/sidebarStore';
import { msEvents } from '@/core/extensionAPI/events/EventManager';

// ─── Public API ───────────────────────────────────────────────────────────────

export const createSidebarAPI = () => ({

  /**
   * ## `mscode.window.sidebar`
   *
   * Full control over the IDE sidebar — layout state, panel focus,
   * custom section registration, dynamic action injection, and event tracking.
   *
   * ### Architecture overview
   *
   * ```
   * ActivityBar icon (id: 'files')
   * └── SidebarPanel  (registered via sidebar.registerPanel)
   * ├── Header  (title + actions[])
   * ├── Section  (collapsible, registered via sidebar.addSection)
   * │     ├── content: React component / JSX / render-prop
   * │     └── actions: MenuItem[]  ← same shape as ContextMenu
   * └── Section  ...
   * ```
   *
   * ### Action system & Auto-Hoisting
   *
   * `actions` use the exact same `MenuItem[]` shape as `openMenu()` / `ContextMenu`.
   * Advanced features include:
   * - **`order`**: Automatically sorts actions before rendering.
   * - **`flat`**: Unpacks structural containers directly into the root level.
   * - **Auto-Hoist**: If a submenu (`children`) has exactly 1 item, it is flattened automatically unless `flat: false` is set.
   *
   * Actions beyond `maxOverflow` (default 3) automatically collapse into a ⋮ menu.
   * Any module can inject extra actions via `sidebar.addAction(targetMenuId, item)`.
   *
   * ### Menu ID convention
   *
   * Every action group has a stable string ID:
   * ```
   * header  → "sidebar/<activityBarId>/header/actions"
   * section → "sidebar/<activityBarId>/<sectionId>/actions"
   * ```
   * Use `sidebar.menuId` helpers to compute these safely.
   */
  sidebar: {

    // ════════════════════════════════════════════════════════════════════════
    // 1. PANEL & SECTION STRUCTURE
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Register a complete sidebar panel tied to an ActivityBar icon.
     *
     * If a panel with the same `activityBarId` already exists it is replaced.
     * Returns a `dispose()` to unregister cleanly on extension deactivation.
     *
     * @example
     * ```ts
     * const dispose = mscode.window.sidebar.registerPanel({
     *   activityBarId: 'database-explorer',
     *   header: {
     *     title: 'Database',
     *     maxOverflow: 2,
     *     actions: [
     *       { id: 'connect', icon: 'plug',     label: 'Connect',    onClick: connect },
     *       { id: 'refresh', icon: 'refresh',  label: 'Refresh',    onClick: refresh },
     *       // ↓ overflows into ⋮ because maxOverflow is 2
     *       { id: 'settings',icon: 'settings', label: 'DB Settings',onClick: openSettings },
     *     ],
     *   },
     *   sections: [
     *     {
     *       id:          'tables',
     *       title:       'Tables',
     *       content:     TablesComponent,
     *       fillHeight:  true,
     *       actions: [
     *         { id: 'new-table', icon: 'add', label: 'New Table', onClick: newTable },
     *       ],
     *     },
     *   ],
     * });
     *
     * // Clean up when the extension is deactivated:
     * context.subscriptions.push({ dispose });
     * ```
     */
    registerPanel: (panelDef: SidebarPanelDef): { dispose: () => void } => {
      const dispose = sidebarRegistry.registerPanel(panelDef);
      return { dispose };
    },

    /**
     * Dynamically inject a collapsible section into an existing panel.
     *
     * If the target panel doesn't exist yet, a header-less panel is created
     * automatically so the section still appears when the panel opens.
     *
     * Returns a `dispose()` that removes the section cleanly.
     *
     * @param activityBarId  Target panel id (e.g. `'files'`, `'git'`)
     * @param sectionDef     Section configuration
     *
     * @example
     * ```ts
     * // Add an "NPM Scripts" section to the Explorer panel
     * const { dispose } = mscode.window.sidebar.addSection('files', {
     *   id:              'npm-scripts',
     *   title:           'NPM Scripts',
     *   content:         NpmScriptsComponent,
     *   defaultExpanded: false,
     *   defaultHeight:   200,
     *   actions: [
     *     { id: 'run-all', icon: 'play', label: 'Run All', onClick: runAll },
     *   ],
     * });
     *
     * // Add a static block (no collapsible chrome) by passing title: ''
     * mscode.window.sidebar.addSection('search', {
     *   id:      'search-controls',
     *   title:   '',          // ← empty title = static block
     *   content: SearchControlsComponent,
     * });
     * ```
     */
    addSection: (
      activityBarId: string,
      sectionDef:    SidebarSectionDef,
    ): { dispose: () => void } => {
      const dispose = sidebarRegistry.addSection(activityBarId, sectionDef);
      return { dispose };
    },

    /**
     * Remove a section from a panel.
     *
     * @example
     * ```ts
     * mscode.window.sidebar.removeSection('files', 'npm-scripts');
     * ```
     */
    removeSection: (activityBarId: string, sectionId: string): void => {
      sidebarRegistry.removeSection(activityBarId, sectionId);
    },

    /**
     * Patch any properties of an existing section without replacing it entirely.
     *
     * Common uses: swap the content component, change title, update actions.
     *
     * @example
     * ```ts
     * // Swap content when the user changes a setting
     * mscode.window.sidebar.updateSection('files', 'file-tree', {
     *   title: 'Workspace — readonly mode',
     * });
     *
     * // Update actions list
     * mscode.window.sidebar.updateSection('files', 'symbols', {
     *   actions: [
     *     { id: 'sort-name', icon: 'sort-precedence', label: 'Sort by Name', onClick: sortByName },
     *     { id: 'sep',       type: 'separator' },   // ← inline | separator
     *     {
     *       id:       'filter',
     *       icon:     'filter',
     *       label:    'Filter',
     *       // Submenu — opens nested context menu on click
     *       children: [
     *         { id: 'show-vars',     label: 'Variables',  onClick: () => {} },
     *         { id: 'show-funcs',    label: 'Functions',  onClick: () => {} },
     *         { id: 'show-classes',  label: 'Classes',    onClick: () => {} },
     *       ],
     *     },
     *   ],
     * });
     * ```
     */
    updateSection: (
      activityBarId: string,
      sectionId:     string,
      patch:         Partial<SidebarSectionDef>,
    ): void => {
      sidebarRegistry.updateSection(activityBarId, sectionId, patch);
    },

    /**
     * Show or hide a section without removing it from the registry.
     * The section resumes from its last state when made visible again.
     *
     * @example
     * ```ts
     * // Hide Timeline from Explorer
     * mscode.window.sidebar.setSectionVisibility('files', 'timeline', false);
     *
     * // Restore it
     * mscode.window.sidebar.setSectionVisibility('files', 'timeline', true);
     * ```
     */
    setSectionVisibility: (
      activityBarId: string,
      sectionId:     string,
      visible:       boolean,
    ): void => {
      sidebarRegistry.setSectionVisibility(activityBarId, sectionId, visible);
    },

    // ════════════════════════════════════════════════════════════════════════
    // 2. ACTION INJECTION
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Helpers to compute stable action group Menu IDs without magic strings.
     *
     * @example
     * ```ts
     * mscode.window.sidebar.menuId.header('files')
     * // → "sidebar/files/header/actions"
     *
     * mscode.window.sidebar.menuId.section('files', 'file-tree')
     * // → "sidebar/files/file-tree/actions"
     * ```
     */
    menuId: sidebarMenuId,

    /**
     * Inject a single action into an existing section's action bar — or the panel header.
     *
     * The action appears at the end of the current list. If the total exceeds
     * `maxOverflow`, it automatically moves into the ⋮ overflow context menu.
     *
     * Returns a `dispose()` to remove the injected action cleanly.
     *
     * @param targetMenuId  Use `sidebar.menuId.*` helpers to get the right ID.
     * @param action        A `MenuItem` — same shape as `openMenu()` items.
     *
     * @example
     * ```ts
     * // Add "Git Blame" to the file-tree section actions from a Git extension
     * const { dispose } = mscode.window.sidebar.addAction(
     *   mscode.window.sidebar.menuId.section('files', 'file-tree'),
     *   {
     *     id:      'git-blame',
     *     icon:    'git-branch',
     *     label:   'Toggle Git Blame',
     *     onClick: () => commands.executeCommand('git.blame.toggle'),
     *   },
     * );
     *
     * // Add a submenu to the Explorer header
     * mscode.window.sidebar.addAction(
     *   mscode.window.sidebar.menuId.header('files'),
     *   {
     *     id:    'run-scripts',
     *     icon:  'play',
     *     label: 'Run Script',
     *     children: [
     *       { id: 'build', label: 'Build',  onClick: () => runScript('build') },
     *       { id: 'test',  label: 'Test',   onClick: () => runScript('test')  },
     *       { id: 'sep',   type: 'separator' },
     *       { id: 'clean', label: 'Clean',  onClick: () => runScript('clean') },
     *     ],
     *   },
     * );
     * ```
     */
    addAction: (
      targetMenuId: string,
      action:       MenuItem,
    ): { dispose: () => void } => {
      useMenuStore.getState().registerMenuItem(targetMenuId, action);
      return {
        dispose: () => useMenuStore.getState().unregisterMenuItem(targetMenuId, action.id),
      };
    },

    /**
     * Remove a previously injected action by its id.
     *
     * @example
     * ```ts
     * mscode.window.sidebar.removeAction(
     *   mscode.window.sidebar.menuId.section('files', 'file-tree'),
     *   'git-blame',
     * );
     * ```
     */
    removeAction: (targetMenuId: string, actionId: string): void => {
      useMenuStore.getState().unregisterMenuItem(targetMenuId, actionId);
    },

    // ════════════════════════════════════════════════════════════════════════
    // 3. VISIBILITY & FOCUS
    // ════════════════════════════════════════════════════════════════════════

    /**
     * The id of the currently active panel (e.g. `'files'`, `'git'`, `'search'`).
     *
     * @example
     * ```ts
     * if (mscode.window.sidebar.activePanel === 'git') { ... }
     * ```
     */
    get activePanel(): string {
      return useSidebarStore.getState().activePanel;
    },

    /**
     * Current sidebar layout state: `'expanded' | 'collapsed' | 'hidden'`.
     *
     * @example
     * ```ts
     * const isVisible = mscode.window.sidebar.state !== 'hidden';
     * ```
     */
    get state(): SidebarState {
      return useSidebarStore.getState().state;
    },

    /**
     * Programmatically set the sidebar layout state.
     *
     * @example
     * ```ts
     * mscode.window.sidebar.setState('hidden');    // collapse entirely
     * mscode.window.sidebar.setState('expanded');  // open fully
     * mscode.window.sidebar.setState('collapsed'); // show only icons
     * ```
     */
    setState: (newState: SidebarState): void => {
      useSidebarStore.getState().setState(newState);
    },

    /**
     * Focus a specific panel — opens the sidebar if it was hidden.
     * Equivalent to the user clicking the ActivityBar icon.
     *
     * @example
     * ```ts
     * // Jump to Source Control from a command
     * mscode.window.sidebar.focusPanel('git');
     *
     * // Open a custom extension panel
     * mscode.window.sidebar.focusPanel('database-explorer');
     * ```
     */
    focusPanel: (panelId: string): void => {
      const store = useSidebarStore.getState();
      if (store.activePanel !== panelId || store.state === 'hidden') {
        store.clickActivityIcon(panelId);
      }
    },

    // ════════════════════════════════════════════════════════════════════════
    // 4. EVENTS
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Fires whenever the sidebar layout state changes
     * (`'expanded'` ↔ `'collapsed'` ↔ `'hidden'`).
     *
     * @example
     * ```ts
     * const sub = mscode.window.sidebar.onDidChangeState(state => {
     *   if (state === 'hidden') pauseExpensiveUpdates();
     *   else                    resumeUpdates();
     * });
     *
     * // Unsubscribe when the extension deactivates:
     * context.subscriptions.push(sub);
     * ```
     */
    onDidChangeState: (
      handler: (state: SidebarState) => void,
    ): { dispose: () => void } => ({
      dispose: msEvents.on('onDidChangeSidebarState', handler),
    }),

    /**
     * Fires whenever the user switches to a different panel.
     *
     * @example
     * ```ts
     * mscode.window.sidebar.onDidChangeActivePanel(panelId => {
     *   if (panelId === 'git') refreshGitStatus();
     * });
     * ```
     */
    onDidChangeActivePanel: (
      handler: (panelId: string) => void,
    ): { dispose: () => void } => ({
      dispose: msEvents.on('onDidChangeActiveSidebarPanel', handler),
    }),

    /**
     * Fires when the user drags the sidebar resize handle.
     *
     * @example
     * ```ts
     * mscode.window.sidebar.onDidChangeWidth(px => {
     *   console.log(`Sidebar is now ${px}px wide`);
     * });
     * ```
     */
    onDidChangeWidth: (
      handler: (width: number) => void,
    ): { dispose: () => void } => ({
      dispose: msEvents.on('onDidChangeSidebarWidth', handler),
    }),
  },
});