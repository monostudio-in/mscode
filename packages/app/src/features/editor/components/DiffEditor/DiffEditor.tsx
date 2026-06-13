// src/features/editor/components/DiffEditor/DiffEditor.tsx

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DiffEditor as MonacoDiffEditor, useMonaco } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { Keyboard } from '@capacitor/keyboard';

// ── Stores & System ────────────────────────────────────────────────────────
import { useTabStore } from '@/store/tabStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { useThemeStore } from '@/core/theme/store/themeStore';
import { useEditorViewStateStore } from '@/features/editor/store/editorViewStateStore';
import { buildMonacoOptions } from '../../monaco/monacoOptions';
import { fs } from '@/core/fileSystem';
import { useEditorMenuStore } from '@/features/editor/components/EditorMenu/store/editorMenuStore';

// ── Touch & Mobile Interaction Hooks ───────────────────────────────────────
import { useEditorRefs } from '../../hooks/useEditorRefs';
import { useKeyboardHandler } from '../../hooks/useKeyboardHandler';
import { useTouchInterceptors } from '../../hooks/useTouchInterceptors';
import { useTeardrops } from '../../components/Teardrops/hooks/useTeardrops';
import { useTeardropsDrag } from '../../components/Teardrops/hooks/useTeardropsDrag';
import { useTouchScroll } from '../../hooks/useTouchScroll';
import { useContextMenuSetup } from '../../hooks/useContextMenuSetup';

// ── UI Components ──────────────────────────────────────────────────────────
import { TeardropsOverlay } from '../../components/Teardrops/TeardropsOverlay';
import '../../CodeEditor.css';

export interface DiffEditorProps {
  tabId: string;
}

