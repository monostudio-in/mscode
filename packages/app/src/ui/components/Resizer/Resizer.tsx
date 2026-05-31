// src/ui/components/Resizer/Resizer.tsx
import React, { useEffect, useRef } from 'react';

/**
 * Configuration interface for the internal Layout Resizer component.
 */
export interface ResizerProps {
  /**
   * Callback fired continuously during drag operations.
   * Provides the relative change in vertical position.
   * @param deltaY The difference in pixels between the current and last registered touch/mouse Y coordinate.
   */
  onResize: (deltaY: number) => void;

  /** Height thickness of the hit-area zone. Defaults to `'5px'`. */
  height?: string;

  /** Idle background color of the resizer bar line. Defaults to `'transparent'`. */
  color?: string;

  /** Background color applied during hover or active dragging states. Defaults to CSS variable `'var(--ms-accent)'`. */
  activeColor?: string;
}

/**
 * Core Core Layout Component: Vertical Resizer handler supporting mouse and fluid touch pointer bindings.
 * Used internally to control flexible layouts like sliding panels, terminals, or sidebars.
 * * @internal This component is part of the core IDE platform internals and should not be exposed to the public Extension API.
 * * @example
 * ```tsx
 * import { Resizer } from '@/ui/components/Resizer/Resizer';
 * * const TerminalPanel = () => {
 * const [panelHeight, setPanelHeight] = useState(200);
 * * return (
 * <div style={{ height: panelHeight }}>
 * <Resizer onResize={(deltaY) => setPanelHeight(h => h - deltaY)} />
 * <TerminalContent />
 * </div>
 * );
 * };
 * ```
 */
export const Resizer: React.FC<ResizerProps> = ({
  onResize,
  height = '5px',
  color = 'transparent',
  activeColor = 'var(--ms-accent)'
}) => {
  const isDragging = useRef(false);
  const lastPos = useRef(0);
  const resizerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const delta = clientY - lastPos.current;
      lastPos.current = clientY;
      
      onResize(delta);
    };

    const handleUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = 'default';
        if (resizerRef.current) resizerRef.current.style.backgroundColor = color;
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [onResize, color]);

  const handleDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    lastPos.current = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    document.body.style.cursor = 'ns-resize';
    if (resizerRef.current) resizerRef.current.style.backgroundColor = activeColor;
  };

  return (
    <div
      ref={resizerRef}
      onMouseDown={handleDown}
      onTouchStart={handleDown}
      style={{
        height: height,
        width: '100%',
        backgroundColor: color,
        cursor: 'ns-resize',
        transition: 'background-color 0.1s ease',
        zIndex: 100,
        marginTop: '-5px',
      }}
      onMouseEnter={(e) => { if (!isDragging.current) e.currentTarget.style.backgroundColor = activeColor; }}
      onMouseLeave={(e) => { if (!isDragging.current) e.currentTarget.style.backgroundColor = color; }}
    />
  );
};