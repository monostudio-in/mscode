// src/store/sidebarStore.ts
import { create } from 'zustand';
import { loadGlobalState, saveGlobalState } from '@/core/services/storageService';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { msEvents } from '@/core/extensionAPI/events/EventManager';

/**
 * Structural layout operational modes representing the visibility of the primary sidebar container.
 * - `'expanded'`: Fully open container displaying complete panels and section views.
 * - `'collapsed'`: Compact layout mode keeping structural alignment intact.
 * - `'hidden'`: Completely unmounted or removed from active visual viewpoint coordinates.
 */
export type SidebarState = 'expanded' | 'collapsed' | 'hidden';

/** Unique semantic token taxonomy matching registered workflow channels (e.g., `'files'`, `'search'`, `'git'`). */
export type PanelType = string;

/**
 * Interface blueprint holding requirements for the IDE Sidebar control orchestration system.
 */
interface SidebarStoreState {
  // ── State ──

  /** The current visual rendering state layout mode of the viewport wrapper. */
  state: SidebarState;

  /** Cache buffer tracking the last visible configuration prior to a `'hidden'` command workflow trigger. */
  lastActiveState: 'expanded' | 'collapsed'; 

  /** Target token identity string identifying the currently visible module view structure (e.g., `'files'`). */
  activePanel: PanelType;

  /** Boundary scale tracking layout dimensions directly in screen pixels. */
  width: number;
  
  // ── Actions ──

  /**
   * Toggles the viewport visibility state utilizing user preference configurations mapping.
   * Intercepts settings like `'workbench.sidebar.hamburgerAction'` to route states safely.
   */
  toggleMenu: () => void;

  /**
   * Orchestrates display states when a user triggers or clicks a panel switch button within the activity frame.
   * - Toggles identical panel references between `'expanded'` and `'collapsed'`.
   * - Forces external panels to initialize straight into a high-visibility `'expanded'` footprint.
   * @param panel Target unique string identifier matching registered layout nodes.
   */
  clickActivityIcon: (panel: PanelType) => void;

  /**
   * Manually forces a global mutations update onto the layout viewport visibility layers.
   * @param newState Target structural layout requirement mode.
   */
  setState: (newState: SidebarState) => void;

  /**
   * Re-evaluates dimensional boundary scopes on the drag handle Mono pipeline.
   * @param newWidth The new explicit boundary sizing target scale in pixels.
   */
  setWidth: (newWidth: number) => void; 

  /** Streams saved configuration matrices back from localized data records during boot sequences. */
  initSidebar: () => Promise<void>; 

  /** Commits the running session variables cleanly into the local client instance database storage. */
  saveToStorage: () => Promise<void>; 
}

/**
 * Core Platform Store Engine: Sidebar Layout Coordinator.
 * Governs visual containers and binds lifecycle changes instantly to the EventBus proxy ecosystem.
 * * @internal This is a private core platform manager. System modules interface with this layer via the public window API.
 */
export const useSidebarStore = create<SidebarStoreState>((set, get) => ({
  // ────────────────────────────────────────────────────────
  // INITIAL STATE
  // ────────────────────────────────────────────────────────
  state: 'expanded',
  lastActiveState: 'expanded',
  activePanel: 'files',
  width: 270,

  // ────────────────────────────────────────────────────────
  // ACTIONS
  // ────────────────────────────────────────────────────────

  toggleMenu: () => {
    const { state, lastActiveState } = get();
    // Intercept active workbench profile configurations
    const actionPreference = useSettingsStore.getState().settings['workbench.sidebar.hamburgerAction'] || 'toggle-remember';
    
    let newState: SidebarState = 'hidden';

    // Mono calculation maps for Hamburger layout queries
    if (state === 'hidden') {
      if (actionPreference === 'toggle-expanded') newState = 'expanded';
      else if (actionPreference === 'toggle-collapsed') newState = 'collapsed';
      else newState = lastActiveState; 
    } else {
      newState = 'hidden';
    }

    set({ 
      state: newState, 
      lastActiveState: newState !== 'hidden' ? newState : lastActiveState 
    });

    // Dispatch status payloads downstream to listening extension modules
    msEvents.emit('onDidChangeSidebarState', newState);
    get().saveToStorage();
  },

  clickActivityIcon: (panel) => {
    const { activePanel, state } = get();

    if (activePanel === panel) {
      // Toggle structure dynamically when clicking matching tracking nodes
      const newState = state === 'expanded' ? 'collapsed' : 'expanded';
      set({ state: newState, lastActiveState: newState });
      
      msEvents.emit('onDidChangeSidebarState', newState);
    } else {
      // Direct pass translation converting new node injections straight into an open window
      set({ activePanel: panel, state: 'expanded', lastActiveState: 'expanded' });
      
      msEvents.emit('onDidChangeActiveSidebarPanel', panel);
      if (state !== 'expanded') {
        msEvents.emit('onDidChangeSidebarState', 'expanded');
      }
    }
    get().saveToStorage();
  },

  setState: (newState) => {
    const { state } = get();
    if (state !== newState) { 
      set((prev) => ({ 
        state: newState,
        lastActiveState: newState === 'expanded' ? 'expanded' : prev.lastActiveState 
      }));
      msEvents.emit('onDidChangeSidebarState', newState);
      get().saveToStorage();
    }
  },
  
  setWidth: (newWidth) => {
    set({ width: newWidth });
    msEvents.emit('onDidChangeSidebarWidth', newWidth);
    get().saveToStorage();
  },

  initSidebar: async () => {
    const globalState = await loadGlobalState();
    if (globalState && globalState.sidebarState) {
      set({
        state: globalState.sidebarState.state || 'expanded',
        lastActiveState: globalState.sidebarState.lastActiveState || 'expanded',
        activePanel: globalState.sidebarState.activePanel || 'files',  
        width: globalState.sidebarState.width || 270 
      });
    }
  },

  saveToStorage: async () => {
    const { state, lastActiveState, activePanel, width } = get();
    const currentGlobalState = await loadGlobalState() || {};
    
    await saveGlobalState({
      ...currentGlobalState,
      sidebarState: { state, lastActiveState, activePanel, width }
    });
  }
}));