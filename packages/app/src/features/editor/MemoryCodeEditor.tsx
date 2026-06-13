// src/features/editor/MemoryCodeEditor.tsx

// Uses : ModalEditor, quick-edit panel, settings JSON editor etc.

import '@/features/editor/monaco/monacoSetup';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';

// ── Stores ─────────────────────────────────────────────────────────────────────
import { useThemeStore }        from '@/core/theme/store/themeStore';
import { useSettingsStore }     from '@/features/settings/store/settingsStore';
import { useEditorMenuStore }   from '@/features/editor/components/EditorMenu/store/editorMenuStore';
import { buildMonacoOptions }   from './monaco/monacoOptions';

// ── Touch & Interaction Hooks (same as CodeEditor) ────────────────────────────
import { useEditorRefs }        from './hooks/useEditorRefs';
import { useKeyboardHandler }   from './hooks/useKeyboardHandler';
import { useTouchInterceptors } from './hooks/useTouchInterceptors';
import { useTeardrops }         from './components/Teardrops/hooks/useTeardrops';
import { useTeardropsDrag }     from './components/Teardrops/hooks/useTeardropsDrag';
import { useTouchScroll }       from './hooks/useTouchScroll';
import { useMonacoSetup }       from './hooks/useMonacoSetup';
import { useContextMenuSetup }  from './hooks/useContextMenuSetup';

// ── UI Components ──────────────────────────────────────────────────────────────
import { TeardropsOverlay }                          from './components/Teardrops/TeardropsOverlay';
import { EditorScrollbar, DEFAULT_SCROLLBAR_CONFIG } from './components/Scrollbar/EditorScrollbar';
import type { ScrollbarConfig }                      from './components/Scrollbar/EditorScrollbar';
import { Keyboard }                                  from '@capacitor/keyboard';

import './CodeEditor.css';

// ─────────────────────────────────────────────────────────────────────────────

export interface MemoryCodeEditorProps {
  /**
   * Unique string per editor instance.
   * Used to build the Monaco model URI:  `inmemory://<instanceId>`
   * Keep stable across re-renders to avoid model recreation.
   */
  instanceId:  string;
  /** Monaco language mode. Default: 'json' */
  language?:   string;
  /** Current text content */
  value:       string;
  /** Called on every content change */
  onChange:    (value: string) => void;
  /**
   * Called once after Monaco mounts.
   * Receives the editor instance so the parent can call e.g. getAction('formatDocument').
   */
  onEditorMount?: (editor: Monaco.editor.IStandaloneCodeEditor) => void;
  /**
   * Called whenever the Monaco marker (error/warning) list changes for this model.
   * Parent uses this for real-time JSON validation status.
   */
  onMarkersChange?: (markers: Monaco.editor.IMarker[]) => void;
}

// ─────────────────────────────────────────────────────────────────────────────

