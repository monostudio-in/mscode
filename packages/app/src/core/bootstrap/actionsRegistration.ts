// src/core/bootstrap/actionsRegistration.ts
//
// Central registry for all workbench commands.
// Sections (search with the marker to jump):
//   §0  App Exit
//   §1  Theme & Icon Theme
//   §2  Monaco Search & Replace
//   §3  File Operations
//   §4  View / Editor Layout
//   §5  Explorer
//   §6  Palette & Navigation
//   §7  Termis Panel (Terminal / Output / Problems)
//   §8  Snippets

import * as monaco from 'monaco-editor';
import { App as CapacitorApp } from '@capacitor/app';

import { commands }              from '@/core/extensionAPI/registry/commandRegistry';
import { userSnippetsService }   from '@/core/services/userSnippetsService';
import { useTabStore }           from '@/store/tabStore';
import { useEditorViewStateStore } from '@/features/editor/store/editorViewStateStore';
import { usePaletteStore }       from '@/store/paletteStore';
import { useSettingsStore }      from '@/features/settings/store/settingsStore';
import { useExplorerStore }      from '@/features/explorer/store/exploreStore';
import { useFilePickerStore }    from '@/store/filePickerStore';
import { useTermisStore }        from '@/features/termis/store/termisStore';
import { useLanguageStore }      from '@/store/languageStore';
import { themeService }          from '@/core/theme/service/themeService';
import { iconThemeService }      from '@/core/theme/service/iconThemeService';
import { useNotificationStore }  from '@/store/notificationStore';
import { fs }                    from '@/core/fileSystem';


