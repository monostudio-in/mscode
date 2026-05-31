// src/features/editor/components/CodeEditor/hooks/useEditorRefs.ts
import { useRef, useEffect } from 'react';

/**
 * All shared mutable refs for CodeEditor.
 * Centralising them here prevents prop-drilling and keeps the main
 * component lean.
 */
export function useEditorRefs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef    = useRef<any>(null);

  const savedVersionIdRef = useRef<number>(-1);

  // Tracks whether the component is still mounted so async callbacks
  // can bail out safely without touching private Monaco internals.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // ── Scroll / drag / pointer state ───────────────────────────────
  const isDraggingRef      = useRef(false);
  const isScrollingRef     = useRef(false);
  const isPointerBlockRef  = useRef(false);
  const globalScrollRef    = useRef(false);
  const userScrollingRef   = useRef(false);

  // ── Teardrop DOM handles ─────────────────────────────────────────
  const cursorDOMRef         = useRef<HTMLDivElement>(null);
  const selectionStartDOMRef = useRef<HTMLDivElement>(null);
  const selectionEndDOMRef   = useRef<HTMLDivElement>(null);

  // ── Context-menu imperatives ─────────────────────────────────────
  const showMenuRef  = useRef<() => void>(() => {});
  const closeMenuRef = useRef<() => void>(() => {});

  // ── Teardrop handle state ────────────────────────────────────────
  const lastActiveHandleRef    = useRef<'cursor' | 'start' | 'end'>('start');
  const handleHandleClickRef   = useRef<(type: 'cursor' | 'start' | 'end') => void>(() => {});

  return {
    containerRef,
    editorRef,
    savedVersionIdRef,
    isMountedRef,
    isDraggingRef,
    isScrollingRef,
    isPointerBlockRef,
    globalScrollRef,
    userScrollingRef,
    cursorDOMRef,
    selectionStartDOMRef,
    selectionEndDOMRef,
    showMenuRef,
    closeMenuRef,
    lastActiveHandleRef,
    handleHandleClickRef,
  };
}
