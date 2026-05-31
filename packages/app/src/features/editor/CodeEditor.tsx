// src/features/editor/components/CodeEditor.tsx
import '@/features/editor/monaco/monacoSetup';
import React, { useState, useEffect, useMemo } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';

// Core Registries & Stores
// import { commands } from '@/core/extensionAPI/registry/commandRegistry';
import { useTabStore } from '@/store/tabStore'; 
import { useThemeStore } from '@/core/theme/store/themeStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { useEditorMenuStore } from '@/features/editor/components/EditorMenu/store/editorMenuStore'; 
import { buildMonacoOptions } from './monaco/monacoOptions';

// Original Plugins/Hooks Infrastructure
import { useTerminalBoot } from '@/features/termis/components/terminal/hooks/useTerminalBoot';
import { useKeyboardHandler } from './hooks/useKeyboardHandler';
import { useFileLoader } from './hooks/useFileLoader';
import { useTeardrops } from './components/Teardrops/hooks/useTeardrops';
import { useTeardropsDrag } from './components/Teardrops/hooks/useTeardropsDrag';
import { useTouchScroll } from './hooks/useTouchScroll';
import { useMonacoSetup } from './hooks/useMonacoSetup';
import { useStatusBarSync } from '@/features/statusbar/hooks/useStatusBarSync';
import { usePaletteProviders } from './hooks/usePaletteProviders';
import { useContextMenuSetup } from './hooks/useContextMenuSetup';
import { useLspSync } from './hooks/useLspSync';
import { useStickyHighlight } from './hooks/useStickyHighlight';
import { useBreadcrumbs } from './components/BreadCrumb/hooks/useBreadcrumbs';

// Refactored Modular Hooks
import { useEditorRefs } from './hooks/useEditorRefs';
import { useEditorSave } from './hooks/useEditorSave';
import { useTouchInterceptors } from './hooks/useTouchInterceptors';
import { useViewStateSync } from './hooks/useViewStateSync';
import { useAutoSaveAndBackup } from './hooks/useAutoSaveAndBackup';
import { useTabAndNavigationSync } from './hooks/useTabAndNavigationSync';
import { useEditorLifecycle } from './hooks/useEditorLifecycle';

// Components & UI Elements
import { TeardropsOverlay } from './components/Teardrops/TeardropsOverlay';
import { EditorScrollbar, DEFAULT_SCROLLBAR_CONFIG } from './components/Scrollbar/EditorScrollbar';
import type { ScrollbarConfig } from './components/Scrollbar/EditorScrollbar';
import { Keyboard } from '@capacitor/keyboard';

import './CodeEditor.css';

