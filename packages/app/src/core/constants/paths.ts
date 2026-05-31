// src/core/constants/paths.ts

/**
 * ⚠️ NOTE: This central registry file has been drafted but is NOT YET YOKED / USED
 * anywhere in the application. Integrate this whenever refactoring hardcoded paths.
 */

/**
 * Matrix Studio Path & URL Central Registry
 * Centralizes all application paths and URL generation.
 * Modifying values here will update path routing across the entire application,
 * making future production migrations or remote server setups seamless.
 */

const IS_PROD = import.meta.env.PROD;
const APP_ORIGIN = window.location.origin;

export const PATHS = {
  APP_ORIGIN,

  // ─── Local Development vs Production Paths ─────────────────────────────────
  // In development, extensions are read directly from the local source directory.
  // In production, they will be served from public assets or the device's local storage.
  EXT_DEV_STORE_PREFIX: '/src/local/extensions/store',
  EXT_PROD_STORE_PREFIX: '/public/extensions/installed',

  // ─── Extension URL Generators ──────────────────────────────────────────────

  /**
   * Generates the root/base URL for a given extension.
   * Used for fetching source bundles or mounting the extension sandbox environment.
   * * @param storeDir - The local directory name used during development.
   * @param extId - The unique extension Identifier used for production builds.
   */
  getExtensionBaseUrl(storeDir: string, extId?: string): string {
    const prefix = IS_PROD ? this.EXT_PROD_STORE_PREFIX : this.EXT_DEV_STORE_PREFIX;
    // In production, folders are resolved by unique ID; in development, they map to storeDir.
    const folder = IS_PROD && extId ? extId : storeDir;
    return `${APP_ORIGIN}${prefix}/${folder}/`;
  },

  /**
   * Resolves the absolute URL for specific assets inside an extension's folder.
   * Useful for loading icons, configuration JSONs, snippets, or dynamic web workers.
   * * @param storeDir - The extension's development folder name.
   * @param assetPath - Relative path to the asset (e.g., 'icon.png' or '/snippets.json').
   * @param extId - Optional production extension ID.
   */
  getExtensionAssetUrl(storeDir: string, assetPath: string, extId?: string): string {
    const baseUrl = this.getExtensionBaseUrl(storeDir, extId);
    // Sanitizes leading slashes from the assetPath to prevent malformed double slashes in the URL
    return `${baseUrl}${assetPath.replace(/^\//, '')}`;
  },

  // ─── Remote Extensions Marketplace API (For Future Implementation) ─────────
  API: {
    MARKETPLACE_REGISTRY: 'https://api.monostudio.com/extensions',
    DOWNLOAD_EXTENSION: (id: string) => `https://api.monostudio.com/extensions/${id}/download`,
    TELEMETRY: 'https://api.monostudio.com/telemetry'
  }
};
