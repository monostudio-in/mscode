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
// import { useTermisStore } from '@/features/termis/store/termisStore';
import { useProblemsStore } from '@/features/termis/components/problems/store/problemsStore';

// Items Events 
import { handleLanguageClick } from '../items/language';
import { handleEncodingClick, getFileEncodingLabel } from '../items/encoding';
import { handleIndentClick } from '../items/indent'; 
import { handleEOLClick } from '../items/eol';

export function useStatusBarSync(editor: monaco.editor.IStandaloneCodeEditor | null) {
  const { registerItem, updateItem } = useStatusBarStore.getState();

  // 1. GLOBAL REGISTRATION EFFECT (Runs once)
  useEffect(() => {
    // Global Items (Always Visible)
    registerItem({ 
      id: 'notif-bell', 
      alignment: 'right', 
      priority: 1000, 
      icon: 'bell', 
      onClick: () => useNotificationStore.getState().toggleCenter(),
      style: { background: 'var(--ms-accent)', padding: '0 10px', color: '#ffffff' }
    });

    registerItem({ 
      id: 'quick-keyboard', 
      alignment: 'right', 
      priority: 45, 
      icon: 'keyboard', 
      tooltip: 'Toggle Action Bar', 
      onClick: () => useQuickKeyboardStore.getState().toggleVisibility() 
    });

    // Editor-Specific Items (Visible ONLY when code editor is active)
    const editorCondition = "activeTabType == 'code'";

    registerItem({ id: 'problems-error', alignment: 'left', priority: 10000, icon: 'error', label: '0', color: '#a44e3c', onClick: () => {}, when: editorCondition });
    registerItem({ id: 'problems-warn', alignment: 'left', priority: 9990, icon: 'warning', label: '0', color: '#6c5e1f', onClick: () => {}, when: editorCondition });
    registerItem({ id: 'cursor-pos', alignment: 'right', priority: 100, label: 'Ln 1, Col 1', when: editorCondition });
    registerItem({ id: 'indent', alignment: 'right', priority: 80, label: 'Spaces: 4', when: editorCondition });
    registerItem({ id: 'encoding', alignment: 'right', priority: 70, label: 'UTF-8', when: editorCondition });
    registerItem({ id: 'eol', alignment: 'right', priority: 60, label: 'LF', when: editorCondition });
    registerItem({ id: 'lang-mode', alignment: 'right', priority: 50, label: 'plaintext', when: editorCondition });

  }, [registerItem]);


  // 2. DATA SYNC EFFECT (Runs when editor exists)
  useEffect(() => {
    if (!editor) return;

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
        onClick: () => usePaletteStore.setState({ isOpen: true, isQuickPick: false, query: ':' })
      });

      updateItem('lang-mode', { label: langId, onClick: () => handleLanguageClick(editor) });
      updateItem('eol', { label: eol, onClick: () => handleEOLClick(editor) });
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
    
    // Listeners
    const listeners = [
      editor.onDidChangeCursorPosition(syncData),
      editor.onDidChangeModelLanguage(syncData),
      editor.onDidChangeConfiguration(syncData),
      editor.onDidFocusEditorText(syncData)
    ];

    const markerListener = monaco.editor.onDidChangeMarkers(() => {
      const markers = monaco.editor.getModelMarkers({});
      useProblemsStore.getState().setMarkers(markers);
      const errCount = markers.filter(m => m.severity === monaco.MarkerSeverity.Error).length;
      const warnCount = markers.filter(m => m.severity === monaco.MarkerSeverity.Warning).length;
      updateItem('problems-error', { label: errCount.toString() });
      updateItem('problems-warn', { label: warnCount.toString() });
    });

    syncData();

    return () => {
      listeners.forEach(l => l.dispose());
      markerListener.dispose();
    };
  }, [editor, updateItem]);
}