// src/features/editor/components/EditorMenu.tsx
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useEditorMenuStore } from '@/features/editor/components/EditorMenu/store/editorMenuStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore'; 
import { Icon } from '@/ui/components/Icon/IconRegistry';
import { ContextMenu } from '@/ui/components/ContextMenu/ContextMenu';
import type { MenuItem } from '@/store/menuStore';
import { useBackButtonStore } from '@/store/backButtonStore';
import './EditorMenu.css'; 

/**
 * Component Layer: Adaptive Contextual Floating Action Menu for the IDE Editor.
 * * Manages dual responsive rendering structures tailored for both Desktop and Mobile configurations:
 * - `vertical`: Standard cascade list triggered by mouse right-click or selection handles.
 * - `android`: Pill action bar container optimized for touch environments.
 * * Supports hierarchical sub-menus registered via explicit menu extension routing paths.
 * * ### Extension API Usage & Dynamic Sub-menu Routing
 * Extensions inject context entries by referencing registered namespaces or targeting a parent node's ID directly:
 * * ```typescript
 * // 1. Register a primary action into the editor context menu root
 * mscode.menus.registerItem('editor/context', {
 * id:    'translate-action',
 * label: 'Translate to English',
 * });
 * * // 2. Nest a deep sub-item dynamically under the newly created parent action path
 * mscode.menus.registerItem('editor/context/translate-action', {
 * id:      'translate-to-bengali',
 * label:   'Translate to Bengali',
 * icon:    'clear-all',
 * onClick: () => alert('Translation logic executed!'),
 * });
 * ```
 * * ### Architectural Layout Workflow
 * ```
 * [Trigger (x, y)] ──> [Eval Store Items] ──> [Bounds Check / Collisions Pass]
 *                                                    │
 * ┌──────────────────────────────────────────┴──────────────────────────────────────────┐
 * ▼                                                                                                    ▼  
 * [Paradigm: 'vertical']                                                                [Paradigm: 'android']
 * - Full multi-tier list cascading                                                      - Horizontal Pill/Toolbar
 * - Flips sub-menus Left/Right dynamically                                              - Overflow fallback dropdown
 * ```
 * * @component
 * @category Editor Subsystems
 */
