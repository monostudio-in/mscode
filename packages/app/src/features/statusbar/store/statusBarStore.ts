// src/features/statusbar/store/statusBarStore.ts

/**
 * ============================================================================
 * MS CODE STATUS BAR ENGINE & CORE STORAGE MANAGEMENT
 * ============================================================================
 * * ─── VISUAL DATA LAYOUT & EDGE SORTING ARCHITECTURE ─────────────────────────
 * * [ workbench.statusBar.position = 'bottom' ]
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  [Left Items Partition]                  [Right Items Partition]             │
 * │  (Sorted: Higher priority -> Outer)      (Sorted: Higher -> Outer)           │
 * │                                                                              │
 * │  ┌──────────┐ ┌──────────┐            ┌──────────┐ ┌──────────┐     │ 
 * │  │ Pri: 100   │   Pri: 50    │            │ Pri: 50    │ │ Pri: 100  │      │
 * │  └──────────┘ └──────────┘            └──────────┘ └──────────┘     │
 * └──────────────────────────────────────────────────────────────────┘
 * * @description
 * This core state store leverages Zustand to orchestrate real-time mutations,
 * metadata updates, layout positions, and click event triggers for all visual
 * telemetry nodes sitting on the peripheral boundaries of the MS Code workbench.
 */

import { create } from 'zustand';

/**
 * Alignment properties designating whether the target item docks into 
 * the left-hand cluster or the right-hand utility tray zone.
 */
export type StatusBarAlignment = 'left' | 'right';

/**
 * Full operational validation template representing a single data or action item 
 * positioned on the status bar interface layer.
 */
export interface StatusBarItem {
  /** Universally unique identifier managing the item's state slot (e.g., 'mscode-git-sync') */
  id: string;
  /** Primary spatial anchor zone assigning item orientation layout paths. */
  alignment: StatusBarAlignment;
  /** * Layout weighting coefficient. Higher integers force items closer 
   * to the absolute outer corners of the parent container bar.
   */
  priority: number;
  /** Natural descriptive label or plain text content displayed directly inside the item row. */
  label?: string;
  /** Codicon alphanumeric name string mapping the indicator icon next to text fields. */
  icon?: string;
  /** Rich documentation tooltips or description markers shown when hovering over bounds. */
  tooltip?: string;
  /** * Custom aesthetic hexadecimal parameter or CSS variable color applied directly to text/icons.
   * @example 'var(--ms-error)' or '#ff5555'
   */
  color?: string;
  /** Flags whether the inner icon token executes an infinite spin animation loop (ideal for loaders). */
  spin?: boolean;
  /** Toggles item rendering. If true, the item is completely unmounted from the DOM layout. */
  hidden?: boolean;
  /** Asynchronous click event execution logic intercepting client pointer selections. */
  onClick?: (e: React.MouseEvent) => void;
  /** Native inline styling overrides passed directly down to sub-container elements. */
  style?: React.CSSProperties; 
  /** Dynamic layout tracking classes appended onto root rendering blocks. */
  className?: string;          
  when?:string ;
}

/**
 * Operational API interface specifications mapping internal mutation methods
 * to register, adjust, or completely dismantle telemetry slots.
 */
export interface StatusBarState {
  /** Central lookup index tracking active indicators mapped out in memory tables. */
  items: Record<string, StatusBarItem>;
  
  /**
   * Registers a fresh telemetry allocation block inside the runtime memory arrays.
   * * @param {StatusBarItem} item Full initialization metadata properties template block.
   */
  registerItem: (item: StatusBarItem) => void;
  
  /**
   * Dynamically merges specialized structural parameters onto an existing target entry slot.
   * * @param {string} id Unique target identifier boundary token.
   * @param {Partial<StatusBarItem>} updates Incremental properties patch mapping to be applied.
   */
  updateItem: (id: string, updates: Partial<StatusBarItem>) => void;
  
  /**
   * Completely purges a targeted status bar entry node, freeing up application allocation queues.
   * * @param {string} id Unique target identifier token to unregister.
   */
  removeItem: (id: string) => void;
}

/**
 * Zustand Hook Subsystem Engine orchestrating systemic layout modifications 
 * across the status bar interfaces in real-time.
 * * @example
 * // ─── REACTION ENGINE USAGE INSIDE CORE EXTENSION HOST / Subsystem ───
 * import { useStatusBarStore } from '@/store/statusBarStore';
 * * // 1. Initial Core Item Registration (Uncontrolled/Imperative Boot)
 * useStatusBarStore.getState().registerItem({
 * id: 'mscode-prettier-node',
 * alignment: 'right',
 * priority: 85,
 * label: 'Prettier',
 * icon: 'check',
 * tooltip: 'Prettier Formatter Active',
 * hidden: false
 * });
 * * // 2. Real-time Async Metadata Interception (e.g., Parsing Failure Trigger)
 * useStatusBarStore.getState().updateItem('mscode-prettier-node', {
 * label: 'Prettier: Error',
 * icon: 'warning',
 * color: 'var(--ms-error)',
 * tooltip: 'Syntax parsing constraints triggered line failures'
 * });
 * * // 3. Complete Resource Teardown Workflow
 * useStatusBarStore.getState().removeItem('mscode-prettier-node');
 */
export const useStatusBarStore = create<StatusBarState>((set) => ({
  // Initialize baseline empty indexing table tracking records safely
  items: {},

  registerItem: (item) => 
    set((state) => ({ items: { ...state.items, [item.id]: item } })),

  updateItem: (id, updates) =>
    set((state) => {
      // Direct guard clause protection tracking unregistered targets to intercept memory faults
      if (!state.items[id]) return state;
      return {
        items: { ...state.items, [id]: { ...state.items[id], ...updates } }
      };
    }),

  removeItem: (id) =>
    set((state) => {
      const newItems = { ...state.items };
      delete newItems[id];
      return { items: newItems };
    }),
}));