// src/features/editor/components/TearDrops/hooks/useTeardropsDrag.ts

import { useRef, useState, useCallback } from 'react';
import type { MutableRefObject, RefObject } from 'react';

interface UseTeardropsDragOptions {
  editorRef:            MutableRefObject<any>;
  containerRef:         MutableRefObject<HTMLDivElement | null>;
  isDraggingRef:        MutableRefObject<boolean>;
  isPointerBlockRef:    MutableRefObject<boolean>;
  monaco:               any;
  updateTeardrops:      () => void;
  cursorDOMRef:         RefObject<HTMLDivElement | null>;
  selectionStartDOMRef: RefObject<HTMLDivElement | null>;
  selectionEndDOMRef:   RefObject<HTMLDivElement | null>;
  onHandleActive:       (type: 'cursor' | 'start' | 'end') => void;
  onDragStartCb:        () => void;
  onDragEndCb:          () => void;
}

/**
 * Hook for driving operational drag sequences across cursor handles or selection bounding controllers.
 * Contains fluid frame calculations including momentum-free automated scrolling tracks when handles
 * push against the visible layout limits of the editor container.
 */
export function useTeardropsDrag({
  editorRef,
  containerRef,
  isDraggingRef,
  isPointerBlockRef,
  monaco,
  updateTeardrops,
  cursorDOMRef,
  selectionStartDOMRef,
  selectionEndDOMRef,
  onHandleActive,
  onDragStartCb,
  onDragEndCb,
}: UseTeardropsDragOptions) {
  
  const autoScrollRafRef   = useRef<number | null>(null);
  const dragMoveRafRef     = useRef<number | null>(null); 
  const autoScrollDeltaRef = useRef<number>(0);

  /** Preserves the immutable structural pivot marker during high-frequency selection expansion */
  const dragAnchorRef      = useRef<any>(null);

  const [activeDragType, setActiveDragType] = useState<'cursor' | 'start' | 'end' | null>(null);

  /**
   * Internal animation frame loop driving continuous layout viewport scrolling
   * when selection controls are held past containment bounds.
   */
  const ensureAutoScrollLoop = useCallback(() => {
    if (autoScrollRafRef.current) return;
    
    const loop = () => {
      if (!isDraggingRef.current || autoScrollDeltaRef.current === 0) {
        autoScrollRafRef.current = null;
        return;
      }
      const editor = editorRef.current;
      if (editor) {
        editor.setScrollTop(editor.getScrollTop() + autoScrollDeltaRef.current);
      }
      autoScrollRafRef.current = requestAnimationFrame(loop);
    };
    
    autoScrollRafRef.current = requestAnimationFrame(loop);
  }, [editorRef, isDraggingRef]);

  /**
   * Terminates active scroll animation loops and flushes tracking offsets.
   */
  const stopAutoScroll = useCallback(() => {
    autoScrollDeltaRef.current = 0;
    if (autoScrollRafRef.current) {
      cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = null;
    }
  }, []);

  /**
   * Captures initial handle pointer down signals and asserts absolute capture ownership hooks.
   */
  const handleDragStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.cancelable) {
      e.preventDefault();
    }
    isDraggingRef.current = true;
    if (onDragStartCb) {
      onDragStartCb();
    }
  }, [isDraggingRef, onDragStartCb]);

  /**
   * Translates incoming layout touch stream trajectories into structured editing selection spaces.
   */
  const handleDragMove = useCallback((e: React.TouchEvent, type: 'cursor' | 'start' | 'end') => {
    e.stopPropagation();
    e.preventDefault();
    
    setActiveDragType(prev => prev !== type ? type : prev);
    onHandleActive(type);
    
    const touch = e.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;
    
    if (dragMoveRafRef.current) {
      cancelAnimationFrame(dragMoveRafRef.current);
    }

    dragMoveRafRef.current = requestAnimationFrame(() => {
      const editor = editorRef.current;
      const container = containerRef.current;
      if (!editor || !monaco || !container) return;
      
      const rect = container.getBoundingClientRect();
      const EDGE = 60;
      let delta = 0;
      
      if (clientY < rect.top + EDGE) {
        delta = -15;
      } else if (clientY > rect.bottom - EDGE) {
        delta = 15;
      }
      
      autoScrollDeltaRef.current = delta;
      if (delta !== 0) {
        ensureAutoScrollLoop();
      } else {
        stopAutoScroll();
      }
      
      const target = editor.getTargetAtClientPoint(clientX, clientY - 30);
      if (!target?.position) return;
      const newPos = target.position;
      
      if (type === 'cursor') {
        // ── Singular Cursor Reposition Matrix ──
        editor.setPosition(newPos);
        const c = editor.getScrolledVisiblePosition(newPos);
        if (c && cursorDOMRef.current) {
          cursorDOMRef.current.style.transform = `translate3d(${c.left}px, ${c.top + c.height}px, 0)`;
        }
      } else {
        // ── Shared Multi-Selection Vector Logic ──
        let anchor = dragAnchorRef.current;

        if (!anchor) {
          const currentSel = editor.getSelection();
          if (!currentSel) return;
          
          // Lock down the inverted layout pivot marker based on which handle boundary was claimed.
          anchor = type === 'start' ? currentSel.getEndPosition() : currentSel.getStartPosition();
          dragAnchorRef.current = anchor;
        }

        // Prevent zero-width text selection collisions collapsing layout calculations.
        if (newPos.lineNumber === anchor.lineNumber && newPos.column === anchor.column) {
          return; 
        }

        // Project new selection layout matrix into editor instance state.
        editor.setSelection(new monaco.Selection(
          anchor.lineNumber, anchor.column,
          newPos.lineNumber, newPos.column
        ));

        const newSel = editor.getSelection();
        const sortedStart = newSel.getStartPosition();
        const sortedEnd = newSel.getEndPosition();

        const startCoords = editor.getScrolledVisiblePosition(sortedStart);
        const endCoords = editor.getScrolledVisiblePosition(sortedEnd);

        if (startCoords && selectionStartDOMRef.current) {
          selectionStartDOMRef.current.style.transform = `translate3d(${startCoords.left}px, ${startCoords.top + startCoords.height}px, 0)`;
        }
        if (endCoords && selectionEndDOMRef.current) {
          selectionEndDOMRef.current.style.transform = `translate3d(${endCoords.left}px, ${endCoords.top + endCoords.height}px, 0)`;
        }
      }
    });
  }, [
    editorRef, 
    containerRef, 
    monaco, 
    cursorDOMRef, 
    selectionStartDOMRef, 
    selectionEndDOMRef, 
    ensureAutoScrollLoop, 
    stopAutoScroll, 
    onHandleActive
  ]);

  /**
   * Commits active selection targets, flushes active layout state caches, 
   * and dispatches post-drag normalization cycles.
   */
  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    setActiveDragType(null);
    
    // Dissolve anchor state context trackers.
    dragAnchorRef.current = null; 

    stopAutoScroll();
    if (dragMoveRafRef.current) {
      cancelAnimationFrame(dragMoveRafRef.current);
    }
    
    // Squelch downstream tap collisions arising from terminal layout drag gestures.
    isPointerBlockRef.current = true;
    setTimeout(() => { 
      isPointerBlockRef.current = false; 
    }, 300);

    updateTeardrops();
    setTimeout(() => { 
      if (onDragEndCb) onDragEndCb(); 
    }, 150);
  }, [isDraggingRef, isPointerBlockRef, updateTeardrops, onDragEndCb, stopAutoScroll]);

  return { activeDragType, handleDragStart, handleDragMove, handleDragEnd };
}
