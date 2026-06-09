// src/core/extensionAPI/modules/termisModule.ts
//
// Termis panel control — open/close the terminal panel, switch views, and listen to events.

import { useTermisStore }   from '@/features/termis/store/termisStore';
import { useTerminalStore } from '@/features/termis/components/terminal/store/terminalStore';
import { useTabStore }      from '@/store/tabStore';
import { msEvents }         from '@/core/extensionAPI/events/EventManager';
import type { TermisView }  from '@/features/termis/store/termisStore';

export const ensureTermisTabOpen = (): void => {
  const tabStore = useTabStore.getState();
  tabStore.addTab({
    id:    'terminal-main',
    type:  'termis',
    title: 'Termis',
    icon:  'terminal',
  });
};

export const createTermisModule = (_extId: string) => ({
  get isVisible(): boolean {
    return useTermisStore.getState().isOpen;
  },

  get activeView(): TermisView {
    return useTermisStore.getState().activeView;
  },

  // Panel Opening (Respects user's current view or accepts a target view)
  openPanel: (view?: TermisView): void => {
    const targetView = view || useTermisStore.getState().activeView;
    
    // Only create a terminal instance if the target view is actually 'terminal'
    if (targetView === 'terminal') {
      const store = useTerminalStore.getState();
      if (store.instances.length === 0) store.createInstance();
    }
    
    useTermisStore.getState().setActiveView(targetView);
    ensureTermisTabOpen();
  },

  closePanel: (): void => {
    useTermisStore.getState().closePanel();
  },

  setActiveView: (view: TermisView): void => {
    useTermisStore.getState().setActiveView(view);
    ensureTermisTabOpen();
  },

  // ────────────────────────────────────────────────────────
  // EVENT LISTENERS
  // ────────────────────────────────────────────────────────

  onDidOpenTermisPanel: (handler: () => void) => {
    return { dispose: msEvents.on('onDidOpenTermisPanel', handler) };
  },

  onDidCloseTermisPanel: (handler: () => void) => {
    return { dispose: msEvents.on('onDidCloseTermisPanel', handler) };
  },

  onDidChangeTermisActiveView: (handler: (view: TermisView) => void) => {
    return { dispose: msEvents.on('onDidChangeTermisActiveView', handler) };
  }
});

export type TermisModule = ReturnType<typeof createTermisModule>;





// Example :
/* 
```javascript
// 1. Check user exist on which section (output | terminal | problems | ... )
const currentView = mscode.termis.activeView;
console.log(`Currently looking at: ${currentView}`);

// 2. Event track
mscode.termis.onDidChangeTermisActiveView((newView) => {
    if (newView === 'problems') {
        mscode.window.showInformationMessage("Checking for code errors...");
        // Run Errors Checking 
    }
});

mscode.termis.onDidCloseTermisPanel(() => {
    console.log("Panel closed, pausing background checks to save battery.");
});
```
*/