export function bootstrapAction() {
// ─────────────────────────────────────────────────────────────────────────────
// Module-level state
// Kept at module scope so the exit-confirmation handler can read it across
// multiple back-button presses without closure issues.
// ─────────────────────────────────────────────────────────────────────────────
let exitNotifId: string | null = null;


// ─────────────────────────────────────────────────────────────────────────────
// §0  App Exit
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Handles the hardware back-button / quit gesture.
 *
 * First press  → shows a confirmation notification.
 * Second press → if the notification is still visible, cancels and dismisses it
 *                (lets the user stay in the app).
 * "Exit" button inside the notification → calls CapacitorApp.exitApp().
 */
commands.registerCommand('workbench.action.quit', () => {
  const { notifications, removeNotification, addNotification } =
    useNotificationStore.getState();

  // Check whether the exit dialog is already on screen
  const isShowing = exitNotifId && notifications.some(n => n.id === exitNotifId);

  if (isShowing) {
    // Back pressed while dialog is open → cancel exit, dismiss dialog
    removeNotification(exitNotifId!);
    exitNotifId = null;
    return;
  }

  // First press – show the confirmation dialog
  exitNotifId = addNotification({
    type: 'confirmation',
    title: 'Exit MS Code?',
    message: 'Are you sure you want to close the application?',
    source: 'System',
    actions: [
      {
        label: 'Cancel',
        variant: 'type2',
        onClick: () => {
          removeNotification(exitNotifId!);
          exitNotifId = null;
        },
      },
      {
        label: 'Exit',
        variant: 'type1',
        onClick: () => CapacitorApp.exitApp(),
      },
    ],
  });
});


// ─────────────────────────────────────────────────────────────────────────────
// §1  Theme & Icon Theme
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Opens a QuickPick list of all registered color themes.
 * The currently active theme is marked with a checkmark and suffix text.
 */
commands.registerCommand('workbench.action.selectTheme', () => {
  const activeThemeId = themeService.getActiveThemeId();

  const items = themeService.getAllThemes().map(t => ({
    id:        t.definition.id,
    label:     t.definition.name,
    suffix:    t.definition.id === activeThemeId ? ' - configured color theme' : undefined,
    rightIcon: t.definition.id === activeThemeId ? 'check'                     : undefined,
    onSelect:  () => themeService.applyTheme(t.definition.id),
  }));

  usePaletteStore.getState().openQuickPick(
    'Select Color Theme',
    items,
    sel => sel.onSelect?.(),
  );
});

/**
 * Opens a QuickPick list of all registered file-icon themes.
 * The currently active icon theme is marked with a checkmark and suffix text.
 */
commands.registerCommand('workbench.action.selectIconTheme', () => {
  const activeIconId =
    useSettingsStore.getState().settings['workbench.iconTheme'] || 'mscode-icons';

  const items = iconThemeService.getAllThemes().map(t => ({
    id:        t.id,
    label:     t.name,
    suffix:    t.id === activeIconId ? ' - configured icon theme' : undefined,
    rightIcon: t.id === activeIconId ? 'check'                    : undefined,
    onSelect:  () => iconThemeService.applyTheme(t.id),
  }));

  usePaletteStore.getState().openQuickPick(
    'Select File Icon Theme',
    items,
    sel => sel.onSelect?.(),
  );
});


// ─────────────────────────────────────────────────────────────────────────────
// §2  Monaco Search & Replace
// ─────────────────────────────────────────────────────────────────────────────

/** Selects all text in the active Monaco editor. */
commands.registerCommand('editor.action.selectAll', () => {
  const activeEditor = monaco.editor.getEditors()[0];
  if (activeEditor) {
    activeEditor.trigger('keyboard', 'editor.action.selectAll', null);
    activeEditor.focus();
  }
});

/**
 * Opens the Find widget.
 * Accepts an optional editor argument from the command palette so the correct
 * editor instance is targeted even when focus has moved to the palette input.
 */
commands.registerCommand(
  'actions.find',
  (editorArg?: any) => {
    const editor = editorArg || commands.getActiveEditor();
    if (editor) {
      editor.trigger('keyboard', 'actions.find', null);
      editor.focus();
    } else {
      console.error('[FindCommand] No active editor found.');
    }
  },
  { title: 'Edit: Find', category: 'Edit', icon: 'search', shortcut: 'Ctrl+F' },
);

/** Opens the Find & Replace widget in the active editor. */
commands.registerCommand(
  'editor.action.startFindReplaceAction',
  () => {
    const editor =
      monaco.editor.getEditors().find(e => e.hasTextFocus()) ??
      monaco.editor.getEditors()[0];
    editor?.trigger('keyboard', 'editor.action.startFindReplaceAction', null);
  },
  { title: 'Edit: Replace', category: 'Edit', icon: 'replace', shortcut: 'Ctrl+H' },
);

/** Jumps to the next search match in the active editor. */
commands.registerCommand(
  'editor.action.nextMatchFindAction',
  () => {
    const editor =
      monaco.editor.getEditors().find(e => e.hasTextFocus()) ??
      monaco.editor.getEditors()[0];
    editor?.trigger('keyboard', 'editor.action.nextMatchFindAction', null);
  },
  { title: 'Edit: Find Next', category: 'Edit', icon: 'arrow-down', shortcut: 'F3' },
);

/** Jumps to the previous search match in the active editor. */
commands.registerCommand(
  'editor.action.previousMatchFindAction',
  () => {
    const editor =
      monaco.editor.getEditors().find(e => e.hasTextFocus()) ??
      monaco.editor.getEditors()[0];
    editor?.trigger('keyboard', 'editor.action.previousMatchFindAction', null);
  },
  { title: 'Edit: Find Previous', category: 'Edit', icon: 'arrow-up', shortcut: 'Shift+F3' },
);


// ─────────────────────────────────────────────────────────────────────────────
// §3  File Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Saves the currently active file.
 *
 * Primary path  → delegates to the editor's own registered save action so that
 * all save-time hooks (whitespace trimming, hot-exit cleanup,
 * dirty-state sync) run through a single code path.
 * Fallback path → used for non-code tabs (Settings UI, Keybindings UI, etc.)
 * that store content in the view-state store rather than a
 * Monaco model.
 */

commands.registerCommand(
  'workbench.action.files.save',
  async () => {
    const { activeTabId, tabs, updateTab } = useTabStore.getState();
    const { viewStates, setTabDirty } = useEditorViewStateStore.getState();
    if (!activeTabId) return;

    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab?.filePath) return;

    // Is virtual file ?
    const isUntitled = activeTab.filePath.startsWith('untitled') || activeTab.filePath.trim() === '';

    if (isUntitled) {
      // 1. Current Project Folder (Workspace) path 
      const workspacePath = useExplorerStore.getState().workspacePath;
      const defaultFileName = activeTab.title === activeTabId ? 'untitled' : activeTab.title;

      // 2. Open File Picker in 'saveAs'
      const newPath = await useFilePickerStore.getState().showPicker({
        mode: 'saveAs',
        title: 'Save As...',
        defaultPath: workspacePath || 'ROOT',
        defaultName: defaultFileName,
        fileNamePlaceholder: 'Enter file name...',
        filters: [
          { label: 'All Files', extensions: [] },
          { label: 'Text File', extensions: ['txt'] },
          { label: 'JavaScript', extensions: ['js', 'jsx'] },
          { label: 'TypeScript', extensions: ['ts', 'tsx'] },
          { label: 'JSON', extensions: ['json'] },
          { label: 'HTML', extensions: ['html'] },
          { label: 'CSS', extensions: ['css'] }
        ]
      } as any); 

      // newPath directly /my/folder/path/filename.txt will return
      if (newPath && typeof newPath === 'string') {
        
        // 3. Extract content
        const editor = commands.getActiveEditor();
        let content = '';
        if (editor && editor.getModel()) {
          content = editor.getModel()!.getValue();
        } else {
          content = viewStates[activeTabId]?.content || '';
        }

        // 4. Save into real disk
        await fs.writeFile(newPath, content);

        // 5. Update Tab UI
        if (updateTab) {
          const finalFileName = newPath.split('/').pop() || defaultFileName;
          updateTab(activeTabId, { filePath: newPath, title: finalFileName });
        }
        setTabDirty(activeTabId, false);
      }
      return;
    }

    // -------------------------------------------------------------
    // Primary: Normal File Save
    // -------------------------------------------------------------
    const editor = commands.getActiveEditor();
    if (editor) {
      const saveAction = editor.getAction('editor.action.save');
      if (saveAction) {
        await saveAction.run();
        return;
      }
    }

    // Fallback: persist content stored in view-state (non-editor tabs)
    const content = viewStates[activeTabId]?.content;
    if (content !== undefined) {
      await fs.writeFile(activeTab.filePath, content);
      setTabDirty(activeTabId, false);
    }
  },
  { title: 'Save File', category: 'File', icon: 'save', shortcut: 'Ctrl+S' },
);

