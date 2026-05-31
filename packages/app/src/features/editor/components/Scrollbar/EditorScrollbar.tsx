// src/features/editor/components/Scrollbar/EditorScrollbar.tsx

import React, { useEffect, useState, useRef, useCallback } from 'react';
import './EditorScrollbar.css';

// ─── Config ───────────────────────────────────────────────────────────────────

export interface ScrollbarConfig {
  showVertical: boolean;
  showHorizontal: boolean;
  verticalVisibility: 'auto' | 'always';
  horizontalVisibility: 'auto' | 'always';
  
  thumbWidth: number;   
  trackWidth: number;   
  thumbFixedSize: number; 

  autoHideDelay: number;
  fadeOutDuration: number;
  showOnMount: boolean;
  mountFlashDuration: number;
}

export const DEFAULT_SCROLLBAR_CONFIG: ScrollbarConfig = {
  showVertical:        true,
  showHorizontal:      true,
  verticalVisibility:  'auto',
  horizontalVisibility:'auto',
  thumbWidth:          15,    
  trackWidth:          32,
  thumbFixedSize:      50,
  autoHideDelay:       1200,
  fadeOutDuration:     350,
  showOnMount:         true,
  mountFlashDuration:  1000,
};

// ─── Component ────────────────────────────────────────────────────────────────

interface EditorScrollbarProps {
  editor: any; 
  config?: Partial<ScrollbarConfig>;
}

