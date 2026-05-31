// src/features/terminal/components/TerminalInstance.tsx
import React, { useEffect } from 'react';
import { useTerminalInstance } from '../hooks/useTerminalInstance';
import { StartDropSVG, EndDropSVG, DROP_W } from '@/features/editor/components/Teardrops/components/TeardropsShapes';

interface TerminalInstanceProps {
  terminalId: string;
  isActive:   boolean;
}

export const TerminalInstance: React.FC<TerminalInstanceProps> = ({ terminalId, isActive }) => {
  const { containerRef, focus, fit, selection, handleCopy, handlePaste } = useTerminalInstance({ terminalId });

  useEffect(() => {
    if (isActive) setTimeout(() => { fit(); focus(); }, 30);
  }, [isActive, fit, focus]);

  return (
    <div style={{ position: 'absolute', inset: 0, visibility: isActive ? 'visible' : 'hidden' }}>
      <div
        ref={containerRef}
        className="ms-terminal-container"
        style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      />

      {/* SELECTION OVERLAY (Highest Z-Index) */}
      {isActive && selection && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
          
          {/* Start Teardrop */}
          <div style={{
            position: 'absolute', left: 0, top: 0,
            transform: `translate3d(${selection.startX - (DROP_W / 2)}px, ${selection.startY}px, 0)`,
            pointerEvents: 'auto'
          }}>
            <StartDropSVG />
          </div>

          {/* End Teardrop */}
          <div style={{
            position: 'absolute', left: 0, top: 0,
            transform: `translate3d(${selection.endX - (DROP_W / 2)}px, ${selection.endY}px, 0)`,
            pointerEvents: 'auto'
          }}>
            <EndDropSVG />
          </div>

          {/* Floating Menu */}
          <div style={{
            position: 'absolute', left: 0, top: 0,
            transform: `translate3d(${Math.max(10, selection.startX - 10)}px, ${Math.max(10, selection.startY - 45)}px, 0)`,
            background: 'var(--ms-bg-main)',
            border: '1px solid var(--ms-border-light)',
            display: 'flex', borderRadius: '6px', boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
            pointerEvents: 'auto'
          }}>
            <button onClick={handleCopy} style={{ padding: '8px 16px', border: 'none', background: 'transparent', color: 'white', fontSize: '13px', cursor: 'pointer' }}>Copy</button>
            <div style={{ width: '1px', background: 'var(--ms-border-light)', margin: '4px 0' }} />
            <button onClick={handlePaste} style={{ padding: '8px 16px', border: 'none', background: 'transparent', color: 'white', fontSize: '13px', cursor: 'pointer' }}>Paste</button>
          </div>
        </div>
      )}
    </div>
  );
};