/**
 * Opens the rename modal for the active file and refreshes the explorer
 * tree afterwards.
 */
commands.registerCommand(
  'workbench.action.renameActiveFile',
  () => {
    window.dispatchEvent(new CustomEvent('ms-open-rename-modal'));
    commands.executeCommand('workbench.files.action.refreshFilesExplorer');
  },
  { title: 'File: Rename Active File', category: 'File', icon: 'edit', shortcut: 'F2' },
);

/**
 * Creates a new untitled editor tab with an auto-incremented name
 * (Untitled-1, Untitled-2, …).
 */
commands.registerCommand(
  'workbench.action.files.newUntitledFile',
  () => {
    const { tabs, addTab } = useTabStore.getState();

    // Find the next available counter so names never collide
    let counter = 1;
    while (tabs.some(t => t.id === `untitled-${counter}`)) counter++;

    const tabId = `untitled-${counter}`;
    addTab({
      id:       tabId,
      type:     'code',
      title:    `Untitled-${counter}`,
      filePath: tabId, // temporary virtual path until the file is saved
      icon:     'new-file',
    });
  },
  { title: 'New File', category: 'File', icon: 'new-file', shortcut: 'Ctrl+N' },
);


// ─────────────────────────────────────────────────────────────────────────────
// §4  View / Editor Layout
// ─────────────────────────────────────────────────────────────────────────────

/** Opens the command palette (prefixed with ">"). */
commands.registerCommand(
  'workbench.action.showCommands',
  () => usePaletteStore.setState({ isOpen: true, isQuickPick: false, query: '>' }),
  { title: 'Show All Commands', category: 'View', shortcut: 'Ctrl+Shift+P' },
);

/** Toggles word-wrap in the editor by flipping the global setting. */
commands.registerCommand(
  'editor.action.toggleWordWrap',
  () => {
    const { settings, updateSetting } = useSettingsStore.getState();
    const next = settings['editor.wordWrap'] === 'on' ? 'off' : 'on';
    updateSetting('editor.wordWrap', next);
  },
  { title: 'Toggle Word Wrap', category: 'View', icon: 'word-wrap', shortcut: 'Alt+Z' },
);

/** Closes all open editor tabs. */
commands.registerCommand(
  'workbench.action.closeAllEditors',
  () => useTabStore.getState().clearTabs(),
  { title: 'Close All', category: 'View' },
);

/** Opens the Settings UI tab. */
commands.registerCommand(
  'workbench.action.openSettings',
  () => {
    useTabStore.getState().addTab({
      id:    'mscode://internal/settings.ui',
      type:  'settings',
      title: 'Settings',
      icon:  'settings',
    });
  },
  { title: 'Open Settings', category: 'Preferences', icon: 'settings', shortcut: 'Ctrl+,' },
);

