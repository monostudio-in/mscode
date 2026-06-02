// src/store/menuStore.ts

import { create } from 'zustand';
import { contextKeyService } from '@/core/keybindings/contextKeyService';

/**
 * Represents a dynamically resolvable node in the hierarchical context menu tree.
 * Used by Context Menus, Sidebar Actions, and Activity Bar tools.
 */
export interface MenuItem {
  /** Unique identifier for the menu item. */
  id: string;
  /** Defines if the item is a standard clickable 'item' or a visual 'separator'. */
  type?: 'item' | 'separator';
  /** The text displayed to the user. Leave empty if acting as a headless flat container. */
  label?: string;
  /** Codicon name or custom SVG node to display next to the label. */
  icon?: string | any;
  /** If true, renders a checkmark next to the item. */
  checked?: boolean;
  /** If true, the item appears grayed out and cannot be clicked. */
  disabled?: boolean;
  /** Keyboard shortcut text to display (e.g., 'Ctrl+Shift+P'). */
  shortcut?: string;
  /** Additional sub-text or tooltip description. */
  description?: string;
  
  /** * Context expression (e.g., 'workspacePath != null') or boolean.
   * If evaluated to false, this item is completely removed from the DOM.
   */
  when?: string | boolean;
  
  /** If true, this item will hide itself if its `children` array is empty after resolution. */
  showOnlyWhenSubOptionAvailable?: boolean;
  
  /** Nested sub-menu items. */
  children?: MenuItem[];
  
  /** Execution callback. Receives optional bound data. */
  onClick?: (data?: any) => void;
  
  /** Custom payload to pass into the onClick handler. */
  data?: any;

  // ─── Advanced Automation & Layout ──────────────────────────────────────────

  /** * Sorting weight. Lower numbers appear higher in the menu. 
   * @default 0
   */
  order?: number; 

  /**
   * Internal directive used by SidebarEngine to automatically inject 
   * togglers (Show/Hide) for sidebar collapsible sections.
   */
  views?: any[]; 

  /**
   * **The Flat Unpack 🪄**
   * - `true` or `1`: Unwraps all `children` and injects them directly into the parent menu level.
   * - `false`: Strictly treats this item as a nested Submenu (folder).
   * - `undefined`: Uses **Auto-Hoist** (If there's exactly 1 child, it auto-flattens; if >1, it packs into a submenu).
   */
  flat?: boolean | number; 
}

export interface MenuGroup {
  options: MenuItem[];
}

export interface MenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  items: MenuItem[];

  openMenu: (menuId: string, x: number, y: number, defaultItems?: MenuGroup[] | MenuItem[]) => void;
  
  // pre-resolved items directly set & getResolvedMenu bypass 
  openMenuDirect: (x: number, y: number, items: MenuItem[]) => void;
  closeMenu: () => void;

  /** Dynamic registry for injected menu contributions via extensions or plugins */
  registeredMenus: Record<string, MenuItem[]>;
  registerMenuItem: (menuPath: string, item: MenuItem) => void;
  /** registerMenuItems takes array , and takes multiple menus options */
  registerMenuItems: (menuPath: string, item: MenuItem | MenuItem[]) => void;
  
  unregisterMenuItem: (menuPath: string, itemId: string) => void;
  unregisterMenuItems: (menuPath: string, itemIds: string[]) => void;
}

export const useMenuStore = create<MenuState>((set, _get) => ({
  isOpen: false,
  position: { x: 0, y: 0 },
  items: [],
  registeredMenus: {},

  openMenu: (menuId, x, y, defaultItems = []) => {
    const resolvedItems = getResolvedMenu(menuId, defaultItems);
    if (resolvedItems.length > 0) {
      set({ isOpen: true, position: { x, y }, items: resolvedItems });
    }
  },
  
  openMenuDirect: (x, y, items) => {
    if (items.length > 0) {
      set({ isOpen: true, position: { x, y }, items });
    }
  },

  closeMenu: () => set({ isOpen: false }),

  registerMenuItem: (menuPath, item) => {
    set((state) => {
      const menus = { ...state.registeredMenus };
      if (!menus[menuPath]) menus[menuPath] = [];
      menus[menuPath] = menus[menuPath].filter(i => i.id !== item.id);
      menus[menuPath].push(item);
      return { registeredMenus: menus };
    });
  },
  
  registerMenuItems: (menuPath, item) => {
    const items = Array.isArray(item) ? item : [item];
    set((state) => {
      const menus = { ...state.registeredMenus };
      if (!menus[menuPath]) menus[menuPath] = [];
      items.forEach(i => {
        menus[menuPath] = menus[menuPath].filter(existing => existing.id !== i.id);
        menus[menuPath].push(i);
      });
      return { registeredMenus: menus };
    });
  },

  unregisterMenuItem: (menuPath, itemId) => {
    set((state) => {
      const menus = { ...state.registeredMenus };
      if (menus[menuPath]) {
        menus[menuPath] = menus[menuPath].filter(i => i.id !== itemId);
      }
      return { registeredMenus: menus };
    });
  },
  
  unregisterMenuItems: (menuPath, itemIds) => {
    set((state) => {
      const menus = { ...state.registeredMenus };
      if (menus[menuPath]) {
        menus[menuPath] = menus[menuPath].filter(i => !itemIds.includes(i.id));
      }
      return { registeredMenus: menus };
    });
  },
  
  
}));

