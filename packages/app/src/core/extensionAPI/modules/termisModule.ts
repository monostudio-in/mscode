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
  // const exists   = tabStore.tabs.some(t => t.id === 'terminal-main');

  // if (!exists) {
  // by default addTab : if tab is opened then opens , if not open then open or create
    tabStore.addTab({
      id:    'terminal-main',
      type:  'termis',
      title: 'Termis',
      icon:  'terminal',
    });
  // } else {
    // tabStore.setActiveTab('terminal-main');
  // }
};

export const createTermisModule = (_extId: string) => ({
  /** * Returns true if the Termis panel is currently visible. 
   */
  get isVisible(): boolean {
    return useTermisStore.getState().isOpen;
  },

  /** * Returns the currently active view ('terminal' | 'output' | 'problems'). 
   */
  get activeView(): TermisView {
    return useTermisStore.getState().activeView;
  },

  /**
   * Open the Termis panel and show the terminal view.
   * Creates a default terminal instance if none exist.
   */
  openPanel: (): void => {
    const store = useTerminalStore.getState();
    if (store.instances.length === 0) store.createInstance();
    useTermisStore.getState().setActiveView('terminal');
    ensureTermisTabOpen();
  },

  /** Close / hide the Termis panel. */
  closePanel: (): void => {
    useTermisStore.getState().closePanel();
  },

  /**
   * Switch the active view inside the Termis panel.
   *
   * @example
   * mscode.termis.setActiveView('output');  // show Output tab
   */
  setActiveView: (view: TermisView): void => {
    useTermisStore.getState().setActiveView(view);
    ensureTermisTabOpen();
  },

  // ────────────────────────────────────────────────────────
  // EVENT LISTENERS
  // ────────────────────────────────────────────────────────

  /**
   * Fired when the Termis panel is opened or becomes visible.
   */
  onDidOpenTermisPanel: (handler: () => void) => {
    return { dispose: msEvents.on('onDidOpenTermisPanel', handler) };
  },

  /**
   * Fired when the Termis panel is closed or hidden.
   */
  onDidCloseTermisPanel: (handler: () => void) => {
    return { dispose: msEvents.on('onDidCloseTermisPanel', handler) };
  },

  /**
   * Fired when the active view inside the Termis panel changes.
   * @param handler Callback receiving the new view name ('terminal' | 'output' | 'problems').
   */
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