/** Opens the Keyboard Shortcuts UI tab. */
commands.registerCommand(
  'workbench.action.openGlobalKeybindings',
  () => {
    useTabStore.getState().addTab({
      id:           'mscode://internal/keybindings.ui',
      type:         'keybindings',
      icon:         'keyboard',
      title:        'Key Shortcuts',
      filePath:     'mscode://internal/keybindings.ui',
      showQuickBar: false,
    });
  },
  { title: 'Preferences: Open Keyboard Shortcuts', category: 'Preferences', icon: 'keyboard', shortcut: 'Ctrl+K Ctrl+S' },
);

/** Toggles the status bar visibility via the global setting. */
commands.registerCommand(
  'workbench.action.toggleStatusbarVisibility',
  () => {
    const { settings, updateSetting } = useSettingsStore.getState();
    const isVisible = settings['workbench.statusBar.visible'] ?? true;
    updateSetting('workbench.statusBar.visible', !isVisible);
  },
  { title: 'View: Toggle Status Bar', category: 'View', icon: 'layout-bottom' },
);


// ─────────────────────────────────────────────────────────────────────────────
// §5  Explorer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolves the target parent directory for an inline create action.
 *
 * Resolution order:
 *   1. If a directory is selected → use it directly.
 *   2. If a file is selected       → use its parent directory.
 *   3. Fallback                    → workspace root.
 *
 * Also ensures the target folder is expanded so the inline input is visible.
 */
const resolveCreateTarget = (type: 'newFile' | 'newFolder'): void => {
  const {
    workspacePath,
    selectedItem,
    expandedFolders,
    setInlineAction,
    toggleFolder,
  } = useExplorerStore.getState();

  let targetParentPath = workspacePath || '/';

  if (selectedItem) {
    targetParentPath = selectedItem.isDirectory
      ? selectedItem.path
      : selectedItem.path.substring(0, selectedItem.path.lastIndexOf('/')) ||
        workspacePath ||
        '/';
  }

  setInlineAction({ type, parentPath: targetParentPath, initialValue: '' });

  // Auto-expand the target folder so the inline input row is visible
  if (
    targetParentPath !== workspacePath &&
    !expandedFolders.includes(targetParentPath)
  ) {
    toggleFolder(targetParentPath, true);
  }
};

commands.registerCommand(
  'explorer.newFile',
  () => resolveCreateTarget('newFile'),
  { title: 'Explorer: New File', category: 'File', icon: 'new-file' },
);

commands.registerCommand(
  'explorer.newFolder',
  () => resolveCreateTarget('newFolder'),
  { title: 'Explorer: New Folder', category: 'File', icon: 'new-folder' },
);

/** Triggers a full refresh of the file explorer tree. */
commands.registerCommand(
  'workbench.files.action.refreshFilesExplorer',
  () => useExplorerStore.getState().triggerRefresh(),
  { title: 'Explorer: Refresh', category: 'File', icon: 'refresh' },
);

/**
 * Shows a folder picker and opens the selected directory as the workspace.
 * Reinitialises tabs and view-states for the new workspace.
 */
commands.registerCommand(
  'workbench.action.files.openFolder',
  async () => {
    const selectedPath = await useFilePickerStore.getState().showPicker({
      mode:       'folder',
      title:      'Select Workspace Folder',
      icon:       'folder',
      buttonText: 'Open Workspace',
    });

    if (!selectedPath) return;

    const folderName = selectedPath.split('/').pop() || 'PROJECT';
    useExplorerStore.getState().setWorkspace(folderName, selectedPath);
    await useTabStore.getState().initTabs(selectedPath);
    await useEditorViewStateStore.getState().initViewStates(selectedPath);
    useExplorerStore.getState().triggerRefresh();
  },
  { title: 'File: Open Folder...', category: 'File', icon: 'folder', shortcut: 'Ctrl+K Ctrl+O' },
);

/**
 * Closes the current workspace and resets tabs and view-states back to their
 * initial (no-workspace) state.
 */
commands.registerCommand(
  'workbench.action.closeFolder',
  async () => {
    useExplorerStore.getState().setWorkspace(null, null);
    await useTabStore.getState().initTabs(null);
    await useEditorViewStateStore.getState().initViewStates(null);
    useExplorerStore.getState().triggerRefresh();
  },
  { title: 'File: Close Folder', category: 'File', icon: 'close', shortcut: 'Ctrl+K F' },
);

