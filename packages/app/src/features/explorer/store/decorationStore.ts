// src/features/explorer/store/decorationStore.ts

import { create } from 'zustand';

// ─── Types & Schema Definitions ───────────────────────────────────────────────

/**
 * Metadata configuration schema representing visual decorations applied onto Tree Nodes.
 * * Used extensively by File Trees and Explorer Custom Views to append status metrics
 * (e.g., Git Modifications 'M', New Untracked files 'U', Linting/Syntax Errors '!', or warnings).
 */
export interface FileDecoration {
  /** * Short text badge displayed trailing or adjacent to the node label.
   * @example 'M' for Modified, 'U' for Untracked, '!' for Compilation Errors.
   */
  badge: string;

  /** * CSS-compliant color declaration token or design system CSS variable.
   * Applied dynamically onto the node item's string label and badge foreground.
   * @example 'var(--ms-git-modified-color)' or '#f1c40f'
   */
  color: string;

  /** optional descriptive text string popped up whenever the cursor hovers atop the node row. */
  tooltip?: string;

  /** * Hierarchical propagation control toggle.
   * If flagged `true`, parent directories/containers wrapping this target node will bubble up 
   * and inherit ambient dot markers or partial tint overlays inside the Tree layout.
   */
  propagate?: boolean;
}

/**
 * Concrete interface mapping data pipelines inside the global Decoration state context.
 */
interface DecorationStore {
  /** Map dictionary caching active file/resource system paths linked directly to their profile decorations. */
  decorations: Record<string, FileDecoration>;

  /**
   * Targets and updates or removes a single decorative record matching a precise target identifier path.
   * @param path The absolute or relative system target string context matching a `TreeItem.id`.
   * @param decoration The meta decoration contract layout, or `null` to flush existing profiles.
   */
  setDecoration: (path: string, decoration: FileDecoration | null) => void;

  /**
   * Performs high-speed bulk ingestion configurations. Replaces or appends multiple entries at once.
   * Typically fired directly following a synchronized Git status sweep or workspace code analysis pass.
   * @param entries Map grid matching system item paths onto explicit `FileDecoration` objects.
   */
  setDecorations: (entries: Record<string, FileDecoration>) => void;

  /** Purges the entire tracking storage grid, restoring initial empty states when closing/switching folders. */
  clearDecorations: () => void;
}

// ─── Reactive State Engine Implementation ──────────────────────────────────────

/**
 * Reactive Zustand State Store managing diagnostic markers, syntax status, and Git indicator decorations
 * layer overlays for Tree View environments.
 * * ### Data Pipeline & Tree View Integration Flow
 * ```
 * [Background Engine: Git/Linter] ──> Invokes setDecorations()
 * │
 * ▼
 * [useDecorationStore State]
 * │
 * (Triggers Reactive Subscription Notification)
 * ▼
 * [GenericTreeView / FileTree UI]
 * - Scans store via current item.id
 * - Paints target label green/red/yellow
 * - appends 'M' / 'U' trailing badge nodes
 * ```
 * * @category Explorer Subsystems
 */
export const useDecorationStore = create<DecorationStore>((set) => ({
  decorations: {},

  setDecoration: (path, decoration) =>
    set((state) => {
      const next = { ...state.decorations };
      if (decoration) next[path] = decoration;
      else delete next[path];
      return { decorations: next };
    }),

  setDecorations: (entries) =>
    set((state) => ({
      decorations: { ...state.decorations, ...entries },
    })),

  clearDecorations: () => set({ decorations: {} }),
}));