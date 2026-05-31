// src/store/activityBarStore.ts

import { create } from 'zustand';
import { activityBarRegistry, type ActivityBarItem } from '@/core/extensionAPI/registry/activityBarRegistry';
import { msEvents } from '@/core/extensionAPI/events/EventManager';

interface ActivityBarState {
  topItems:    ActivityBarItem[];
  bottomItems: ActivityBarItem[];

  /** Re-read registry and push into state — call after any register/unregister */
  refreshItems:   () => void;

  /** Register + immediately sync to state */
  registerItem:   (item: ActivityBarItem) => void;

  /** Unregister + immediately sync to state */
  unregisterItem: (id: string) => void;

  /** Patch an existing item (e.g. update badge count, change icon) */
  updateItem:     (id: string, patch: Partial<ActivityBarItem>) => void;
}

export const useActivityBarStore = create<ActivityBarState>((set, get) => ({
  topItems:    [],
  bottomItems: [],

  refreshItems: () => {
    const top    = activityBarRegistry.getTop();
    const bottom = activityBarRegistry.getBottom();
    set({ topItems: top, bottomItems: bottom });
    msEvents.emit('onDidChangeActivityBarItems', [...top, ...bottom]);
  },

  registerItem: (item) => {
    activityBarRegistry.register(item);
    get().refreshItems();
  },

  unregisterItem: (id) => {
    activityBarRegistry.unregister(id);
    get().refreshItems();
  },

  updateItem: (id, patch) => {
    activityBarRegistry.update(id, patch);
    get().refreshItems();
  },
}));