/** Placeholder for future remote/cloud workspace connection. */
commands.registerCommand(
  'workbench.action.connectRemote',
  () => {
    usePaletteStore.getState().openQuickPick(
      'Connect to Cloud Workspace...',
      [
        {
          id:          'gh',
          label:       'GitHub',
          description: 'Open a remote GitHub repository',
          leftIcon:    'extensions' as const,
          onSelect:    () => console.log('GitHub Connected'),
        },
      ],
      sel => sel.onSelect?.(),
    );
  },
  { title: 'Remote: Connect to Cloud...', category: 'Remote' },
);


// ─────────────────────────────────────────────────────────────────────────────
// §6  Palette & Navigation
// ─────────────────────────────────────────────────────────────────────────────

/** Opens the command palette pre-filled with ":" to trigger Go to Line mode. */
commands.registerCommand(
  'workbench.action.gotoLine',
  () => usePaletteStore.setState({ isOpen: true, isQuickPick: false, query: ':' }),
  { title: 'Go to Line...', category: 'Navigation', shortcut: 'Ctrl+G' },
);

/** Opens the command palette pre-filled with "@" to trigger Go to Symbol mode. */
commands.registerCommand(
  'workbench.action.gotoSymbol',
  () => usePaletteStore.setState({ isOpen: true, isQuickPick: false, query: '@' }),
  { title: 'Go to Symbol in Editor...', category: 'Navigation', shortcut: 'Ctrl+Shift+O' },
);

/** Opens the command palette pre-filled with "/" to show recent files. */
commands.registerCommand(
  'workbench.action.openRecent',
  () => usePaletteStore.setState({ isOpen: true, isQuickPick: false, query: '/' }),
  { title: 'File: Open Recent...', category: 'File', shortcut: 'Ctrl+R' },
);


// ─────────────────────────────────────────────────────────────────────────────
// §7  Termis Panel  (Terminal / Output / Problems)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Opens (or focuses) the Termis panel and switches to the requested view.
 *
 * The Termis tab uses a stable singleton ID ("terminal-main") so calling this
 * command when the panel is already open simply focuses it rather than creating
 * a duplicate tab.
 */
const openTermisView = (view: 'terminal' | 'output' | 'problems'): void => {
  // open termis tab
  useTabStore.getState().addTab({
    id:    'terminal-main',
    type:  'termis',
    title: 'Termis',
    icon:  'terminal',
  });
  //open termis subtab
  useTermisStore.getState().setActiveView(view);
};

commands.registerCommand(
  'termis.open.terminal',
  () => openTermisView('terminal'),
  { title: 'View: Open Terminal', category: 'View', icon: 'terminal', shortcut: 'Ctrl+`' },
);

commands.registerCommand(
  'termis.open.output',
  () => openTermisView('output'),
  { title: 'View: Open Output', category: 'View', icon: 'output', shortcut: 'Ctrl+Shift+U' },
);

commands.registerCommand(
  'termis.open.problems',
  () => openTermisView('problems'),
  { title: 'View: Open Problems', category: 'View', icon: 'error', shortcut: 'Ctrl+Shift+M' },
);


// ─────────────────────────────────────────────────────────────────────────────
// §8  Snippets
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Opens a QuickPick of all registered languages and, on selection, opens or
 * creates the user-snippet file for that language.
 */
commands.registerCommand(
  'workbench.action.openSnippets',
  () => {
    const langs = useLanguageStore.getState().getAvailableLanguages();

    const items = langs.map(l => ({
      id:          l.id,
      label:       l.aliases?.[0] || l.id,
      description: `Configure snippets for ${l.id}`,
      leftIcon:    'json',
      onSelect:    () => userSnippetsService.openSnippetFile(l.id),
    }));

    usePaletteStore.getState().openQuickPick(
      'Select Language for Snippet',
      items,
      sel => sel.onSelect?.(),
    );
  },
  { title: 'Preferences: Configure User Snippets', category: 'Preferences', icon: 'json' },
);


// MENU INSPECTOR 
commands.registerCommand('workbench.action.openMenuInspector', () => {
      useTabStore.getState().addTab({
          id: 'menu-inspector-tab',
          title: 'Menu Inspector',
          icon: 'list-tree',
          type: 'menus',
          showStatusBar : false
      });
  });
  
  
commands.registerCommand('workbench.action.toggleDevTools', () => {
    const suger = (window as any).suger;

    // if (suger) {
      try {
        suger.init();
        // msWindow.toast.success('Developer Tools Launched!');
      } catch (err) {
        console.error('Failed to launch Suger DevTools:', err);
      }
    // } else {
    //   msWindow.toast.error('Suger DevTools not found. Check index.html');
    // }
  });

}