export const MemoryCodeEditor: React.FC<MemoryCodeEditorProps> = ({
  instanceId,
  language    = 'json',
  value,
  onChange,
  onEditorMount,
  onMarkersChange,
}) => {

  // ── Shared refs (same object shape as CodeEditor) ─────────────────────────
  const refs = useEditorRefs();

  const [editorInstance, setEditorInstance] = useState<any>(null);
  const monaco = useMonaco();

  // ── Stores ─────────────────────────────────────────────────────────────────
  const settings      = useSettingsStore(s => s.settings);
  const activeThemeId = useThemeStore(s => s.activeThemeId);
  const foldingPosition = settings['editor.foldingPosition'] || 'right';

  // Close custom editor menu on new editor focus
  refs.closeMenuRef.current = () => {
    if (useEditorMenuStore.getState().isOpen) {
      useEditorMenuStore.getState().closeEditorMenu();
    }
  };

  // ── Touch & keyboard (identical to CodeEditor) ────────────────────────────
  useKeyboardHandler();
  useTouchInterceptors(refs.isPointerBlockRef);

  const { teardropsOn, setTeardropsOn, updateTeardrops } = useTeardrops({
    editorRef:            refs.editorRef,
    isDraggingRef:        refs.isDraggingRef,
    isScrollingRef:       refs.isScrollingRef,
    userScrollingRef:     refs.userScrollingRef,
    cursorDOMRef:         refs.cursorDOMRef,
    selectionStartDOMRef: refs.selectionStartDOMRef,
    selectionEndDOMRef:   refs.selectionEndDOMRef,
  });

  const { attachTouchListeners } = useTouchScroll({
    editorRef:            refs.editorRef,
    isDraggingRef:        refs.isDraggingRef,
    isScrollingRef:       refs.isScrollingRef,
    isPointerBlockRef:    refs.isPointerBlockRef,
    globalScrollRef:      refs.globalScrollRef,
    userScrollingRef:     refs.userScrollingRef,
    updateTeardrops,
    setTeardropsOn,
  });

  const { activeDragType, handleDragStart, handleDragMove, handleDragEnd } = useTeardropsDrag({
    editorRef:            refs.editorRef,
    containerRef:         refs.containerRef,
    isDraggingRef:        refs.isDraggingRef,
    isPointerBlockRef:    refs.isPointerBlockRef,
    monaco,
    updateTeardrops,
    cursorDOMRef:         refs.cursorDOMRef,
    selectionStartDOMRef: refs.selectionStartDOMRef,
    selectionEndDOMRef:   refs.selectionEndDOMRef,
    onHandleActive:  (type) => { refs.lastActiveHandleRef.current = type; },
    onDragStartCb:   ()     => refs.closeMenuRef.current(),
    onDragEndCb:     ()     => refs.showMenuRef.current(),
  });

  useContextMenuSetup({
    editor:               editorInstance,
    monaco,
    lastActiveHandleRef:  refs.lastActiveHandleRef,
    handleHandleClickRef: refs.handleHandleClickRef,
    showMenuRef:          refs.showMenuRef,
    closeMenuRef:         refs.closeMenuRef,
    globalScrollRef:      refs.globalScrollRef,
    userScrollingRef:     refs.userScrollingRef,
    isDraggingRef:        refs.isDraggingRef,
  });

  const { handleEditorDidMount: originalDidMount, cleanupDisposables } = useMonacoSetup({
    tabId:            instanceId,        // stable unique id
    editorRef:        refs.editorRef,
    isScrollingRef:   refs.isScrollingRef,
    userScrollingRef: refs.userScrollingRef,
    updateTeardrops,
    setTeardropsOn,
    attachTouchListeners,
  });

  // ── Monaco onMount ─────────────────────────────────────────────────────────
  const handleEditorDidMount = useCallback((
    editor: Monaco.editor.IStandaloneCodeEditor,
    monacoInstance: typeof Monaco,
  ) => {
    refs.editorRef.current = editor;
    setEditorInstance(editor);

    // Wire up touch/scroll (same as CodeEditor)
    originalDidMount(editor);

    // JSON validation config
    if (language === 'json') {
      (monacoInstance.languages as any).json.jsonDefaults.setDiagnosticsOptions({
        validate:          true,
        allowComments:     false,
        schemaValidation:  'warning',
      });
    }

    // Forward marker changes to parent
    if (onMarkersChange) {
      monacoInstance.editor.onDidChangeMarkers(() => {
        const model = editor.getModel();
        if (!model) return;
        const markers = monacoInstance.editor.getModelMarkers({ resource: model.uri });
        onMarkersChange(markers);
      });
    }

    onEditorMount?.(editor);

    // Initial layout after the modal finishes animating in
    setTimeout(() => {
      if (refs.isMountedRef.current) {
        editor.layout();
        updateTeardrops();
      }
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, originalDidMount, onEditorMount, onMarkersChange]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    refs.isMountedRef.current = true;
    return () => {
      refs.isMountedRef.current = false;
      cleanupDisposables();
      setEditorInstance(null);
    };
  }, [cleanupDisposables]);

  // ── Scrollbar config (same logic as CodeEditor) ───────────────────────────
  const scrollbarConfig: Partial<ScrollbarConfig> = useMemo(() => {
    const v = settings['editor.scrollbar.vertical'];
    const h = settings['editor.scrollbar.horizontal'];
    return {
      showVertical:          !(v === 'hidden' || v === false),
      showHorizontal:        !(h === 'hidden' || h === false),
      verticalVisibility:    v === 'visible' ? 'always' : 'auto',
      horizontalVisibility:  h === 'visible' ? 'always' : 'auto',
      thumbWidth:            settings['editor.scrollbar.thumbWidth']      ?? DEFAULT_SCROLLBAR_CONFIG.thumbWidth,
      trackWidth:            settings['editor.scrollbar.trackWidth']      ?? DEFAULT_SCROLLBAR_CONFIG.trackWidth,
      thumbFixedSize:        settings['editor.scrollbar.thumbFixedSize']  ?? DEFAULT_SCROLLBAR_CONFIG.thumbFixedSize,
      autoHideDelay:         settings['editor.scrollbar.autoHideDelay']   ?? DEFAULT_SCROLLBAR_CONFIG.autoHideDelay,
      fadeOutDuration:       settings['editor.scrollbar.fadeOutDuration'] ?? DEFAULT_SCROLLBAR_CONFIG.fadeOutDuration,
    };
  }, [settings]);

  const monacoOptions = useMemo(() => buildMonacoOptions(settings), [settings]);

  // ── Wrapper click — focus + virtual keyboard (same as CodeEditor) ─────────
  const handleWrapperClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.lightBulbWidget')       ||
      target.closest('.monaco-menu-container') ||
      target.closest('.monaco-hover')          ||
      target.closest('.colorpicker-widget')    ||
      target.closest('.suggest-widget')        ||
      target.closest('.ms-teardrop-handle')    ||
      target.closest('.find-widget')
    ) return;

    if (
      refs.isPointerBlockRef.current ||
      refs.globalScrollRef.current   ||
      refs.isDraggingRef.current
    ) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    const editor = refs.editorRef.current;
    if (editor && !editor.hasTextFocus()) editor.focus();
    if ('virtualKeyboard' in navigator) {
      (navigator as any).virtualKeyboard.show();
    }
  };

  // ── Monaco model path — stable virtual URI, never hits the file system ─────
  // Using `inmemory://` scheme keeps it isolated from the workspace models.
  const virtualPath = `inmemory://${instanceId}.${language === 'json' ? 'json' : 'txt'}`;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={refs.containerRef}
      className={`ms-code-editor-container ${foldingPosition === 'left' ? 'ms-folding-left' : ''}`}
      style={{
        height:       '100%',
        width:        '100%',
        display:      'flex',
        flexDirection:'column',
        position:     'relative',
        touchAction:  'none',
        willChange:   'transform',
      }}
      onClick={handleWrapperClick}
      onTouchStart={() => refs.closeMenuRef.current()}
    >
      <Editor
        height="100%"
        width="100%"
        path={virtualPath}
        language={language}
        theme={activeThemeId}
        value={value}
        options={monacoOptions}
        onMount={handleEditorDidMount}
        onChange={(v) => onChange(v ?? '')}
        keepCurrentModel={true}
      />

      {editorInstance && (
        <EditorScrollbar editor={editorInstance} config={scrollbarConfig} />
      )}

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
                catch {
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