const evaluateWhen = (when?: string | boolean): boolean => {
  if (when === undefined) return true;
  if (typeof when === 'boolean') return when;
  return contextKeyService.evaluate(when);
};

const resolveMenuNode = (item: MenuItem, baseId: string): MenuItem | MenuItem[] | null => {
  if (!evaluateWhen(item.when)) return null;
  
  // Shallow copy to prevent mutating the original registered reference
  const resolved: MenuItem = { ...item };
  
  if (resolved.children && resolved.children.length > 0) {
    resolved.children = resolved.children
      .flatMap(child => {
        const res = resolveMenuNode(child, `${baseId}/${child.id}`);
        if (!res) return [];
        return Array.isArray(res) ? res : [res];
      });
      
    resolved.children.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  if (resolved.showOnlyWhenSubOptionAvailable && (!resolved.children || resolved.children.length === 0)) {
    return null;
  }
  
  //  Auto-Flat: If there is exactly 1 child, bypass the parent and promote the child directly
  const isAutoFlat = resolved.children && resolved.children.length === 1 && resolved.flat !== false;
  
  if (resolved.flat || isAutoFlat) {
    return resolved.children || [];
  }
  
  return resolved;
};

export const getResolvedMenu = (menuId: string, defaults: MenuGroup[] | MenuItem[] = []): MenuItem[] => {
  let finalItems: MenuItem[] = [];
  
  // Track duplicate IDs using a Set
  const seenIds = new Set<string>();

  const isGrouped = defaults.length > 0 && 'options' in (defaults[0] as any);

  // 1. Process items coming from defaults or settings first
  if (isGrouped) {
    (defaults as MenuGroup[]).forEach((group, index) => {
      const resolvedGroup = group.options
        .flatMap(item => {
          const res = resolveMenuNode(item, `${menuId}/${item.id}`);
          if (!res) return [];
          return Array.isArray(res) ? res : [res];
        });

      if (resolvedGroup.length > 0) {
        if (finalItems.length > 0) finalItems.push({ id: `sep-${index}`, type: 'separator' });
        
        resolvedGroup.forEach(item => {
          if (item.id && !seenIds.has(item.id)) {
            seenIds.add(item.id);
            finalItems.push(item);
          }
        });
      }
    });
  } else {
    const resolvedDefaults = (defaults as MenuItem[])
      .flatMap(item => {
        const res = resolveMenuNode(item, `${menuId}/${item.id}`);
        if (!res) return [];
        return Array.isArray(res) ? res : [res];
      });

    resolvedDefaults.forEach(item => {
      if (item.id && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        finalItems.push(item);
      }
    });
  }

  // 2. Process items coming from extensions or core registration
  const rootExternals = useMenuStore.getState().registeredMenus[menuId] || [];
  const resolvedExternals = rootExternals
    .flatMap(item => {
      const res = resolveMenuNode(item, `${menuId}/${item.id}`);
      if (!res) return [];
      return Array.isArray(res) ? res : [res];
    });

  if (resolvedExternals.length > 0) {
    // Check if the last item is already a separator before adding a new one
    if (finalItems.length > 0 && finalItems[finalItems.length - 1].type !== 'separator') {
      finalItems.push({ id: `ext-sep-${menuId}`, type: 'separator' });
    }
    
    resolvedExternals.forEach(item => {
      // Crucial Check: Skip duplicate if the ID has already been pushed via default settings
      if (item.id && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        finalItems.push(item);
      } else if (!item.id) {
        // Separators or items without an ID are pushed directly
        finalItems.push(item);
      }
    });
  }

  // Final sorting based on the order property
  finalItems.sort((a, b) => (a.order || 0) - (b.order || 0));

  return finalItems;
};
