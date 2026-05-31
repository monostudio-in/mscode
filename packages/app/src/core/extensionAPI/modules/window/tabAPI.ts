// src/core/extensionAPI/modules/window/tabAPI.ts

import type { Tab } from '@/store/tabStore';
import { useTabStore } from '@/store/tabStore';
import { msEvents } from '@/core/extensionAPI/events/EventManager';

/**
 * Factory function to create the Tab API for extensions.
 * Provides methods to manage the editor tab system and subscribe to tab-related events.
 */
export const createTabAPI = () => ({
  
  /**
   * Retrieves a list of all currently open tabs.
   * @returns {Tab[]} An array of Tab objects.
   */
  get tabs(): Tab[] {
    return useTabStore.getState().tabs;
  },

  /**
   * Retrieves the currently active (focused) tab.
   * @returns {Tab | undefined} The active Tab object or undefined if no tabs are open.
   */
  get activeTab(): Tab | undefined {
    const { tabs, activeTabId } = useTabStore.getState();
    return tabs.find(t => t.id === activeTabId);
  },

  /**
   * Opens a new tab or switches focus to it if it is already open.
   * @param tabOptions Configuration for the tab. Must include unique 'id', 'title', and 'type'.
   * @example
   * mscode.window.openTab({ 
   *   id: '/path/file.js', 
   *   title: 'file.js', 
   *   type: 'code', 
   *   filePath: '/path/file.js' 
   * });
   */
  openTab: (tabOptions: Partial<Tab> & { id: string; title: string; type: Tab['type'] }) => {
    useTabStore.getState().addTab(tabOptions as Tab);
  },

  /**
   * Closes a specific tab by its unique identifier.
   * @param tabId The unique ID of the tab to be closed.
   */
  closeTab: (tabId: string) => {
    useTabStore.getState().closeTab(tabId);
  },

  /**
   * Closes all currently open tabs at once.
   */
  closeAllTabs: () => {
    useTabStore.getState().clearTabs();
  },

  /**
   * Programmatically switches focus to a specific tab.
   * @param tabId The unique ID of the tab to focus.
   */
  focusTab: (tabId: string) => {
    useTabStore.getState().setActiveTab(tabId);
  },
  
  // ────────────────────────────────────────────────────────
  // EVENT LISTENERS
  // ────────────────────────────────────────────────────────
  
  /**
   * Fired immediately after a new tab is opened.
   * @param handler Callback function receiving the opened Tab object.
   * @returns An object with a dispose method to unsubscribe.
   */
  onDidOpenTab: (handler: (tab: Tab) => void) => {
    return { dispose: msEvents.on('onDidOpenTab', handler) };
  },

  /**
   * Fired when a tab is closed.
   * @param handler Callback function receiving the ID of the closed tab.
   * @returns An object with a dispose method to unsubscribe.
   */
  onDidCloseTab: (handler: (tabId: string) => void) => {
    return { dispose: msEvents.on('onDidCloseTab', handler) };
  },

  /**
   * Fired when the user switches between tabs or when the active tab changes.
   * @param handler Callback function receiving the new active Tab or undefined if all tabs are closed.
   * @returns An object with a dispose method to unsubscribe.
   */
  onDidChangeActiveTab: (handler: (tab: Tab | undefined) => void) => {
    return { dispose: msEvents.on('onDidChangeActiveTab', handler) };
  }
  
});
