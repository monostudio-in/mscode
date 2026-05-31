// src/ui/components/ContextMenu/ContextMenu.tsx

import React, { useEffect, useRef, useState } from 'react';
import './ContextMenu.css';
import { Icon } from '../Icon/IconRegistry';
import { useMenuStore, type MenuItem } from '@/store/menuStore'; 
import { useBackButtonStore } from '@/store/backButtonStore';

/**
 * Interface definition holding requirements for the ContextMenu context layer.
 */
export interface ContextMenuProps {
  /** Array containing actionable hierarchical options or divider structures. */
  items: MenuItem[];

  /** Initial anchoring vector context (such as pixel mapping coordinates: `left`, `top`). */
  style?: React.CSSProperties;

  /** Flag signaling if the current component instance is spawned as a child sub-menu flyout. */
  isNested?: boolean; 
}

/**
 * Native MS Code Context Menu Engine.
 * Features an intelligent dynamic positioning system with automatic screen-boundary guardrails.
 * * * **Smart Boundary Matrix:** Automatically flips (`left`/`right`) or clamps sub-menus near screen edges while enforcing a minimum 10% overlap connection to ensure layout integrity.
 * * **Hardware Back Button Interceptor:** Mounts a virtual hierarchical lifecycle layer onto the native mobile stack, allowing users to dismiss flyouts level-by-level without exiting the app frame.
 * * @example
 * ```tsx
 * const { ContextMenu } = mscode.ui.components;
 * * // Spawning a standalone root Context Menu
 * <ContextMenu 
 * items={[
 * { id: 'copy', label: 'Copy Text', icon: 'copy', onClick: () => {} },
 * { id: 'sep1', type: 'separator' },
 * { id: 'ref', label: 'Find References...', children: [...] }
 * ]} 
 * style={{ top: 120, left: 45 }} 
 * />
 * ```
 */
// ── Separator guard ───────────────────────────────────────────────────────────
// Removes: leading separators, trailing separators, consecutive separators.
const trimSeparators = (items: MenuItem[]): MenuItem[] =>
  items
    .reduce<MenuItem[]>((acc, item) => {
      if (item.type === 'separator') {
        if (acc.length === 0) return acc;                          // leading
        if (acc[acc.length - 1]?.type === 'separator') return acc; // consecutive
      }
      acc.push(item);
      return acc;
    }, [])
    .filter((item, idx, arr) =>                                    // trailing
      item.type !== 'separator' || arr.slice(idx + 1).some(r => r.type !== 'separator')
    );

