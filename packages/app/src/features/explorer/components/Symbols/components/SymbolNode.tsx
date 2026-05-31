// src/features/explorer/components/Symbols/components/SymbolNode.tsx
import React from 'react';
import type { DocumentSymbol } from '@/core/symbols';
import { getSymbolIconName } from '@/core/symbols/utils/iconMap';
import { Icon } from '@/ui/components/Icon/IconRegistry';
import { Collapsible } from '@/ui/components/Collapsible/Collapsible';
import { getActiveEditor } from '@/core/services/symbolService';

interface SymbolNodeProps {
  symbol: DocumentSymbol;
  depth?: number; // Track depth for sticky stacking
}

export const SymbolNode: React.FC<SymbolNodeProps> = ({ symbol, depth = 1 }) => {
  const hasChildren = symbol.children && symbol.children.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const editor = getActiveEditor();
    if (editor) {
      editor.setPosition({ lineNumber: symbol.range.startLineNumber, column: symbol.range.startColumn });
      editor.revealLineInCenter(symbol.range.startLineNumber);
      editor.focus();
    }
  };

  const titleContent = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', width: '100%' }}>
      <Icon name={getSymbolIconName(symbol.kind) as any} size={18} color="var(--ms-accent)" />
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{symbol.name}</span>
    </div>
  );

  // Sticky Configuration
  const maxStickySymbols = 5; 
  const shouldStick = depth <= maxStickySymbols;
  const headerHeight = 22; // Height of Collapsible Header
  const currentZIndex = 30 - depth; // Deeper elements get lower z-index

  if (hasChildren) {
    return (
      <Collapsible 
        title={titleContent} 
        defaultExpanded={true} 
        showGuideLine={true} 
        titleStyle={{ fontWeight: 'normal' }} 
        onHeaderClick={handleClick}
        // Sticky Props applied here!
        makeSticky={shouldStick}
        stickyTop={(depth - 1) * headerHeight} // (depth - 1) because Symbols don't have a Root Folder above them in this scroll container
        stickyZIndex={currentZIndex}
        stickyLeft={0}
        headerStyle={{ width: 'max-content', minWidth: '100%', paddingRight: '20px' }} // Support X-Scroll perfectly
      >
        <div style={{ paddingLeft: '4px' }}>
          {/* PASS DEPTH TO CHILDREN */}
          {symbol.children!.map((child, idx) => (
            <SymbolNode key={idx} symbol={child} depth={depth + 1} /> 
          ))}
        </div>
      </Collapsible>
    );
  }

  return (
    <div 
      onClick={handleClick}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 10px 4px 22px', cursor: 'pointer', fontSize: '13px', color: 'var(--ms-text-main)' }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--ms-menu-hover-bg)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
        <Icon name={getSymbolIconName(symbol.kind) as any} size={18} color="var(--ms-accent)" />
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{symbol.name}</span>
      </div>
    </div>
  );
};