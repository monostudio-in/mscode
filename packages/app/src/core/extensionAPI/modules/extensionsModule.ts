// src/core/extensionAPI/modules/extensionsModule.ts

import { useExtensionStore } from '@/features/extensions/store/extensionStore';
import { ExtensionHost } from '@/features/extensions/services/extensionHost';
import { useActivityBarStore } from '@/store/activityBarStore';

/**
 * Public metadata structure representing an installed extension.
 * Provides read-only access to extension properties without exposing internal store mutators.
 */
export interface ExtensionInfo {
  /** Unique string identifier of the extension (e.g., `publisher.name`). */
  readonly id: string;
  /** Human-readable display name of the extension. */
  readonly name: string;
  /** Currently installed version string. */
  readonly version: string;
  /** Indicates if the extension is currently running and active in the Extension Host. */
  readonly isActive: boolean;
  /** The full manifest object parsed from `manifest.json`. */
  readonly packageJSON: any;
}

/**
 * Factory function generating the Extensions API for a specific caller extension.
 * Allows extensions to query, discover, and interact with the IDE's extension ecosystem.
 * * @param callerExtId The ID of the extension requesting this API.
 */
export const createExtensionsModule = (_callerExtId: string) => {
  return {
    /**
     * Retrieves an array of all currently installed extensions.
     * * @returns {ExtensionInfo[]} A list of extension metadata objects.
     * @example
     * ```typescript
     * const allExts = mscode.extensions.all();
     * console.log(`There are ${allExts.length} extensions installed.`);
     * ```
     */
    all: (): ExtensionInfo[] => {
      const { allExtensions, records } = useExtensionStore.getState();
      return allExtensions
        .filter(ext => records[ext.id]) // Only return actually installed ones
        .map(ext => ({
          id: ext.id,
          name: ext.name,
          version: ext.version,
          isActive: ExtensionHost.isActive(ext.id),
          packageJSON: ext
        }));
    },

    /**
     * Retrieves details about a specific extension by its unique ID.
     * * @param extensionId The full ID of the target extension (e.g., `ms.python`).
     * @returns {ExtensionInfo | undefined} The extension metadata, or undefined if not installed.
     * @example
     * ```typescript
     * const gitExt = mscode.extensions.getExtension('mscode.git');
     * if (!gitExt?.isActive) {
     * mscode.window.showWarningMessage("Please enable the Git extension first!");
     * }
     * ```
     */
    getExtension: (extensionId: string): ExtensionInfo | undefined => {
      const { allExtensions, records } = useExtensionStore.getState();
      const ext = allExtensions.find(e => e.id === extensionId);
      
      if (!ext || !records[ext.id]) return undefined;

      return {
        id: ext.id,
        name: ext.name,
        version: ext.version,
        isActive: ExtensionHost.isActive(ext.id),
        packageJSON: ext
      };
    },

    /**
     * Programmatically installs an extension from the cloud marketplace.
     * Helpful for creating "Extension Packs" that automatically pull down dependencies.
     * * @param extensionId The ID of the extension to install.
     * @returns {Promise<boolean>} True if installation succeeded, false otherwise.
     */
    installExtension: async (extensionId: string): Promise<boolean> => {
      try {
        await useExtensionStore.getState().install(extensionId);
        return true;
      } catch (error) {
        console.error(`[Extension API] Failed to install ${extensionId}:`, error);
        return false;
      }
    },

    /**
     * Opens the internal Extensions Sidebar View and optionally applies a search query.
     * Ideal for redirecting users to install a recommended tool or theme.
     * * @param searchQuery Optional text to inject into the marketplace search bar.
     * @example
     * ```typescript
     * // Open the marketplace and search for Python tools
     * mscode.extensions.showMarketplace('@category:languages python');
     * ```
     */
    showMarketplace: (searchQuery?: string): void => {
      // 1. Open the Extensions sidebar panel
      const extPanelButton = useActivityBarStore.getState().topItems.find(i => i.id === 'extensions');
      if (extPanelButton && extPanelButton.onClick) {
        extPanelButton.onClick();
      }

      // 2. Set the search filter if provided
      if (searchQuery !== undefined) {
        useExtensionStore.getState().setFilter({ query: searchQuery });
      }
    }
  };
};