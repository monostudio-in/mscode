// src/core/extensionAPI/modules/window/sidebarAPI.ts

import { sidebarRegistry, sidebarMenuId } from '../../registry/sidebarRegistry';
import type { SidebarPanelDef, SidebarSectionDef } from '../../registry/sidebarRegistry';
import type { MenuItem } from '@/store/menuStore';
import { useMenuStore }  from '@/store/menuStore';
import { useSidebarStore, type SidebarState } from '@/store/sidebarStore';
import { msEvents } from '@/core/extensionAPI/events/EventManager';

// ─── Public API ───────────────────────────────────────────────────────────────

export const createSidebarAPI = (extId: string) => ({

  sidebar: {

    // ════════════════════════════════════════════════════════════════════════
    // 1. PANEL & SECTION STRUCTURE
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Registers a comprehensive Sidebar Panel layout.
     * This links directly to an Activity Bar item ID and defines the sections and headers shown.
     * * @param panelDef The structural definition of the Sidebar Panel.
     * @returns A disposable object to unregister the panel.
     */
    registerPanel: (panelDef: SidebarPanelDef): { dispose: () => void } => {
      // Ensure the panel is tagged with the extension ID for future management/cleanup
      const taggedPanel = { ...panelDef, _ownerId: extId };
      const dispose = sidebarRegistry.registerPanel(taggedPanel);
      return { dispose };
    },

    addSection: (
      activityBarId: string,
      sectionDef:    SidebarSectionDef,
    ): { dispose: () => void } => {
      const dispose = sidebarRegistry.addSection(activityBarId, sectionDef);
      return { dispose };
    },

    removeSection: (activityBarId: string, sectionId: string): void => {
      sidebarRegistry.removeSection(activityBarId, sectionId);
    },

    updateSection: (
      activityBarId: string,
      sectionId:     string,
      patch:         Partial<SidebarSectionDef>,
    ): void => {
      sidebarRegistry.updateSection(activityBarId, sectionId, patch);
    },

    setSectionVisibility: (
      activityBarId: string,
      sectionId:     string,
      visible:       boolean,
    ): void => {
      sidebarRegistry.setSectionVisibility(activityBarId, sectionId, visible);
    },

    // ════════════════════════════════════════════════════════════════════════
    // 2. ACTION INJECTION
    // ════════════════════════════════════════════════════════════════════════

    menuId: sidebarMenuId,

    addAction: (
      targetMenuId: string,
      action:       MenuItem,
    ): { dispose: () => void } => {
      useMenuStore.getState().registerMenuItem(targetMenuId, action);
      return {
        dispose: () => useMenuStore.getState().unregisterMenuItem(targetMenuId, action.id),
      };
    },

    removeAction: (targetMenuId: string, actionId: string): void => {
      useMenuStore.getState().unregisterMenuItem(targetMenuId, actionId);
    },

    // ════════════════════════════════════════════════════════════════════════
    // 3. VISIBILITY & FOCUS
    // ════════════════════════════════════════════════════════════════════════

    get activePanel(): string {
      return useSidebarStore.getState().activePanel;
    },

    get state(): SidebarState {
      return useSidebarStore.getState().state;
    },

    setState: (newState: SidebarState): void => {
      useSidebarStore.getState().setState(newState);
    },

    focusPanel: (panelId: string): void => {
      const store = useSidebarStore.getState();
      if (store.activePanel !== panelId || store.state === 'hidden') {
        store.clickActivityIcon(panelId);
      }
    },

    // ════════════════════════════════════════════════════════════════════════
    // 4. EVENTS
    // ════════════════════════════════════════════════════════════════════════

    onDidChangeState: (
      handler: (state: SidebarState) => void,
    ): { dispose: () => void } => ({
      dispose: msEvents.on('onDidChangeSidebarState', handler),
    }),

    onDidChangeActivePanel: (
      handler: (panelId: string) => void,
    ): { dispose: () => void } => ({
      dispose: msEvents.on('onDidChangeActiveSidebarPanel', handler),
    }),

    onDidChangeWidth: (
      handler: (width: number) => void,
    ): { dispose: () => void } => ({
      dispose: msEvents.on('onDidChangeSidebarWidth', handler),
    }),
  },
});