export const EditorScrollbar: React.FC<EditorScrollbarProps> = ({ editor, config: cfgOverride }) => {
  const cfg: ScrollbarConfig = { ...DEFAULT_SCROLLBAR_CONFIG, ...cfgOverride };

  const [scrollTop,  setScrollTop]  = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [contentH,   setContentH]   = useState(1);
  const [contentW,   setContentW]   = useState(1);
  const [viewH,      setViewH]      = useState(1);
  const [viewW,      setViewW]      = useState(1);

  const yAlways = cfg.verticalVisibility   === 'always';
  const xAlways = cfg.horizontalVisibility === 'always';
  const [yVis, setYVis] = useState<0 | 1>(yAlways ? 1 : 0);
  const [xVis, setXVis] = useState<0 | 1>(xAlways ? 1 : 0);

  const yTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const xTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const yDrag = useRef({ on: false, startY: 0, startST: 0 });
  const xDrag = useRef({ on: false, startX: 0, startSL: 0 });

  const yTrackRef = useRef<HTMLDivElement>(null);
  const xTrackRef = useRef<HTMLDivElement>(null);

  const showY = useCallback((delay: number) => { 
    if (yAlways) return;
    setYVis(1);
    clearTimeout(yTimer.current);
    yTimer.current = setTimeout(() => setYVis(0), delay);
  }, [yAlways]);

  const showX = useCallback((delay: number) => {
    if (xAlways) return;
    setXVis(1);
    clearTimeout(xTimer.current);
    xTimer.current = setTimeout(() => setXVis(0), delay);
  }, [xAlways]);
  
  const keepYVisible = useCallback(() => { if (!yAlways) setYVis(1); }, [yAlways]);
  const keepXVisible = useCallback(() => { if (!xAlways) setXVis(1); }, [xAlways]);

  useEffect(() => {
    if (!editor || editor._isDisposed) return;

    setScrollTop(editor.getScrollTop());
    setScrollLeft(editor.getScrollLeft?.() ?? 0);
    setContentH(editor.getContentHeight());
    setContentW(editor.getScrollWidth?.() ?? 1);
    const li = editor.getLayoutInfo();
    setViewH(li.height);
    setViewW(li.width);

    if (cfg.showOnMount) {
      showY(cfg.mountFlashDuration);
      showX(cfg.mountFlashDuration);
    }

    const subs = [
      editor.onDidScrollChange((e: any) => {
        if (e.scrollTopChanged) {
          setScrollTop(e.scrollTop);
          if (!yDrag.current.on) showY(cfg.autoHideDelay);
        }
        if (e.scrollLeftChanged) {
          setScrollLeft(e.scrollLeft);
          if (!xDrag.current.on) showX(cfg.autoHideDelay);
        }
      }),
      editor.onDidContentSizeChange((e: any) => {
        setContentH(e.contentHeight);
        setContentW(e.contentWidth ?? 1);
      }),
      editor.onDidLayoutChange((e: any) => {
        setViewH(e.height);
        setViewW(e.width);
      }),
    ];

    return () => {
      subs.forEach(s => s.dispose());
      clearTimeout(yTimer.current);
      clearTimeout(xTimer.current);
    };
  }, [editor]); 

  const maxST = Math.max(0, contentH - viewH);
  const maxSL = Math.max(0, contentW - viewW);

  const yThumbH    = cfg.thumbFixedSize; 
  const maxYOffset = viewH - yThumbH;
  const yOffset    = maxST > 0 ? (scrollTop  / maxST) * maxYOffset  : 0;

  const xThumbW    = cfg.thumbFixedSize;
  const maxXOffset = viewW - xThumbW;
  const xOffset    = maxSL > 0 ? (scrollLeft / maxSL) * maxXOffset : 0;

  const hasY    = cfg.showVertical   && maxST > 0;
  const hasX    = cfg.showHorizontal && maxSL > 0;
  const hasBoth = hasY && hasX;

  const onYThumbDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    yDrag.current = { on: true, startY: e.clientY, startST: editor.getScrollTop() };
    clearTimeout(yTimer.current); 
    keepYVisible();
  };

  const onYThumbMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!yDrag.current.on) return;
    const delta = e.clientY - yDrag.current.startY;
    const ratio = maxST / (maxYOffset || 1);
    editor.setScrollTop(Math.max(0, Math.min(yDrag.current.startST + delta * ratio, maxST)));
  };

  const onYThumbUp = () => { yDrag.current.on = false; showY(cfg.autoHideDelay); };

  const onXThumbDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    xDrag.current = { on: true, startX: e.clientX, startSL: editor.getScrollLeft?.() ?? 0 };
    clearTimeout(xTimer.current);
    keepXVisible();
  };

  const onXThumbMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!xDrag.current.on) return;
    const delta = e.clientX - xDrag.current.startX;
    const ratio = maxSL / (maxXOffset || 1);
    editor.setScrollLeft?.(Math.max(0, Math.min(xDrag.current.startSL + delta * ratio, maxSL)));
  };

  const onXThumbUp = () => { xDrag.current.on = false; showX(cfg.autoHideDelay); };

  const onYTrackDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target !== yTrackRef.current) return;
    e.preventDefault();
    const rect  = yTrackRef.current!.getBoundingClientRect();
    const ratio = (e.clientY - rect.top) / rect.height;
    editor.setScrollTop(Math.max(0, Math.min(ratio * contentH - viewH / 2, maxST)));
    showY(cfg.autoHideDelay);
  };

  const onXTrackDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target !== xTrackRef.current) return;
    e.preventDefault();
    const rect  = xTrackRef.current!.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    editor.setScrollLeft?.(Math.max(0, Math.min(ratio * contentW - viewW / 2, maxSL)));
    showX(cfg.autoHideDelay);
  };

  if (!editor || (!hasY && !hasX)) return null;

  return (
    <div className="ms-sb-root" style={{ '--ms-sb-fade-dur': `${cfg.fadeOutDuration}ms` } as any}>
      {hasY && (
        <div ref={yTrackRef} className="ms-sb-track ms-sb-track--y" style={{ opacity: yVis, width: cfg.trackWidth, height: hasBoth ? `calc(100% - ${cfg.trackWidth}px)` : '100%' }} onPointerDown={onYTrackDown}>
          <div className="ms-sb-thumb ms-sb-thumb--y" style={{ height: yThumbH, width: cfg.thumbWidth, transform: `translateY(${yOffset}px)` }} onPointerDown={onYThumbDown} onPointerMove={onYThumbMove} onPointerUp={onYThumbUp} onPointerCancel={onYThumbUp} />
        </div>
      )}
      {hasX && (
        <div ref={xTrackRef} className="ms-sb-track ms-sb-track--x" style={{ opacity: xVis, height: cfg.trackWidth, width: hasBoth ? `calc(100% - ${cfg.trackWidth}px)` : '100%' }} onPointerDown={onXTrackDown}>
          <div className="ms-sb-thumb ms-sb-thumb--x" style={{ width: xThumbW, height: cfg.thumbWidth, transform: `translateX(${xOffset}px)` }} onPointerDown={onXThumbDown} onPointerMove={onXThumbMove} onPointerUp={onXThumbUp} onPointerCancel={onXThumbUp} />
        </div>
      )}
    </div>
  );
};