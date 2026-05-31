// src/features/editor/components/Teardrops/TeardropsOverlay.tsx
import React, { useRef } from 'react';
import { CursorDropSVG, StartDropSVG, EndDropSVG, DROP_W } from './components/TeardropsShapes';

interface TeardropsOverlayProps {
  cursorDOMRef: React.RefObject<HTMLDivElement | null>;
  selectionStartDOMRef: React.RefObject<HTMLDivElement | null>;
  selectionEndDOMRef: React.RefObject<HTMLDivElement | null>;
  
  activeDragType: 'cursor' | 'start' | 'end' | null;
  onDragStart: (e: React.TouchEvent) => void;
  onDragMove:  (e: React.TouchEvent, type: 'cursor' | 'start' | 'end') => void;
  onDragEnd:   () => void;
  
  onHandleClick: (type: 'cursor' | 'start' | 'end') => void;
  onHandleDoubleClick: (type: 'cursor' | 'start' | 'end') => void; 
}

const BASE_STYLE: React.CSSProperties = {
  position:    'absolute',
  top:         0,
  left:        0,
  willChange:  'transform',
  zIndex:      100,
  touchAction: 'none',
  display:     'none',
};

export const TeardropsOverlay: React.FC<TeardropsOverlayProps> = ({
  cursorDOMRef,
  selectionStartDOMRef,
  selectionEndDOMRef,
  activeDragType,
  onDragStart,
  onDragMove,
  onDragEnd,
  onHandleClick,
  onHandleDoubleClick,
}) => {
  const lastTapRef = useRef<number>(0);

  const stopMonacoAction = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    onDragEnd();
  };

  const handleTap = (e: React.MouseEvent | React.TouchEvent, type: 'cursor' | 'start' | 'end') => {
    e.stopPropagation();

    const now = Date.now();
    const timeDiff = now - lastTapRef.current;

    console.log(`[Teardrops] Tap detected on '${type}'. TimeDiff: ${timeDiff}ms`);

    if (timeDiff > 0 && timeDiff < 400) { 
      console.log(`🚀 [Teardrops] DOUBLE TAP FIRED on '${type}'!`);
      onHandleDoubleClick(type);
      lastTapRef.current = 0; // Reset
    } else {
      console.log(`[Teardrops] Single tap on '${type}'`);
      onHandleClick(type);
      lastTapRef.current = now;
    }
  };

  const opacity = activeDragType ? 0.3 : 1;
  const transition = activeDragType ? 'none' : 'opacity 0.2s';

  return (
    <>
      {/* Cursor Drop */}
      <div
        ref={cursorDOMRef}
        className="ms-teardrop-handle"
        style={{ ...BASE_STYLE, opacity, transition, marginLeft: -DROP_W / 2, pointerEvents: 'auto' }}
        onTouchStart={onDragStart}
        onTouchMove={e => onDragMove(e, 'cursor')}
        onTouchEnd={handleTouchEnd}
        onMouseDown={stopMonacoAction}
        onClick={(e) => handleTap(e, 'cursor')}
        onContextMenu={(e) => e.preventDefault()}
      >
        <CursorDropSVG />
      </div>

      {/* Start Drop */}
      <div
        ref={selectionStartDOMRef}
        className="ms-teardrop-handle"
        style={{ ...BASE_STYLE, opacity, transition, marginLeft: -DROP_W, pointerEvents: 'auto' }}
        onTouchStart={onDragStart}
        onTouchMove={e => onDragMove(e, 'start')}
        onTouchEnd={handleTouchEnd}
        onMouseDown={stopMonacoAction}
        onClick={(e) => handleTap(e, 'start')}
        onContextMenu={(e) => e.preventDefault()}
      >
        <StartDropSVG />
      </div>

      {/* End Drop */}
      <div
        ref={selectionEndDOMRef}
        className="ms-teardrop-handle"
        style={{ ...BASE_STYLE, opacity, transition, pointerEvents: 'auto' }}
        onTouchStart={onDragStart}
        onTouchMove={e => onDragMove(e, 'end')}
        onTouchEnd={handleTouchEnd}
        onMouseDown={stopMonacoAction}
        onClick={(e) => handleTap(e, 'end')}
        onContextMenu={(e) => e.preventDefault()}
      >
        <EndDropSVG />
      </div>
    </>
  );
};