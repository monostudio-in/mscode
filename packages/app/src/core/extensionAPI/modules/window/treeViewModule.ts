// src/core/extensionAPI/modules/window/treeViewModule.ts

import { useTreeViewRegistry, type TreeDataProvider } from '@/core/extensionAPI/registry/treeViewRegistry';

/**
 * Handle contract returned to extensions when instantiating a custom tree interface.
 * * This instance exposes standard lifecycle modifiers allowing plugins to dynamically control
 * visibility states, trigger structural mutations, or safely unbind memory locks.
 */
export interface TreeView {
  /** The unique channel identifier matching this structural panel slot (e.g. `'npmScriptsExplorer'`). */
  readonly id: string;

  /**
   * Title text rendered dynamically inside the sidebar container panel wrapper.
   */
  title: string;

  /**
   * Safe destructor sequence removing this structural tree container context immediately from the core system state.
   */
  dispose(): void;
}

/**
 * Metadata configuration settings supplied by extensions during custom Tree initialization blocks.
 */
export interface TreeViewOptions {
  /** Dynamic data-source abstraction layer feeding nested labels, icons, badges, and async child streams to the UI. */
  treeDataProvider: TreeDataProvider;
  
  /** Natural text caption rendered visible to users inside the sidebar header. */
  title?: string;
}

/**
 * Factory Module Orchestrator wrapping the core Zustand registry to safely deploy extension-contributed hierarchies.
 * * Connects third-party asynchronous tree data models directly into the reactive `useTreeViewRegistry` pipeline.
 * * @param _extId The validated identity string capturing the active extension package signature.
 */
export const createTreeViewModule = (_extId: string) => ({
  /**
   * ## `mscode.window.createTreeView`
   * * Allocates and hooks a stateful, data-agnostic tree container view into the application framework.
   * Leverages the `GenericTreeView` visual component upstream by binding the target data provider inside the global registry.
   * * ### Extension API Usage & Dynamic Tree Data Pipeline
   * Extensions feed structured or asynchronous tree data seamlessly by initializing compliant provider contracts:
   * * @example
   * ```typescript
   * // 1. Construct a structural provider handling database data streams
   * const databaseProvider = {
   * getChildren: async (element?: TreeItem) => {
   * if (!element) {
   * // Root level nodes definition
   * return [{ id: 'cluster-1', label: 'Production_Cluster', collapsibleState: 'expanded' }];
   * }
   * // Sub-option lazy fetch trigger
   * return [{ id: 'table-users', label: 'Users_Schema', collapsibleState: 'none', icon: 'file' }];
   * },
   * onItemClick: (item) => {
   * mscode.window.showInformationMessage(`Opening database schema: ${item.label}`);
   * }
   * };
   * * // 2. Bind the provider securely using your treeView API module
   * const myDatabaseTree = mscode.window.createTreeView('mySqlExplorerView', {
   * title: 'SQL Database Explorer',
   * treeDataProvider: databaseProvider
   * });
   * * // 3. Dynamically alter the header tracking title at runtime if needed
   * myDatabaseTree.title = 'Production Cloud Cluster';
   * * // 4. Clean up the container layout stack when the extension deactivates
   * // myDatabaseTree.dispose();
   * ```
   * * ### Subsystem Architecture Data Flow
   * ```
   * [Extension Logic] ──> mscode.window.createTreeView(viewId, options)
   * │
   * ▼ (Invokes Zustand Registry Setter)
   * useTreeViewRegistry.getState().register({ viewId, title, provider })
   * │
   * ▼ (Emits Reactive State Cascade)
   * [GenericTreeView UI Layer] ──> Renders Custom Collapsible Graph
   * │
   * ▼ (On Extension Termination)
   * treeView.dispose() ──> Ejects item from Zustand Registry Array
   * ```
   * * @param viewId The unique structural registration target path across the layout mapping coordinates.
   * @param options Core tracking attributes configuration container holding providers and descriptors.
   * @returns An instantiated state handle conforming to the strict structural `TreeView` contract layer.
   */
  createTreeView: (viewId: string, options: TreeViewOptions): TreeView => {
    // Extract the global Zustand store registration interface endpoints directly
    const registry = useTreeViewRegistry.getState();
    
    // Fallback baseline header titles if an explicit title field configuration is missing
    let currentTitle = options.title || 'Extension View';

    // Build operational data tracking structure matching the exact RegisteredTreeView format
    const initialViewData = {
      viewId,
      title: currentTitle,
      provider: options.treeDataProvider
    };

    // Push into the Zustand reactive store arrays. Automatically replaces dead indices on extension reloads.
    registry.register(initialViewData);

    // Return the reactive proxy object allowing extensions runtime lifecycle adjustments
    return {
      id: viewId,
      
      get title() {
        return currentTitle;
      },
      
      set title(newTitle: string) {
        currentTitle = newTitle;
        // Re-inject updated configuration mappings straight back into the live Zustand pipeline state
        useTreeViewRegistry.getState().register({
          viewId,
          title: currentTitle,
          provider: options.treeDataProvider
        });
      },
      
      dispose: () => {
        // Safe context ejection preventing memory grid leakages across application sessions
        useTreeViewRegistry.getState().unregister(viewId);
      }
    };
  }
});

export type TreeViewModule = ReturnType<typeof createTreeViewModule>;