export const ContextMenu: React.FC<ContextMenuProps> = ({ items, style, isNested }) => {
  const { closeMenu } = useMenuStore(); 
  
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedStyle, setAdjustedStyle] = useState<React.CSSProperties>(style || {});
  
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [subPosition, setSubPosition] = useState<'right' | 'left'>('right');

  // ─── 1. BOUNDARY LOGIC & SMART OVERLAP ───────────────────────────────────
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();

      if (!isNested && style) {
        // ── Main Menu: Absolute Constraints ──
        let newLeft = Number(style.left) || 0;
        let newTop = Number(style.top) || 0;

        if (newLeft + rect.width > window.innerWidth) newLeft = window.innerWidth - rect.width - 10;
        if (newLeft < 0) newLeft = 10; // Left Side Protection

        if (newTop + rect.height > window.innerHeight) newTop = window.innerHeight - rect.height - 10;
        if (newTop < 0) newTop = 10; // Top Side Protection

        setAdjustedStyle({ ...style, left: newLeft, top: newTop });
      } else if (isNested) {
        // ── Sub-Menu: Transform Shift Constraints ──
        let xOffset = 0;
        let yOffset = 0;

        // Vertical Check
        if (rect.bottom > window.innerHeight) yOffset = window.innerHeight - rect.bottom - 10;
        if (rect.top + yOffset < 0) yOffset = -rect.top + 10;

        // Horizontal Check with Smart Overlap (Minimum 10% touch, no blind centering)
        const parentItem = menuRef.current.parentElement?.closest('.ms-context-menu-item');
        const parentMenu = parentItem?.closest('.ms-context-menu');

        if (parentItem && parentMenu) {
          const parentItemRect = parentItem.getBoundingClientRect();
          const parentMenuRect = parentMenu.getBoundingClientRect();
          
          // Current absolute position without xOffset
          const currentLeft = subPosition === 'right' ? parentItemRect.right : parentItemRect.left - rect.width;
          const currentRight = currentLeft + rect.width;

          let targetLeft = currentLeft;
          const minOverlap = rect.width * 0.1; // 10% minimum touch connection

          if (subPosition === 'right') {
            if (currentRight > window.innerWidth) {
              // If there's more space on the left side of the screen, flip it completely
              if (parentItemRect.left > (window.innerWidth - parentItemRect.right)) {
                targetLeft = parentItemRect.left - rect.width;
                if (targetLeft < 10) {
                  targetLeft = 10;
                  // Ensure minimum 10% overlap touch with parent menu left boundary
                  const minRight = parentMenuRect.left + minOverlap;
                  if (targetLeft + rect.width < minRight) targetLeft = minRight - rect.width;
                }
              } else {
                // Stay on right but clamp to screen edge
                targetLeft = window.innerWidth - rect.width - 10;
                // Keep at least 10% touch connection with parent menu right edge
                const maxLeft = parentMenuRect.right - minOverlap;
                if (targetLeft > maxLeft) targetLeft = maxLeft;
              }
            }
          } else {
            // subPosition === 'left'
            if (currentLeft < 0) {
              // If there's more space on the right side of the screen, flip it completely
              if ((window.innerWidth - parentItemRect.right) > parentItemRect.left) {
                targetLeft = parentItemRect.right;
                if (targetLeft + rect.width > window.innerWidth - 10) {
                  targetLeft = window.innerWidth - rect.width - 10;
                  // Keep at least 10% touch connection with parent menu right side
                  const minLeft = parentMenuRect.right - minOverlap;
                  if (targetLeft < minLeft) targetLeft = minLeft;
                }
              } else {
                // Stay on left but clamp to screen edge
                targetLeft = 10;
                // Ensure minimum 10% overlap touch with parent menu left side
                const minRight = parentMenuRect.left + minOverlap;
                if (targetLeft + rect.width < minRight) targetLeft = minRight - rect.width;
              }
            }
          }

          const naturalLeft = subPosition === 'right' ? parentItemRect.right : parentItemRect.left - rect.width;
          xOffset = targetLeft - naturalLeft;
        } else {
          // Fallback if DOM hierarchy fails
          if (rect.right > window.innerWidth) xOffset = window.innerWidth - rect.right - 10;
          if (rect.left < 0) xOffset = -rect.left + 10;
        }

        setAdjustedStyle({ ...style, transform: `translate(${xOffset}px, ${yOffset}px)` });
      }
    }
  }, [style, isNested, items, subPosition]);
  
  // ─── 2. MAIN MENU BACK BUTTON HANDLE ───────────────────────────────────────
  useEffect(() => {
    if (!isNested && items.length > 0) {
      const handlerId = 'global-context-menu-handler';

      useBackButtonStore.getState().push(handlerId, () => {
        closeMenu();
        return true; // prevent from app exit
      });

      return () => {
        useBackButtonStore.getState().remove(handlerId);
      };
    }
  }, [isNested, items.length, closeMenu]);

  // ─── 3. SUB-MENU HIERARCHICAL BACK BUTTON HANDLE ───────────────────────────
  useEffect(() => {
    if (activeSubId) {
      const handlerId = `context-menu-sub-${activeSubId}`;

      // Push sub-menu closer to stack layer
      useBackButtonStore.getState().push(handlerId, () => {
        setActiveSubId(null); // Just close the sub menu layer first
        return true;          // Consume event
      });

      return () => {
        useBackButtonStore.getState().remove(handlerId);
      };
    }
  }, [activeSubId]);

  if (items.length === 0 && !isNested) return null;

  return (
    <>
      {!isNested && (
        <div 
          className="ms-context-menu-overlay" 
          onMouseDown={(e) => { e.stopPropagation(); closeMenu(); }}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); closeMenu(); }}
        />
      )}

      <div 
        ref={menuRef} 
        className="ms-context-menu" 
        style={{ ...adjustedStyle, overflow: 'visible' }} 
      >
        {trimSeparators(items).map((item, index) => {
          if (item.type === 'separator') return <div key={`sep-${item.id}-${index}`} className="ms-menu-separator" />;

          const hasChildren = !!item.children?.length;

          return (
            <div 
              key={item.id} 
              className={`ms-context-menu-item ${item.disabled ? 'disabled' : ''} ${activeSubId === item.id ? 'active-sub' : ''}`} 
              style={{ position: 'relative' }} 
              onMouseEnter={(e) => {
                if (hasChildren) {
                  setActiveSubId(item.id);
                  const rect = e.currentTarget.getBoundingClientRect();
                  if (rect.right + 220 > window.innerWidth && rect.left - 220 > 0) {
                    setSubPosition('left');
                  } else {
                    setSubPosition('right');
                  }
                }
              }}
              onMouseLeave={() => hasChildren && setActiveSubId(null)}
              onClick={(e) => {
                e.preventDefault(); e.stopPropagation();
                if (item.disabled) return; 
                if (hasChildren) {
                  setActiveSubId(activeSubId === item.id ? null : item.id);
                  return;
                }
                if (item.onClick) item.onClick(item.data);
                closeMenu(); 
              }}
            >
             <div className="ms-menu-icon-slot" style={{ width: '24px', flexShrink: 0 }}>
               {item.checked ? <Icon name="check" size={14} /> : item.icon ? <Icon name={item.icon as any} size={14} /> : null}
             </div>

              <div className="ms-menu-label">{item.label}</div>
              {item.shortcut && <div className="ms-menu-shortcut">{item.shortcut}</div>}

              {hasChildren && (
                <div className="ms-menu-icon-slot" style={{ width: '16px', marginLeft: '10px' }}>
                  <Icon name="chevron-right" size={14} />
                </div>
              )}

              {hasChildren && activeSubId === item.id && item.children && (
                <div style={{
                    position: 'absolute',
                    top: '-4px',
                    left: subPosition === 'right' ? '100%' : 'auto',
                    right: subPosition === 'left' ? '100%' : 'auto',
                    padding: subPosition === 'right' ? '0 0 0 4px' : '0 4px 0 0',
                    zIndex: 1000
                }}>
                  <ContextMenu items={trimSeparators(item.children)} isNested={true} style={{ position: 'relative', left: 'auto', top: 'auto' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};