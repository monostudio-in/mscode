// src/core/bootstrap/contextKeysBootstrap.ts

import { contextKeyService } from '@/core/keybindings/contextKeyService';
import { useTabStore } from '@/store/tabStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';

/**
 * Basic language mapper to derive Monaco Language IDs from file extensions.
 */
const getLangIdFromExt = (ext: string): string => {
  const map: Record<string, string> = {
    'json': 'json', 'js': 'javascript', 'ts': 'typescript',
    'jsx': 'javascriptreact', 'tsx': 'typescriptreact',
    'py': 'python', 'html': 'html', 'css': 'css', 'md': 'markdown',
    'cpp': 'cpp', 'c': 'c', 'cs': 'csharp', 'java': 'java', 'go': 'go'
  };
  return map[ext.replace('.', '')] || '';
};

/**
 * VS Code Style Context Key Definitions.
 * These are strictly typed singleton references to specific context flags.
 */
export const GlobalContexts = {
  // ── Workspace States ──
  IsWorkspaceOpen: contextKeyService.createKey<boolean>('isWorkspaceOpen', false),
  
  // ── Tab & View States ──
  HasActiveTab:    contextKeyService.createKey<boolean>('hasActiveTab', false),
  ActiveTabId:     contextKeyService.createKey<string>('activeTabId', ''),       // For targeting specific pages
  ActiveTabType:   contextKeyService.createKey<string>('activeTabType', ''),     // e.g., 'code', 'page', 'custom'
  HasFilePath:     contextKeyService.createKey<boolean>('hasFilePath', false),
  EditorTextFocus: contextKeyService.createKey<boolean>('editorTextFocus', false),
  TerminalFocus:   contextKeyService.createKey<boolean>('terminalFocus', false),
  
  // ── File Type & Language States ──
  ActiveTabExt:    contextKeyService.createKey<string>('activeTabExt', ''),       // e.g., '.json', '.ts'
  ActiveTabLangId: contextKeyService.createKey<string>('activeTabLangId', ''),    // e.g., 'json', 'typescript'
  
  // ── Platform States ──
  IsMac: contextKeyService.createKey<boolean>('isMac', navigator.platform.toUpperCase().indexOf('MAC') >= 0),
  IsWeb: contextKeyService.createKey<boolean>('isWeb', typeof window !== 'undefined' && !('Capacitor' in window)),
};

/**
 * Bootstraps the reactive synchronization between Zustand stores and the Context Engine.
 * Must be called once during app startup.
 */
export function registerGlobalContexts() {
  
  // 1. Sync Tab Store State -> Context Keys (Reactive)
  const syncTabContexts = (state: ReturnType<typeof useTabStore.getState>) => {
    const activeTab = state.tabs.find(t => t.id === state.activeTabId);
    
    // Core Tab States
    GlobalContexts.IsWorkspaceOpen.set(!!state.currentWorkspacePath);
    GlobalContexts.HasActiveTab.set(!!activeTab);
    
    // Dynamic Active Tab Contexts
    GlobalContexts.ActiveTabId.set(state.activeTabId || '');
    GlobalContexts.ActiveTabType.set(activeTab?.type || '');
    GlobalContexts.HasFilePath.set(!!activeTab?.filePath);
    GlobalContexts.EditorTextFocus.set(activeTab?.type === 'code');
    GlobalContexts.TerminalFocus.set(activeTab?.type === 'termis');

    // Extract Extension & Language ID for Conditional Rendering
    let ext = '';
    if (activeTab?.filePath || activeTab?.title) {
      const name = activeTab.filePath || activeTab.title;
      const match = name.match(/\.[0-9a-z]+$/i);
      ext = match ? match[0].toLowerCase() : ''; // result: '.json'
    }
    
    GlobalContexts.ActiveTabExt.set(ext);
    GlobalContexts.ActiveTabLangId.set(getLangIdFromExt(ext));
  };

  // 2. Sync Settings -> Context Keys (supports "config.editor.wordWrap" dynamically)
  const syncSettingsContexts = (state: ReturnType<typeof useSettingsStore.getState>) => {
    Object.entries(state.settings).forEach(([key, value]) => {
      // Any setting user adds will automatically become a context key!
      contextKeyService.setContext(`config.${key}`, value);
    });
  };

  // ── Initial Boot Sync ──
  syncTabContexts(useTabStore.getState());
  syncSettingsContexts(useSettingsStore.getState());

  // ── Subscribe to Future Changes ──
  useTabStore.subscribe(syncTabContexts);
  useSettingsStore.subscribe(syncSettingsContexts);
}