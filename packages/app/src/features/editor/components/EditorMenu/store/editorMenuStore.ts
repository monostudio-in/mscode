// src/features/editor/store/editorMenuStore.ts
import { create } from 'zustand';
import type { IconName } from '@/ui/components/Icon/IconRegistry';
import { getResolvedMenu, type MenuItem } from '@/store/menuStore';

/**
 * Representational schema binding state declarations for the Editor Floating Menu Subsystem.
 * * This interface defines the dynamic reactive layer used to trigger, map, and recalibrate
 * context menus or floating toolbars within the code editor view boundary.
 */
interface EditorMenuState {
  /** Reactive switch determining if the menu overlay container is actively painted on the DOM. */
  isOpen: boolean;

  /** * Unique path identifier linking the editor instance directly to specific menu API registries.
   * Used to aggregate system defaults with core framework/third-party extension contributions.
   */
  menuId: string;

  /** Absolute or boundary-calculated horizontal pixel coordinate mapping the deployment anchor. */
  x: number;

  /** Absolute or boundary-calculated vertical pixel coordinate mapping the deployment anchor. */
  y: number;

  /** Array holding fully compiled and context-evaluated actionable nodes ready for item loop rendering. */
  items: MenuItem[];

  /** * Active visual rendering configuration paradigm.
   * - `vertical`: Standard cascading context lists triggered via standard right-click sequences.
   * - `android`: Horizontal pill-shaped floating action toolbar responsive to selection handles.
   */
  styleType: 'vertical' | 'android';

  /** Bounded element cutoff limit before packing excessive items into a secondary overflow list. */
  maxVisibleAndroid: number;

  /** Fallback Codicon key assigned to populate the trailing overflow chevron/more icon action slot. */
  moreIcon: IconName; 

  /** * Tracks the localized screen anchor sequence triggering the open sequence.
   * Crucial for shifting margins out of touch selection teardrop footprints (`start`/`end`).
   */
  activeHandle: 'cursor' | 'start' | 'end'; 
  
  /**
   * Orchestrates the setup, aggregation, and display pipeline for the contextual overlay system.
   * Utilizes dynamic target resolution pipelines (`getResolvedMenu`) to automatically weave in 
   * extension-registered actions alongside core built-in operational tokens.
   * * ### Extension API Namespace Routing & Deep Sub-menu Nesting
   * Extensions use specific targets or nested sub-paths to plug into the active menu stack:
   * * @example
   * ```typescript
   * // 1. Inject an action directly into the root editor contextual ecosystem
   * mscode.menus.registerItem('editor/context', {
   * id:    'translate-action',
   * label: 'Translate to English',
   * });
   * * // 2. Nest a deep multi-tier sub-item beneath the previous parent path using its unique ID
   * mscode.menus.registerItem('editor/context/translate-action', {
   * id:      'translate-to-bengali',
   * label:   'Translate to Bengali',
   * icon:    'clear-all',
   * onClick: () => mscode.window.showInformationMessage('Translating content...'),
   * });
   * ```
   * * @param menuPath Target identifier channel (e.g., `'editor/context'`).
   * @param x Initial pixel coordinate along the horizontal screen grid.
   * @param y Initial pixel coordinate along the vertical screen grid.
   * @param defaultItems Baseline immutable operational nodes provided by the editor core.
   * @param options Secondary metadata configuration overrides for rendering behaviors.
   */
  openEditorMenu: (
    menuId: string,
    x: number, 
    y: number, 
    defaultItems: MenuItem[], 
    options?: { 
      /** Switches layout configuration paradigm structures. */
      styleType?: 'vertical' | 'android', 
      /** Configures slicing limits before hiding actions in dropdown containers. */
      maxVisibleAndroid?: number, 
      /** Replaces icon name mapped onto the overflow invocation trigger. */
      moreIcon?: IconName, 
      /** Specifies touch selection edge origins to protect visibility boundaries. */
      activeHandle?: 'cursor' | 'start' | 'end' 
    }
  ) => void;

  /**
   * Safely dismisses the menu panel layer from view.
   * Resets active lifecycle flags and safely releases pointer interaction hooks.
   */
  closeEditorMenu: () => void;
}

/**
 * Reactive Zustand State Store Orchestrator controlling the lifecycle, coordinate calibrations,
 * and structural menu resolutions for the Contextual Floating Action Layer.
 * * ### Architecture & Extension Data Aggregation Flow
 * ```
 * [Trigger: openEditorMenu]
 * │
 * ├───> Ingests target menuId (e.g., 'editor/context') & core defaultItems
 * │
 * ├───> Invokes getResolvedMenu() ────> [Scans useMenuStore Registry]
 * │                                            │
 * │                                            └─> Fetches Extension entries
 * │                                                matching path & sub-paths
 * │                                                (e.g., '/translate-action')
 * ▼
 * [Compiles final item array -> Sets isOpen: true -> Emits state updates to EditorContextMenu UI]
 * ```
 * * @category Editor Features
 */
export const useEditorMenuStore = create<EditorMenuState>((set) => ({
  // ─── Initial State Baseline Settings ───
  isOpen: false,
  menuId: '',
  x: 0,
  y: 0,
  items: [],
  styleType: 'android', 
  maxVisibleAndroid: 5, 
  moreIcon: 'more-vertical',
  activeHandle: 'cursor', 

  openEditorMenu: (menuId, x, y, defaultItems, options) => {
    // Dynamically query external menu registries and merge extension items with default templates
    const resolvedItems = getResolvedMenu(menuId, defaultItems);

    set({ 
      isOpen: true, 
      menuId,
      x, 
      y, 
      items: resolvedItems, 
      styleType: options?.styleType || 'android',
      maxVisibleAndroid: options?.maxVisibleAndroid || 5,
      moreIcon: options?.moreIcon || 'more-vertical',
      activeHandle: options?.activeHandle || 'cursor' 
    });
  },
  
  closeEditorMenu: () => set({ isOpen: false })
}));