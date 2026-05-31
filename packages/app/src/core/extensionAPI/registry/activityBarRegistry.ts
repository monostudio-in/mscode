// src/core/extensionAPI/registry/activityBarRegistry.ts

import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A single item in the Activity Bar.
 *
 * onClick behaviour:
 *   - If openSidebarContent === true  → sidebar panel opens (shows sidebarComponent or default label)
 *   - If openSidebarContent === false → onClick fires freely (open palette, context menu, etc.)
 *   - Both can coexist: onClick always fires; sidebar visibility is controlled separately
 */
export interface ActivityBarItem {
  /** Unique panel / action ID — used as activePanel key */
  id: string;

  /** Icon name passed to `<Icon>` (codicon or custom SVG name) */
  icon: string;

  /** Tooltip + default sidebar heading when no component is provided */
  label: string;

  /**
   * Lower number = higher up the bar.
   * Convention:
   *   top    items: 10, 20, 30 …
   *   bottom items: negative or use position:'bottom'
   */
  priority: number;

  /**
   * Where the icon sits.
   * @default 'top'
   */
  position?: 'top' | 'bottom';

  /**
   * If true, clicking this item toggles a sidebar panel.
   * The panel renders `sidebarComponent` if provided,
   * otherwise a default centered label.
   * @default false
   */
  openSidebarContent?: boolean;

  /**
   * The React component rendered inside the sidebar panel.
   * Only used when openSidebarContent === true.
   * Pass undefined to get the built-in "no content" fallback.
   */
  sidebarComponent?: React.ComponentType;

  /**
   * Called every time the icon is clicked (regardless of openSidebarContent).
   * Use for: opening palette, showing context menu, auth flows, etc.
   */
  onClick?: () => void;
}

// ─── Registry ─────────────────────────────────────────────────────────────────

class ActivityBarRegistry {
  private items: Map<string, ActivityBarItem> = new Map();

  register(item: ActivityBarItem): void {
    this.items.set(item.id, item);
    this._sort();
  }

  unregister(id: string): void {
    this.items.delete(id);
  }

  update(id: string, patch: Partial<ActivityBarItem>): void {
    const existing = this.items.get(id);
    if (existing) {
      this.items.set(id, { ...existing, ...patch });
      this._sort();
    }
  }

  getAll(): ActivityBarItem[] {
    return Array.from(this.items.values());
  }

  getTop(): ActivityBarItem[] {
    return this.getAll().filter(i => (i.position ?? 'top') === 'top');
  }

  getBottom(): ActivityBarItem[] {
    return this.getAll().filter(i => i.position === 'bottom');
  }

  /** @deprecated use register() */
  registerItem(item: ActivityBarItem): void { this.register(item); }
  /** @deprecated use unregister() */
  unregisterItem(id: string): void          { this.unregister(id); }
  /** @deprecated use getAll() */
  getAllItems(): ActivityBarItem[]           { return this.getAll(); }

  private _sort(): void {
    const sorted = this.getAll().sort((a, b) => a.priority - b.priority);
    this.items.clear();
    sorted.forEach(i => this.items.set(i.id, i));
  }
}

export const activityBarRegistry = new ActivityBarRegistry();