interface CodeEditorProps {
  tabId: string;
  filePath: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ tabId, filePath }) => {
  // 1. Core Refs Mapping Architecture
  const refs = useEditorRefs();
  const DIRTY_SENTINEL_VERSION = -1;

  // 2. Local State Management
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const monaco = useMonaco();
  
  // 3. Global Store Subscription Selector Blocks
  const settings = useSettingsStore(s => s.settings);
  const activeThemeId = useThemeStore(s => s.activeThemeId);
  const activeTabId = useTabStore(s => s.activeTabId);
  const foldingPosition = settings['editor.foldingPosition'] || 'right'; 

  // Imperative Close Window Dispatcher 
  refs.closeMenuRef.current = () => {
    const customMenuOpen = useEditorMenuStore.getState().isOpen;
    if (customMenuOpen) useEditorMenuStore.getState().closeEditorMenu();
  };

  // 4. Invoke Core Global Ecosystem Layout Plugins
  useKeyboardHandler();
  useTouchInterceptors(refs.isPointerBlockRef);
  
  const { initialContent, isLoading, handleEditorChange } = useFileLoader({ tabId, filePath });

  const { teardropsOn, setTeardropsOn, updateTeardrops } = useTeardrops({
    editorRef: refs.editorRef, isDraggingRef: refs.isDraggingRef, isScrollingRef: refs.isScrollingRef, 
    userScrollingRef: refs.userScrollingRef, cursorDOMRef: refs.cursorDOMRef, 
    selectionStartDOMRef: refs.selectionStartDOMRef, selectionEndDOMRef: refs.selectionEndDOMRef,
  });

  const { attachTouchListeners } = useTouchScroll({
    editorRef: refs.editorRef, isDraggingRef: refs.isDraggingRef, isScrollingRef: refs.isScrollingRef, 
    isPointerBlockRef: refs.isPointerBlockRef, globalScrollRef: refs.globalScrollRef, 
    userScrollingRef: refs.userScrollingRef, updateTeardrops, setTeardropsOn,
  });

  const { activeDragType, handleDragStart, handleDragMove, handleDragEnd } = useTeardropsDrag({
    editorRef: refs.editorRef, containerRef: refs.containerRef, isDraggingRef: refs.isDraggingRef, 
    isPointerBlockRef: refs.isPointerBlockRef, monaco, updateTeardrops,
    cursorDOMRef: refs.cursorDOMRef, selectionStartDOMRef: refs.selectionStartDOMRef, selectionEndDOMRef: refs.selectionEndDOMRef,
    onHandleActive: (type) => { refs.lastActiveHandleRef.current = type; },
    onDragStartCb: () => refs.closeMenuRef.current(),
    onDragEndCb: () => refs.showMenuRef.current(),
  });

  // Background Systems Sync Hook bindings
  usePaletteProviders(editorInstance);
  useStatusBarSync(editorInstance);
  useLspSync(editorInstance, tabId);
  useTerminalBoot();
  useStickyHighlight(editorInstance);
  useBreadcrumbs(editorInstance, filePath, tabId);
  
  useContextMenuSetup({
    editor: editorInstance, monaco, lastActiveHandleRef: refs.lastActiveHandleRef, 
    handleHandleClickRef: refs.handleHandleClickRef, showMenuRef: refs.showMenuRef, 
    closeMenuRef: refs.closeMenuRef, globalScrollRef: refs.globalScrollRef, 
    userScrollingRef: refs.userScrollingRef, isDraggingRef: refs.isDraggingRef
  });

  const { handleEditorDidMount: originalDidMount, cleanupDisposables } = useMonacoSetup({
    tabId, editorRef: refs.editorRef, isScrollingRef: refs.isScrollingRef, 
    userScrollingRef: refs.userScrollingRef, updateTeardrops, setTeardropsOn, attachTouchListeners,
  });

  // 5. Refactored Logical Modules Binding Operations
  const { performSave, performSaveRef } = useEditorSave({
    editorInstance, filePath, monaco, settings, 
    isMountedRef: refs.isMountedRef, savedVersionIdRef: refs.savedVersionIdRef
  });

  useViewStateSync({ editorInstance, filePath, editorRef: refs.editorRef });

  useAutoSaveAndBackup({
    editorInstance, filePath, settings, performSave,
    savedVersionIdRef: refs.savedVersionIdRef, isMountedRef: refs.isMountedRef
  });

  useTabAndNavigationSync({
    activeTabId, tabId, editorInstance, filePath, updateTeardrops,
    editorRef: refs.editorRef, isMountedRef: refs.isMountedRef
  });

  const { handleEditorDidMount } = useEditorLifecycle({
    monaco, filePath, settings, originalDidMount, performSaveRef, updateTeardrops, DIRTY_SENTINEL_VERSION,
    savedVersionIdRef: refs.savedVersionIdRef, isMountedRef: refs.isMountedRef, setEditorInstance
  });

  // Component Unmount Cleanup Lifecycle
  useEffect(() => {
    return () => {
      cleanupDisposables();
      setEditorInstance(null);
    };
  }, [cleanupDisposables]);

  // Scrollbar config — reads from settings where available, falls back to defaults
  // ── Scrollbar Config Mapping ──────────────────────────────────────────────
  const scrollbarConfig: Partial<ScrollbarConfig> = useMemo(() => {
    // Monaco uses strings ('hidden', 'auto', 'visible') or booleans
    const v = settings['editor.scrollbar.vertical'];
    const h = settings['editor.scrollbar.horizontal'];

    // Strict boolean mapping (If exactly 'hidden' or false, then hide it)
    const showVertical = (v === 'hidden' || v === false) ? false : true;
    const showHorizontal = (h === 'hidden' || h === false) ? false : true;

    // Visibility behavior mapping
    const verticalVisibility = v === 'visible' ? 'always' : 'auto';
    const horizontalVisibility = h === 'visible' ? 'always' : 'auto';

    return {
      showVertical,
      showHorizontal,
      verticalVisibility,
      horizontalVisibility,
      thumbWidth:           settings['editor.scrollbar.thumbWidth']        ?? DEFAULT_SCROLLBAR_CONFIG.thumbWidth,
      trackWidth:           settings['editor.scrollbar.trackWidth']        ?? DEFAULT_SCROLLBAR_CONFIG.trackWidth,
      thumbFixedSize:       settings['editor.scrollbar.thumbFixedSize']    ?? DEFAULT_SCROLLBAR_CONFIG.thumbFixedSize,
      autoHideDelay:        settings['editor.scrollbar.autoHideDelay']     ?? DEFAULT_SCROLLBAR_CONFIG.autoHideDelay,
      fadeOutDuration:      settings['editor.scrollbar.fadeOutDuration']   ?? DEFAULT_SCROLLBAR_CONFIG.fadeOutDuration,
    };
  }, [settings]);


  const monacoOptions = useMemo(() => buildMonacoOptions(settings), [settings]);
  
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
    if ('virtualKeyboard' in navigator) {
      (navigator as any).virtualKeyboard.show();
    }
  };
  
  return (
    <div
      ref={refs.containerRef}
      className={`ms-code-editor-container ${foldingPosition === 'left' ? 'ms-folding-left' : ''}`}
      style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', position: 'relative', touchAction: 'none', willChange: 'transform' }}
      onClick={handleWrapperClick}
      onTouchStart={() => refs.closeMenuRef.current()}
    >
      {isLoading ? (
        <div style={{ padding: 20, color: 'var(--ms-text-faded)', fontStyle: 'italic' }}>Loading…</div>
      ) : (
        <Editor
          height="100%" 
          width="100%" 
          path={filePath} 
          defaultLanguage="plaintext"
          theme={activeThemeId}
          value={initialContent}
          options={monacoOptions} 
          onMount={handleEditorDidMount} 
          onChange={handleEditorChange}
          keepCurrentModel={true} 
        />
      )}

      {editorInstance && !isLoading && (
        <EditorScrollbar editor={editorInstance} config={scrollbarConfig} />
      )}

      {teardropsOn && !isLoading && (
        <TeardropsOverlay
          cursorDOMRef={refs.cursorDOMRef} 
          selectionStartDOMRef={refs.selectionStartDOMRef} 
          selectionEndDOMRef={refs.selectionEndDOMRef}
          activeDragType={activeDragType} 
          onDragStart={handleDragStart} 
          onDragMove={handleDragMove} 
          onDragEnd={handleDragEnd}
          onHandleClick={(type) => refs.handleHandleClickRef.current(type)}
          onHandleDoubleClick={(_type) => {
            if (editorInstance) {
              const textarea = editorInstance.getDomNode()?.querySelector('textarea');
              if (textarea) textarea.focus();
              else editorInstance.focus(); 
              
              setTimeout(async () => {
                try {
                  await Keyboard.show(); 
                } catch (err) {
                  if ('virtualKeyboard' in navigator) {
                    (navigator as any).virtualKeyboard.show();
                  }
                }
              }, 150); 
            }
          }}
        />
      )}
    </div>
  );
};