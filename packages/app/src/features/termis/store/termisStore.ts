// src/features/termis/store/termisStore.ts

import { create } from 'zustand';
import { msEvents } from '@/core/extensionAPI/events/EventManager';

export type TermisView = 'terminal' | 'output' | 'problems';

interface TermisState {
  isOpen:         boolean;
  panelHeight:    number;       // px
  activeView:     TermisView;

  // ── Actions ──
  openPanel:      () => void;
  closePanel:     () => void;
  togglePanel:    () => void;
  setPanelHeight: (height: number) => void;
  setActiveView:  (view: TermisView) => void;
}

export const useTermisStore = create<TermisState>((set, get) => ({
  isOpen:         false,
  panelHeight:    280,
  activeView:     'terminal', // Default fallback

  openPanel: () => {
    if (!get().isOpen) {
      set({ isOpen: true });
      msEvents.emit('onDidOpenTermisPanel');
    }
  },
  
  closePanel: () => {
    if (get().isOpen) {
      set({ isOpen: false });
      msEvents.emit('onDidCloseTermisPanel');
    }
  },
  
  togglePanel: () => {
    const willOpen = !get().isOpen;
    set({ isOpen: willOpen });
    
   
    if (willOpen) msEvents.emit('onDidOpenTermisPanel');
    else msEvents.emit('onDidCloseTermisPanel');
  },
  
  setPanelHeight: (height) => set({ panelHeight: height }),
  
  setActiveView: (view) => {
    const wasOpen = get().isOpen;
    const oldView = get().activeView;
    
    set({ activeView: view, isOpen: true });

   
    if (!wasOpen) msEvents.emit('onDidOpenTermisPanel');
    if (oldView !== view) msEvents.emit('onDidChangeTermisActiveView', view);
  },
}));