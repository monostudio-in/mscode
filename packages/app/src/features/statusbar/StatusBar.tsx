// src/ui/layouts/components/StatusBar.tsx

import React, { useEffect, useRef, useState } from 'react';
import { useStatusBarStore, type StatusBarItem } from './store/statusBarStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { useMenuStore } from '@/store/menuStore';
import { useTabStore } from '@/store/tabStore';
import { Icon } from '@/ui/components/Icon/IconRegistry';
import './StatusBar.css';

interface SideWrapperProps {
  items: StatusBarItem[];
  alignment: 'left' | 'right';
  overflowMode: string;
  position: string;
}

/**
 * Side container partition layout acting as a visual cluster wrapper for structural elements.
 * Employs resize triggers to optionally show ellipsis anchors when content overflows boundary edges.
 */
const SideWrapper: React.FC<SideWrapperProps> = ({ items, alignment, overflowMode, position }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    if (overflowMode !== 'more' || !containerRef.current) return;
    
    const checkOverflow = () => {
      const el = containerRef.current;
      if (el) {
        setHasOverflow(el.scrollWidth > el.clientWidth);
      }
    };
    
    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, [items, overflowMode]);

  const handleMoreClick = (e: React.MouseEvent) => {
    const menuItems = items.map(item => ({
      id: item.id,
      label: item.label || item.tooltip || 'Item',
      icon: item.icon as any,
      onClick: item.onClick ? () => (item.onClick as any)(e) : undefined, 
    }));
    
    const yPos = position === 'bottom' ? e.clientY - 20 : e.clientY + 20;
    useMenuStore.getState().openMenu('statusbar/context', e.clientX, yPos, menuItems);
  };

  return (
    <div ref={containerRef} className={`ms-statusbar-side alignment-${alignment} mode-${overflowMode}`}>
      <div className="ms-statusbar-group">
        {items.map(item => (
          <div 
            key={item.id} 
            className={`ms-statusbar-item ${item.onClick ? 'clickable' : ''} ${item.className || ''}`} 
            onClick={item.onClick} 
            title={item.tooltip} 
            style={{ color: item.color, ...item.style }} 
          >
            {item.icon && (
              <span className={`ms-statusbar-icon ${item.spin ? 'spin-animation' : ''}`}>
                <Icon name={item.icon as any} size={14} />
              </span>
            )}
            {item.label && <span className="ms-statusbar-label">{item.label}</span>}
          </div>
        ))}
      </div>
      {overflowMode === 'more' && hasOverflow && (
        <div className="ms-statusbar-item clickable" onClick={handleMoreClick}>
          <Icon name="more-vertical" size={16} />
        </div>
      )}
    </div>
  );
};

/**
 * Universal layout application status bar positioned cleanly on boundary fringes.
 * Reads runtime layouts directly from core parameter stores to compute visibility and stack maps.
 */
export const StatusBar: React.FC = () => {
  const itemsObj = useStatusBarStore((state) => state.items);
  const items = Object.values(itemsObj).filter(item => !item.hidden);
  
  const settings = useSettingsStore((state) => state.settings);
  const { activeTabId, tabs } = useTabStore(); 
  
  const activeTab = tabs.find(t => t.id === activeTabId);
  const shouldShowStatusBar = activeTab?.showStatusBar ?? (activeTab?.type === 'page' || activeTab?.type === 'code');
  
  if (!(settings['workbench.statusBar.visible'] ?? true) || !shouldShowStatusBar) {
    return null; 
  }

  const leftItems = items.filter(i => i.alignment === 'left').sort((a, b) => b.priority - a.priority);
  const rightItems = items.filter(i => i.alignment === 'right').sort((a, b) => b.priority - a.priority);
  
  const overflowMode = settings['workbench.statusBar.overflow'] || 'scroll';
  const position = settings['workbench.statusBar.position'] || 'bottom';

  return (
    <div className={`ms-statusbar-container position-${position}`}>
      <SideWrapper items={leftItems} alignment="left" overflowMode={overflowMode} position={position} />
      <div className="ms-statusbar-partition" />
      <SideWrapper items={[...rightItems].reverse()} alignment="right" overflowMode={overflowMode} position={position} />
    </div>
  );
};
