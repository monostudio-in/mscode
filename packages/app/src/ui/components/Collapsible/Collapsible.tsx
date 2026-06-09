// src/ui/components/Collapsible/Collapsible.tsx

/**
 * @file Collapsible.tsx
 * @description A highly flexible and reusable Collapsible/Accordion component.
 * * ─── API DOCUMENTATION & EXAMPLES ─────────────────────────────────────────────
 * * @example
 * // 1. Standard Usage (Uncontrolled)
 * <Collapsible title="My Section">
 * <div>Content goes here...</div>
 * </Collapsible>
 * * @example
 * // 2. Controlled State (Managed by parent)
 * <Collapsible 
 * title="Controlled" 
 * expanded={isOpen} 
 * onToggle={(state) => setIsOpen(state)}
 * >
 * ...
 * </Collapsible>
 * * @example
 * // 3. Non-Collapsible (Static Header)
 * // Chevron icon will be automatically hidden, and clicking won't toggle.
 * <Collapsible title="Fixed Section" isCollapsible={false}>
 * ...
 * </Collapsible>
 * * @example
 * // 4. Custom Icons
 * <Collapsible 
 * title="Custom Icons" 
 * iconExpanded="folder-opened" 
 * iconCollapsed="folder"
 * >
 * ...
 * </Collapsible>
 * * @example
 * // 5. Integrated Actions (Auto renders SidebarActions)
 * <Collapsible 
 * title="With Actions" 
 * actions={[{ id: 'add', icon: 'plus', onClick: () => {} }]}
 * >
 * ...
 * </Collapsible>
 * ──────────────────────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import './Collapsible.css';
import { Icon } from '../Icon/IconRegistry';
import { SidebarActions } from '../SidebarEngine/SidebarActions';
import type { MenuItem } from '@/store/menuStore';

export interface CollapsibleProps {
  /** The text or custom element to display in the header */
  title: string | React.ReactNode;
  
  /** Initial expansion state if uncontrolled. Default: true */
  defaultExpanded?: boolean;
  /** Forces the expansion state (Controlled mode) */
  expanded?: boolean; 
  /** Callback fired when the header is clicked and isCollapsible is true */
  onToggle?: (expanded: boolean) => void; 
  
  /** If false, clicking the header will NOT toggle the content. Default: true */
  isCollapsible?: boolean;
  
  /** Custom icon when expanded. Default: 'chevron-down' */
  iconExpanded?: string | React.ReactNode;
  /** Custom icon when collapsed. Default: 'chevron-right' */
  iconCollapsed?: string | React.ReactNode;

  /** Allows the content area to consume remaining flex space */
  fillHeight?: boolean; 
  /** Shows a vertical line on the left side of the content */
  showGuideLine?: boolean; 
  
  // ── Sticky Header Props ──
  makeSticky?: boolean;
  stickyTop?: number;
  stickyZIndex?: number;
  stickyLeft?: number | string; 
  
  // ── Styling ──
  style?: React.CSSProperties; 
  headerStyle?: React.CSSProperties;
  titleStyle?: React.CSSProperties; 
  
  children: React.ReactNode;
  
  // ── Actions ──
  /** Dynamic MS Code MenuItems to render on the right side */
  actions?: MenuItem[];
  /** Custom ID for the action menu registration */
  actionMenuId?: string;
  /** Max inline actions before grouping into a dropdown */
  maxOverflow?: number;
  /** Legacy support for arbitrary ReactNode actions */
  rightActions?: React.ReactNode;
  
  // ── Events ──
  onHeaderClick?: (e: React.MouseEvent) => void;
  onHeaderContextMenu?: (e: React.MouseEvent) => void;
}

export const Collapsible: React.FC<CollapsibleProps> = ({ 
  title, 
  defaultExpanded = true, 
  expanded, 
  onToggle, 
  isCollapsible = true,
  iconExpanded = 'chevron-down',
  iconCollapsed = 'chevron-right',
  fillHeight = false,
  showGuideLine = false, 
  makeSticky = false, 
  stickyTop = 0, 
  stickyZIndex = 10,
  stickyLeft, 
  style, 
  headerStyle,
  children, 
  actions, 
  actionMenuId, 
  maxOverflow, 
  rightActions, 
  onHeaderClick, 
  onHeaderContextMenu, 
  titleStyle 
}) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = expanded !== undefined ? expanded : internalExpanded;

  const handleToggle = () => {
    if (!isCollapsible) return; // Block toggling if not collapsible
    
    if (onToggle) onToggle(!isExpanded);
    else setInternalExpanded(!isExpanded);
  };

  // Smart Icon Resolver
  const renderIcon = () => {
    // If not collapsible and using default chevrons, hide the icon completely
    if (!isCollapsible && iconExpanded === 'chevron-down' && iconCollapsed === 'chevron-right') {
      return null; 
    }
    
    const currentIcon = isExpanded ? iconExpanded : iconCollapsed;
    
    if (typeof currentIcon === 'string') {
      return <Icon name={currentIcon as any} size={16} />;
    }
    return currentIcon; // In case user passes a raw <svg> or custom ReactNode
  };

  const iconContent = renderIcon();

  return (
    <div className={`ms-collapsible-container ${fillHeight ? 'fill-height' : ''}`} style={style}>
      <div 
        className={`ms-collapsible-header ${makeSticky ? 'is-sticky' : ''} ${!isCollapsible ? 'not-collapsible' : ''}`} 
        onClick={(e) => {
          handleToggle();
          if (onHeaderClick) onHeaderClick(e);
        }}
        onContextMenu={onHeaderContextMenu}
        tabIndex={isCollapsible ? 0 : -1} // Only focusable if it's actionable
        style={{
          cursor: isCollapsible ? 'pointer' : 'default', // Change cursor dynamically
          ...(makeSticky ? { 
            top: stickyTop, 
            zIndex: stickyZIndex, 
            left: stickyLeft !== undefined ? stickyLeft : undefined 
          } : {}),
          ...headerStyle
        }}
      >
        {/* Render Icon only if applicable */}
        {iconContent && (
          <div className="ms-collapsible-icon">
            {iconContent}
          </div>
        )}
        
        {/* Auto-adjust padding if icon is hidden */}
        <div 
          className="ms-collapsible-title" 
          style={{ 
            fontWeight: 'normal', 
            paddingLeft: iconContent ? '0' : '8px', 
            ...titleStyle 
          }}
        >
          {title}
        </div>
        
        {/* Unified Actions Rendering */}
        {(actions?.length || rightActions) ? (
          <div className="ms-collapsible-actions" onClick={(e) => e.stopPropagation()}>
            {actions?.length ? (
              <SidebarActions
                actions={actions}
                menuId={actionMenuId || `collapsible-${title?.toString().replace(/\s+/g, '-').toLowerCase() || 'actions'}`}
                maxOverflow={maxOverflow}
              />
            ) : null}
            {rightActions}
          </div>
        ) : null}
      </div>

      {/* Content Rendering */}
      {isExpanded && (
        <div className={`ms-collapsible-content ${showGuideLine ? 'with-guide-line' : ''}`} 
             style={fillHeight ? { flex: 1, minHeight: 0 } : {}}>
          {children}
        </div>
      )}
    </div>
  );
};