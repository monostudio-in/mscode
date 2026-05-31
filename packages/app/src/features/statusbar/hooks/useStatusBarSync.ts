// src/features/statusbar/hooks/useStatusBarSync.ts

import { useEffect } from 'react';
import * as monaco from 'monaco-editor';

// Stores 
import { useStatusBarStore } from '../store/statusBarStore';
import { useTabStore } from '@/store/tabStore';
import { usePaletteStore } from '@/store/paletteStore';
import { useQuickKeyboardStore } from '@/store/quickKeyboardStore'; 
import { useEditorViewStateStore } from '@/features/editor/store/editorViewStateStore';
import { useNotificationStore } from '@/store/notificationStore';

// Items Events 
import { handleLanguageClick } from '../items/language';
import { handleEncodingClick, getFileEncodingLabel } from '../items/encoding';
import { handleIndentClick } from '../items/indent'; 
import { handleEOLClick } from '../items/eol';

import { useTermisStore } from '@/features/termis/store/termisStore';
import { useProblemsStore } from '@/features/termis/components/problems/store/problemsStore';

/**
 * Custom React hook coordinating state synchronization routines between the active 
 * Monaco editor layout instances, telemetry counters, and the application workspace status bar.
 * 
 * @param editor The operational Monaco code editor workspace container or null.
 */
export function useStatusBarSync(editor: monaco.editor.IStandaloneCodeEditor | null) {
  useEffect(() => {
    if (!editor) return;

    const { registerItem, updateItem } = useStatusBarStore.getState();
    
    const openTerminalTab = () => {
      useTabStore.getState().addTab({
        id: 'terminal-main',
        type: 'termis',
        title: 'Termis',
        icon: 'terminal'
      });
      useTermisStore.getState().setActiveView('terminal');
    };
    
    const openProblemsPanel = () => {
      openTerminalTab();
      useTermisStore.getState().setActiveView('problems');
    };

    // Register Left-aligned Problem Items (Highest priority to lock on far left boundary)
    registerItem({ id: 'problems-error', alignment: 'left', priority: 10000, icon: 'error', label: '0', color: '#a44e3c', onClick: openProblemsPanel });
    registerItem({ id: 'problems-warn', alignment: 'left', priority: 9990, icon: 'warning', label: '0', color: '#6c5e1f', onClick: openProblemsPanel });
    
    const syncData = () => {
      const model = editor.getModel();
      const activeTabId = useTabStore.getState().activeTabId;

      if (!model || model.uri.path !== activeTabId) return;

      const pos = editor.getPosition();
      const opts = model.getOptions();
      const langId = model.getLanguageId();
      const eol = model.getEOL() === '\n' ? 'LF' : 'CRLF';

      updateItem('cursor-pos', { 
        label: pos ? `Ln ${pos.lineNumber}, Col ${pos.column}` : 'Ln 1, Col 1',
        onClick: () => {
          usePaletteStore.setState({ isOpen: true, isQuickPick: false, query: ':' });
        }
      });

      updateItem('lang-mode', { label: langId, onClick: () => handleLanguageClick(editor) });
      
      updateItem('eol', { 
        label: eol,
        onClick: () => handleEOLClick(editor) 
      });
      
      updateItem('indent', { 
        label: `${opts.insertSpaces ? 'Spaces' : 'Tab Size'}: ${opts.tabSize}`,
        onClick: () => handleIndentClick(editor)
      });
      
      updateItem('encoding', { 
        label: getFileEncodingLabel(activeTabId), 
        onClick: () => handleEncodingClick(editor) 
      });

      useEditorViewStateStore.getState().updateViewState(activeTabId, {
        cursorLine: pos?.lineNumber,
        cursorColumn: pos?.column,
        languageId: langId,
        tabSize: opts.tabSize,
        insertSpaces: opts.insertSpaces
      });
    };
    
    // Track runtime markers across the platform engine space to evaluate diagnostics metrics
    const markerListener = monaco.editor.onDidChangeMarkers(() => {
      const markers = monaco.editor.getModelMarkers({});
      useProblemsStore.getState().setMarkers(markers);

      const errCount = markers.filter(m => m.severity === monaco.MarkerSeverity.Error).length;
      const warnCount = markers.filter(m => m.severity === monaco.MarkerSeverity.Warning).length;

      updateItem('problems-error', { label: errCount.toString() });
      updateItem('problems-warn', { label: warnCount.toString() });
    });
    
    // Anchor notification drawer toggle anchor securely onto the far right status border channel
    registerItem({ 
      id: 'notif-bell', 
      alignment: 'right', 
      priority: 1000, 
      icon: 'bell', 
      onClick: () => useNotificationStore.getState().toggleCenter(),
      style: {
        boxShadow: 'inset 0 0 1px #000',
        background: 'var(--ms-accent)',
        right: 0,
        position: 'sticky',
        padding: '0 10px',
        color: '#ffffff'
      }
    });
    
    registerItem({ id: 'cursor-pos', alignment: 'right', priority: 100, label: 'Ln 1, Col 1' });
    registerItem({ id: 'indent', alignment: 'right', priority: 80, label: 'Spaces: 4' });
    registerItem({ id: 'encoding', alignment: 'right', priority: 70, label: 'UTF-8' });
    registerItem({ id: 'eol', alignment: 'right', priority: 60, label: 'LF' });
    registerItem({ id: 'lang-mode', alignment: 'right', priority: 50, label: 'plaintext' });
    registerItem({ id: 'quick-keyboard', alignment: 'right', priority: 45, icon: 'keyboard', tooltip: 'Toggle Action Bar', onClick: () => useQuickKeyboardStore.getState().toggleVisibility() });
    
    syncData();

    const listeners = [
      editor.onDidChangeCursorPosition(syncData),
      editor.onDidChangeModelLanguage(syncData),
      editor.onDidChangeConfiguration(syncData),
      editor.onDidFocusEditorText(syncData),
      editor.onDidLayoutChange(syncData) 
    ];
    
    // Subscribe cleanly to layout transitions to prevent message loop feedback traces
    const unsubTabStore = useTabStore.subscribe((state, prevState) => {
      if (state.activeTabId !== prevState.activeTabId) {
        if (state.activeTabId === editor.getModel()?.uri.path) {
          syncData();
        }
      }
    });

    return () => {
      listeners.forEach(l => l.dispose());
      markerListener.dispose();
      unsubTabStore();
    };
  }, [editor]);
}
