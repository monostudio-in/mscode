// src/ui/components/SidebarEngine/SidebarActions.tsx
//
// Actions = a menu rendered inline.
// - Uses MenuItem[] (same as ContextMenu/menuStore) — zero separate type needed.
// - Separators between visible icons render as a thin | pipe (not counted as overflow).
// - Items beyond maxOverflow go into a ⋮ context menu (with submenu support).
// - External code can inject items via: menuStore.registerMenuItem(menuId, item)
//   The menuId is: "sidebar/<activityBarId>/<sectionId>/actions"
//             or: "sidebar/<activityBarId>/header/actions"

import React, { useRef }    from 'react';
import { Icon }             from '@/ui/components/Icon/IconRegistry';
import { useMenuStore, getResolvedMenu, type MenuItem } from '@/store/menuStore';

// ─── Props ────────────────────────────────────────────────────────────────────

interface SidebarActionsProps {
  /** MenuItem[] — same shape as ContextMenu items */
  actions:      MenuItem[];
  /**
   * Stable ID used for:
   *   1. The overflow context menu  (openMenu(menuId, …))
   *   2. External registration      (registerMenuItem(menuId, item))
   *
   * Convention: "sidebar/<activityBarId>/<sectionId>/actions"
   *          or "sidebar/<activityBarId>/header/actions"
   */
  menuId:       string;
  /** Max non-separator icons before collapsing into ⋮. Default 3. */
  maxOverflow?: number;
}

// ─── Inline separator ─────────────────────────────────────────────────────────

const InlineSeparator: React.FC = () => (
  <span style={{
    display:    'inline-flex',
    alignItems: 'center',
    padding:    '0 2px',
    color:      'var(--ms-separator, #444)',
    fontSize:   '12px',
    userSelect: 'none',
    opacity:    0.5,
  }}>
    |
  </span>
);

// ─── Single inline action button ──────────────────────────────────────────────

const ActionButton: React.FC<{
  item:    MenuItem;
  menuId:  string;
  openMenu: (menuId: string, x: number, y: number, defaultItems?: any[]) => void;
}> = ({ item, menuId, openMenu }) => {
  const btnRef = useRef<HTMLSpanElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.disabled) return;

    if (item.children?.length) {
      // Submenu: open as a context menu anchored to this button
      const rect = btnRef.current?.getBoundingClientRect();
      const x = rect?.left  ?? e.clientX;
      const y = rect?.bottom ?? e.clientY + 4;
      openMenu(`${menuId}/sub-${item.id}`, x, y, item.children);
    } else {
      item.onClick?.(item.data);
    }
  };

  return (
    <span
      ref={btnRef}
      title={item.label ?? item.id}
      onClick={handleClick}
      style={{
        display:      'flex',
        alignItems:   'center',
        padding:      '2px 3px',
        cursor:       item.disabled ? 'not-allowed' : 'pointer',
        color:        item.disabled ? 'var(--ms-text-faded)' : 'var(--ms-text-faded)',
        borderRadius: '2px',
        opacity:      item.disabled ? 0.4 : 1,
        position:     'relative',
      }}
    >
      {item.icon
        ? <Icon name={item.icon as any} size={16} />
        : <span style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{item.label}</span>
      }

      {/* Chevron hint for items that have children */}
      {item.children?.length ? (
        <Icon name="chevron-down" size={10} style={{ marginLeft: '1px', opacity: 0.6 }} />
      ) : null}
    </span>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const SidebarActions: React.FC<SidebarActionsProps> = ({
  actions,
  menuId,
  maxOverflow = 3,
}) => {
  const { openMenu , openMenuDirect} = useMenuStore();
  const anchorRef    = useRef<HTMLDivElement>(null);

  // Merge external contributions registered via menuStore.registerMenuItem(menuId, …)
  const resolved = getResolvedMenu(menuId, actions);

  if (!resolved.length) return null;

  // ── Partition ─────────────────────────────────────────────────────────────
  // Separators are always "free" (not counted toward maxOverflow).
  // We fill visible slots with non-separator items up to maxOverflow.

  const visibleItems:  MenuItem[] = [];
  const overflowItems: MenuItem[] = [];
  let nonSepCount = 0;

  for (const item of resolved) {
    const isSep = item.type === 'separator';
    if (isSep) {
      // Separator goes to whichever bucket was last filled
      if (nonSepCount < maxOverflow) {
        visibleItems.push(item);
      } else {
        overflowItems.push(item);
      }
    } else {
      if (nonSepCount < maxOverflow) {
        visibleItems.push(item);
        nonSepCount++;
      } else {
        overflowItems.push(item);
      }
    }
  }

  // Strip leading/trailing separators from overflow (they'd look odd at the top of the menu)
  while (overflowItems.length && overflowItems[0].type  === 'separator') overflowItems.shift();
  while (overflowItems.length && overflowItems[overflowItems.length - 1].type === 'separator') overflowItems.pop();

  // ── Overflow handler ──────────────────────────────────────────────────────
  const handleOverflow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = anchorRef.current?.getBoundingClientRect();
    const x = rect?.left   ?? e.clientX;
    const y = rect?.bottom ?? e.clientY + 4;
    // openMenu resolves the menuId again — so registerMenuItem contributions appear here too
    // openMenu(menuId, x, y, overflowItems);
    openMenuDirect(x, y, overflowItems);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={anchorRef}
      style={{ display: 'flex', alignItems: 'center', gap: '0' }}
      onClick={e => e.stopPropagation()}
    >
      {visibleItems.map((item, idx) =>
        item.type === 'separator' ? (
          <InlineSeparator key={`sep-${idx}`} />
        ) : (
          <ActionButton
            key={item.id}
            item={item}
            menuId={menuId}
            openMenu={openMenu}
          />
        )
      )}

      {overflowItems.length > 0 && (
        <>
          {/* Separator before ⋮ if the last visible item isn't already a separator */}
          {visibleItems.length > 0 && visibleItems[visibleItems.length - 1].type !== 'separator' && (
            <InlineSeparator />
          )}
          <span
            title="More Actions…"
            onClick={handleOverflow}
            style={{
              display:     'flex',
              alignItems:  'center',
              padding:     '2px 3px',
              cursor:      'pointer',
              color:       'var(--ms-text-faded)',
              borderRadius:'2px',
            }}
          >
            <Icon name="more" size={16} />
          </span>
        </>
      )}
    </div>
  );
};