export const DiffEditor: React.FC<DiffEditorProps> = ({ tabId }) => {
  // ─── State & Stores ───
  const tab = useTabStore(s => s.tabs.find(t => t.id === tabId));
  const diffData = tab?.diffData;

  const [originalContent, setOriginalContent] = useState('');
  const [modifiedContent, setModifiedContent] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const [isReady, setIsReady] = useState(false);

  const monaco = useMonaco();
  const settings = useSettingsStore(s => s.settings);
  const activeThemeId = useThemeStore(s => s.activeThemeId);
  const foldingPosition = settings['editor.foldingPosition'] || 'right';

  // ─── Core Editor Refs ───
  const refs = useEditorRefs();
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const originalEditorRef = useRef<any>(null); // Reference for the Left (Original) Side

  // Close context menu on focus
  refs.closeMenuRef.current = () => {
    if (useEditorMenuStore.getState().isOpen) {
      useEditorMenuStore.getState().closeEditorMenu();
    }
  };

  // ─── Touch & Mobile Interceptors ───
  useKeyboardHandler();
  useTouchInterceptors(refs.isPointerBlockRef);

  // Teardrops (Cursor Handles) for the Editable (Right) Side
  const { teardropsOn, setTeardropsOn, updateTeardrops } = useTeardrops({
    editorRef: refs.editorRef,
    isDraggingRef: refs.isDraggingRef,
    isScrollingRef: refs.isScrollingRef,
    userScrollingRef: refs.userScrollingRef,
    cursorDOMRef: refs.cursorDOMRef,
    selectionStartDOMRef: refs.selectionStartDOMRef,
    selectionEndDOMRef: refs.selectionEndDOMRef,
  });

  // Touch Scroll for Modified (Right) Editor
  const { attachTouchListeners: attachModifiedTouch } = useTouchScroll({
    editorRef: refs.editorRef,
    isDraggingRef: refs.isDraggingRef,
    isScrollingRef: refs.isScrollingRef,
    isPointerBlockRef: refs.isPointerBlockRef,
    globalScrollRef: refs.globalScrollRef,
    userScrollingRef: refs.userScrollingRef,
    updateTeardrops,
    setTeardropsOn,
  });

  // Touch Scroll for Original (Left) Read-only Editor
  const { attachTouchListeners: attachOriginalTouch } = useTouchScroll({
    editorRef: originalEditorRef,
    isDraggingRef: refs.isDraggingRef,
    isScrollingRef: refs.isScrollingRef,
    isPointerBlockRef: refs.isPointerBlockRef,
    globalScrollRef: refs.globalScrollRef,
    userScrollingRef: refs.userScrollingRef,
    updateTeardrops: () => {}, // Not needed for read-only side
    setTeardropsOn: () => {},
  });

  // Teardrop Drag Handlers
  const { activeDragType, handleDragStart, handleDragMove, handleDragEnd } = useTeardropsDrag({
    editorRef: refs.editorRef,
    containerRef: refs.containerRef,
    isDraggingRef: refs.isDraggingRef,
    isPointerBlockRef: refs.isPointerBlockRef,
    monaco,
    updateTeardrops,
    cursorDOMRef: refs.cursorDOMRef,
    selectionStartDOMRef: refs.selectionStartDOMRef,
    selectionEndDOMRef: refs.selectionEndDOMRef,
    onHandleActive: (type) => { refs.lastActiveHandleRef.current = type; },
    onDragStartCb: () => refs.closeMenuRef.current(),
    onDragEndCb: () => refs.showMenuRef.current(),
  });

  // Custom Context Menu Layer
  useContextMenuSetup({
    editor: editorInstance,
    monaco,
    lastActiveHandleRef: refs.lastActiveHandleRef,
    handleHandleClickRef: refs.handleHandleClickRef,
    showMenuRef: refs.showMenuRef,
    closeMenuRef: refs.closeMenuRef,
    globalScrollRef: refs.globalScrollRef,
    userScrollingRef: refs.userScrollingRef,
    isDraggingRef: refs.isDraggingRef,
  });

  // ─── File Loading Logic ───
  useEffect(() => {
    if (!diffData) return;
    const { originalContent: orig, modifiedContent: mod, filePath } = diffData;
    const ext = filePath.split('.').pop() || 'plaintext';
    setLanguage(ext === 'js' ? 'javascript' : ext === 'ts' ? 'typescript' : ext);
    
    setOriginalContent((orig || '').replace(/\r\n/g, '\n'));

    const loadModified = async () => {
      if (mod !== null) {
        setModifiedContent(mod.replace(/\r\n/g, '\n'));
        setIsReady(true);
      } else if (filePath) {
        try {
          const raw = await fs.readFile(filePath);
          let rawStr = typeof raw === 'string' ? raw : 
              (raw && (raw as any).byteLength ? new TextDecoder().decode(raw as any) : 
              (raw && 'data' in raw ? String((raw as any).data) : String(raw)));
          setModifiedContent(rawStr.replace(/\r\n/g, '\n'));
        } catch (err) {
          console.error("[DiffEditor] Failed to read local file:", err);
          setModifiedContent('');
        }
        setIsReady(true);
      }
    };
    loadModified();
  }, [diffData]);

  // ─── Monaco Initialization ───
  const handleEditorDidMount = useCallback((editor: Monaco.editor.IStandaloneDiffEditor, monacoInstance: typeof Monaco) => {
    const modified = editor.getModifiedEditor();
    const original = editor.getOriginalEditor();
    
    // Assign refs: Only the Modified (Right) side gets the Teardrops & Menus
    refs.editorRef.current = modified;
    originalEditorRef.current = original;
    setEditorInstance(modified);

    // Bind Touch Scrolling layers to both sides independently
    const origNode = original.getDomNode();
    if (origNode) attachOriginalTouch(origNode);

    const modNode = modified.getDomNode();
    if (modNode) attachModifiedTouch(modNode);

    // Save Command Intercept (Ctrl+S)
    modified.addAction({
      id: 'editor.action.save',
      label: 'Save File',
      keybindings: [monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS],
      run: async () => {
        if (diffData?.modifiedContent === null && diffData?.filePath) {
          const currentVal = modified.getValue();
          await fs.writeFile(diffData.filePath, currentVal);
          useEditorViewStateStore.getState().setTabDirty(diffData.filePath, false);
          
          import('@/features/git/store/gitStore').then(({ useGitStore }) => {
            useGitStore.getState().refresh();
          });
        }
      }
    });

    // Mark Workspace Tab as Dirty on changes
    if (diffData?.modifiedContent === null && diffData?.filePath) {
      modified.onDidChangeModelContent(() => {
        useEditorViewStateStore.getState().setTabDirty(diffData.filePath, true);
      });
    }

    setTimeout(() => {
      editor.layout();
      updateTeardrops();
    }, 100);
  }, [diffData, attachOriginalTouch, attachModifiedTouch, updateTeardrops, refs]);

  const monacoOptions = useMemo(() => {
    const base = buildMonacoOptions(settings);
    return {
      ...base,
      readOnly: diffData?.readOnly || false,
      originalEditable: false,
      renderSideBySide: window.innerWidth > 768,
      ignoreTrimWhitespace: true,
      scrollbar: { vertical: 'visible' as const, horizontal: 'visible' as const }
    };
  }, [settings, diffData]);

  // ─── Wrapper Click Handler (Closes contextual menus) ───
  const handleWrapperClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.lightBulbWidget') || target.closest('.monaco-menu-container') ||
      target.closest('.monaco-hover') || target.closest('.colorpicker-widget') ||
      target.closest('.suggest-widget') || target.closest('.ms-teardrop-handle') ||
      target.closest('.find-widget')
    ) return;

    if (refs.isPointerBlockRef.current || refs.globalScrollRef.current || refs.isDraggingRef.current) {
      e.preventDefault(); e.stopPropagation(); return;
    }

    const editor = refs.editorRef.current;
    if (editor && !editor.hasTextFocus()) editor.focus();
    if ('virtualKeyboard' in navigator) (navigator as any).virtualKeyboard.show();
  };

  if (!isReady || !diffData) return null;

  return (
    <div
      ref={refs.containerRef}
      className={`ms-code-editor-container ${foldingPosition === 'left' ? 'ms-folding-left' : ''}`}
      style={{
        height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
        position: 'relative', touchAction: 'none', willChange: 'transform',
      }}
      onClick={handleWrapperClick}
      onTouchStart={() => refs.closeMenuRef.current()}
    >
      <MonacoDiffEditor
        height="100%"
        width="100%"
        language={language}
        theme={activeThemeId}
        original={originalContent}
        modified={modifiedContent}
        originalModelPath={`git-original://${tabId}`}
        modifiedModelPath={diffData.modifiedContent !== null ? `git-modified://${tabId}` : `file://${diffData.filePath}`}
        options={monacoOptions}
        onMount={handleEditorDidMount}
      />

      {/* Touch Teardrop Handles for the Editable (Right) Side */}
      {teardropsOn && (
        <TeardropsOverlay
          cursorDOMRef={refs.cursorDOMRef}
          selectionStartDOMRef={refs.selectionStartDOMRef}
          selectionEndDOMRef={refs.selectionEndDOMRef}
          activeDragType={activeDragType}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onHandleClick={(type) => refs.handleHandleClickRef.current(type)}
          onHandleDoubleClick={async () => {
            if (editorInstance) {
              const textarea = editorInstance.getDomNode()?.querySelector('textarea');
              if (textarea) textarea.focus();
              else editorInstance.focus();
              setTimeout(async () => {
                try { await Keyboard.show(); }
                catch { if ('virtualKeyboard' in navigator) (navigator as any).virtualKeyboard.show(); }
              }, 150);
            }
          }}
        />
      )}
    </div>
  );
};