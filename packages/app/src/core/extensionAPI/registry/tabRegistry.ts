// src/core/extensionAPI/registry/tabRegistry.ts
import React from 'react';

type TabComponent = React.FC<any>;

class TabRegistry {
  private components = new Map<string, TabComponent>();

  /**
   * Registers custom tabs from third-party extensions.
   * @param type The unique type of the tab (e.g., 'extId.database-viewer').
   * @param component The React component that will be rendered in the tab.
   */
  registerTab(type: string, component: TabComponent) {
    this.components.set(type, component);
  }

  /**
   * Unregisters a custom tab to prevent memory leaks when an extension deactivates.
   */
  unregisterTab(type: string) {
    this.components.delete(type);
  }
  getTab(type: string): TabComponent | undefined {
    return this.components.get(type);
  }
}

export const tabRegistry = new TabRegistry();