export const EditorContextMenu: React.FC = () => {
  // ─── Extract Local Reactively Bound Global Store Properties ───
  const {
    isOpen, x, y, items,
    styleType: storeStyle,
    maxVisibleAndroid: storeLimit,
    moreIcon, activeHandle, closeEditorMenu
  } = useEditorMenuStore();
  
  const { settings } = useSettingsStore();

  // ─── Evaluation Configurations Synced Directly to Settings Schema Profiles ───
  const styleType = settings['editor.contextMenuStyle'] || storeStyle || 'android';
  const maxVisibleAndroid = settings['editor.androidMenuOverflowLimit'] ?? storeLimit ?? 5;
  const overflowStyle = settings['editor.androidMenuOverflowStyle'] || 'more';
  const itemDisplay = settings['editor.androidMenuItemDisplay'] || 'icon';
  
  /** Reference anchor linked straight to the wrapper viewport block to scan real-time bounding calculations. */
  const menuRef = useRef<HTMLDivElement>(null);

  /** Captures computed positioning coordinate states after passing view alignment pipelines. */
  const [position, setPosition] = useState({ top: y, left: x });

  /** Toggle state flag controlling horizontal-overflow dropdown container drawer. */
  const [showMore, setShowMore] = useState(false);

  /** Tracks the visual directional projection for the expansion drawer panel based on viewport ceilings. */
  const [dropdownDir, setDropdownDir] = useState<'down' | 'up'>('down'); 

  /** Synchronization sentinel delaying paint passes until boundary collision vectors resolve properly. */
  const [isReady, setIsReady] = useState(false);

  // ─── Sub-Menu Structural Cascading States ───
  /** Tracked target identification signature matching the expanded child node. */
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  /** Structural orientation layout flag determining sub-menu horizontal slide alignment scopes. */
  const [subPosition, setSubPosition] = useState<'right' | 'left'>('right');

  // ─── 1. LAYOUT & COLLISION BOUNDS ADAPTIVE PARSING ──────────────────────────────────
  useLayoutEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      
      // Target constants accommodating native touch selection metrics safely
      const TEARDROP_SPACE_BOTTOM = 55; 
      const TEARDROP_SPACE_TOP = 25;    

      // Core vertical calibration supporting cursor selection frames and mobile handles
      let newTop = activeHandle === 'start' ? y - rect.height - TEARDROP_SPACE_TOP : y + TEARDROP_SPACE_BOTTOM;
      if (newTop < 10) newTop = y + TEARDROP_SPACE_BOTTOM; 
      if (newTop + rect.height > window.innerHeight - 10) newTop = y - rect.height - TEARDROP_SPACE_TOP; 

      // Horizontal axis tracking pushing items away from edge constraints
      let newLeft = x - (rect.width / 2);
      if (newLeft + rect.width > window.innerWidth - 10) newLeft = window.innerWidth - rect.width - 10;
      if (newLeft < 10) newLeft = 10;

      // Predictively flip overflow drawers if cascading elements risk leaking below the window boundaries
      setDropdownDir(newTop + rect.height + 250 > window.innerHeight ? 'up' : 'down');
      setPosition({ top: newTop, left: newLeft });
      setShowMore(false);
      setIsReady(true);
    } else {
      setIsReady(false); 
      setActiveSubId(null);
    }
  }, [isOpen, x, y, styleType, overflowStyle, activeHandle, items]);

  // ─── 2. EVENTS INTERCEPTION & DISPOSAL CLEANUPS ──────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeEditorMenu(); };
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) closeEditorMenu();
    };

    window.addEventListener('keydown', handleEsc);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, closeEditorMenu]);
  
  // ─── 3. HARDWARE BACK BUTTON DEEP INTEGRATION (MOBILE CAPACITOR LAYER) ──────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      const handlerId = 'editor-menu-close-handler';

      // Push execution token into native Android layer stack to consume back event before application disposal
      useBackButtonStore.getState().push(handlerId, () => {
        closeEditorMenu();
        return true; // Sentinels back up into intercept stack to signal event consumed
      });

      return () => {
        useBackButtonStore.getState().remove(handlerId);
      };
    }
  }, [isOpen, closeEditorMenu]);

  if (!isOpen) return null;

  /**
   * Routes user action clicks down into individual node processing blocks.
   * Handles sub-menu drawer expansion overrides or cleans state logs on final execution.
   * * @param e Standard synthetic mouse event wrapper proxy.
   * @param item Target data profile structure representing the targeted menu execution block.
   */
  const handleItemClick = (e: React.MouseEvent, item: MenuItem) => {
    e.preventDefault(); e.stopPropagation();
    if (item.disabled) return;
    
    if (item.children?.length) {
      setActiveSubId(activeSubId === item.id ? null : item.id);
      return;
    }
    
    if (item.onClick) item.onClick(item.data);
    closeEditorMenu();
  };

  // ─── Horizontal Segmentation Calculations ───
  const isScrollable = styleType === 'android' && overflowStyle === 'scroll';
  const visibleItems = isScrollable ? items : (styleType === 'android' ? items.slice(0, maxVisibleAndroid) : items);
  const overflowItems = isScrollable ? [] : (styleType === 'android' ? items.slice(maxVisibleAndroid) : []);

  /**
   * Recursively constructs sub-menu grid view arrays safely matching specific structural vectors.
   * * @param item Base node container holding potential nested context instructions.
   * @param isHorizontal Flips configuration coordinates layout models between list stack types.
   * @returns JSX element mapping target child tree frames or null if context remains unallocated.
   */
  const renderSubMenu = (item: MenuItem, isHorizontal: boolean) => {
    if (!item.children || activeSubId !== item.id) return null;
    return (
      <div style={{
          position: 'absolute',
          top: isHorizontal ? '100%' : '-4px',
          left: isHorizontal ? 0 : (subPosition === 'right' ? '100%' : 'auto'),
          right: isHorizontal ? 'auto' : (subPosition === 'left' ? '100%' : 'auto'),
          padding: isHorizontal ? '4px 0 0 0' : (subPosition === 'right' ? '0 0 0 4px' : '0 4px 0 0'),
          zIndex: 1000
      }}>
        <ContextMenu items={item.children} isNested={true} style={{ position: 'relative', left: 'auto', top: 'auto' }} />
      </div>
    );
  };

  return (
    <div
      ref={menuRef}
      className={`ms-editor-context-menu ms-editor-menu-${styleType} ${isScrollable ? 'scrollable-container' : ''}`}
      style={{ 
        top: position.top, left: position.left, 
        maxWidth: isScrollable ? '90vw' : 'auto',
        opacity: isReady ? 1 : 0, pointerEvents: isReady ? 'auto' : 'none',
        overflow: 'visible' // Evades structural clipping when nested multi-layer lists spawn out of view bounds
      }}
    >
      {/* ── Paradigm A: Android Quick Actions Action Pill/Bar ── */}
      {styleType === 'android' && (
        <div className={`ms-android-menu-bar ${isScrollable ? 'ms-android-scrollable' : ''}`}>
          {visibleItems.map((item, idx) => (
            item.type === 'separator' ? <div key={`sep-${idx}`} className="ms-android-separator" /> :
            <div
              key={item.id}
              className={`ms-android-item ${item.disabled ? 'disabled' : ''} ${activeSubId === item.id ? 'active-sub' : ''}`}
              style={{ position: 'relative' }}
              onMouseEnter={() => item.children?.length && setActiveSubId(item.id)}
              onMouseLeave={() => item.children?.length && setActiveSubId(null)}
              onClick={(e) => handleItemClick(e, item)}
            >
              {itemDisplay !== 'label' && item.icon && <Icon name={item.icon as any} size={18} />}
              {itemDisplay !== 'icon' && item.label && <span>{item.label}</span>}
              
              {renderSubMenu(item, true)}
            </div>
          ))}

          {/* More Action Selection Button - Spawns Desktop Dropdown Fallback list dynamically */}
          {!isScrollable && overflowItems.length > 0 && (
            <div className="ms-android-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMore(!showMore); }}>
              <Icon name={moreIcon} size={18} />
            </div>
          )}
        </div>
      )}

      {/* ── Paradigm B: Desktop Vertical Context List Menu / Android Overflow Action Drawer ── */}
      {(styleType === 'vertical' || (styleType === 'android' && showMore && !isScrollable)) && (
        <div className={`ms-vertical-menu ${styleType === 'android' ? 'ms-android-dropdown' : ''} ${dropdownDir === 'up' ? 'dropdown-up' : ''}`}>
          {(styleType === 'vertical' ? items : overflowItems).map((item, idx) => (
            item.type === 'separator' ? <div key={`sep-${idx}`} className="ms-menu-separator" /> :
            <div
              key={item.id}
              className={`ms-vertical-item ${item.disabled ? 'disabled' : ''}`}
              style={{ position: 'relative' }}
              onMouseEnter={(e) => {
                if (item.children?.length) {
                  setActiveSubId(item.id);
                  const rect = e.currentTarget.getBoundingClientRect();
                  // Smart Edge Detection: Automatically forces sub-menus leftward if right screen estate runs thin
                  setSubPosition(rect.right + 220 > window.innerWidth && rect.left - 220 > 0 ? 'left' : 'right');
                }
              }}
              onMouseLeave={() => item.children?.length && setActiveSubId(null)}
              onClick={(e) => handleItemClick(e, item)}
            >
              <div className="ms-menu-icon-slot">
                {item.icon && <Icon name={item.icon as any} size={16} />}
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="ms-menu-label">{item.label}</span>
                {item.description && <span style={{ fontSize: '11px', color: 'var(--ms-text-faded)', marginLeft: '15px' }}>{item.description}</span>}
              </div>
              {item.children?.length && (
                <div className="ms-menu-icon-slot" style={{ width: '16px', marginLeft: '10px' }}>
                  <Icon name="chevron-right" size={14} />
                </div>
              )}
              {renderSubMenu(item, false)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};