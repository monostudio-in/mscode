// src/core/extensionAPI/modules/themesModule.ts

import { themeService } from '@/core/theme/service/themeService';
import { useThemeStore }  from '@/core/theme/store/themeStore';
import type { ThemeDefinition } from '@/core/theme/types';
import { msEvents } from '@/core/extensionAPI/events/EventManager';

/**
 * ##  Mono Studio Theme Extension API
 *
 * Extension developers can contribute beautiful themes to Mono Studio in three flexible ways.
 * Choose the method that best fits your extension's workflow:
 *
 * ---
 *
 * ###  Method 1: Contribution (The Declarative No-Code Way)
 *
 * This follows the standard VS Code approach. **No JavaScript or TypeScript logic is required.**
 * The editor automatically reads your `manifest.json` at boot time to register the theme asset path.
 *
 * :::info[Manifest Approach]
 * This is the recommended approach for static theme distributions.
 * :::
 *
 * ```json title="manifest.json"
 * {
 * "id": "my-studio.ocean-blue",
 * "version": "1.0.0",
 * "contributes": {
 * "themes": [
 * {
 * "label": "Ocean Blue",
 * "uiTheme": "vs-dark",
 * "path": "./themes/ocean-blue.json"
 * }
 * ]
 * }
 * }
 * ```
 *
 * ---
 *
 * ###  Method 2: `mscode.themes.register()` (In-Memory Runtime Registration)
 *
 * Use this when your theme is defined dynamically as a **Type-Safe JavaScript/TypeScript object**
 * already loaded or generated in memory.
 *
 * ```js title="extension.js"
 * import oceanBlueTheme from './themes/ocean-blue.js';
 * * export function activate(mscode) {
 * // Pass the theme object directly into the registry
 * const disposable = mscode.themes.register(oceanBlueTheme);
 * * // Ensure the theme is unmounted when the extension is deactivated
 * return {
 * deactivate: () => disposable.dispose()
 * };
 * }
 * ```
 *
 * ---
 *
 * ### Method 3: `mscode.themes.registerFromJson()` (Remote & File-System Streams)
 *
 * Ideal for advanced use cases where themes are fetched dynamically from a **remote database/API**
 * or read as raw text streams from the local file system. This method handles parsing safely.
 *
 * :::tip[Pro Tip]
 * Use this to build extensions like "Daily Theme Updates" or cloud-synced themes!
 * :::
 *
 * ```js title="extension.js"
 * export async function activate(mscode) {
 * try {
 * // Example: Fetching from a remote server/database
 * const response = await fetch('[https://api.my-studio.com/daily-theme.json](https://api.my-studio.com/daily-theme.json)');
 * const rawData = await response.text();
 *
 * // Registrations accept both raw stringified JSON or parsed structures
 * const disposable = mscode.themes.registerFromJson(rawData);
 * * return {
 * deactivate: () => disposable.dispose()
 * };
 * } catch (err) {
 * console.error("Failed to load dynamic theme", err);
 * }
 * }
 * ```
 */
export const createThemesModule = (extId: string) => ({
  themes: {
    /**
     * Registers a pre-defined TypeScript/JavaScript theme object.
     * @param def The theme definition object.
     * @returns A disposable object to unregister the theme on deactivation.
     */
    register: (def: ThemeDefinition) => {
      const disposable = themeService.registerTheme(def, extId);
      useThemeStore.getState().sync();
      return disposable;
    },

    /**
     * Registers a theme from a raw JSON string or object.
     * @param json A valid theme JSON string or object.
     * @returns A disposable object to unregister the theme.
     */
    registerFromJson: (json: string | object) => {
      const parsed = typeof json === 'string' ? JSON.parse(json) : json;
      const disposable = themeService.registerFromJson(parsed, extId);
      useThemeStore.getState().sync();
      return disposable;
    },

    /** * Returns the unique ID of the currently active theme.
     * @returns {string} The active theme ID.
     */
    getActiveThemeId: () => themeService.getActiveThemeId(),

    /** * Switches the editor to a registered theme.
     * @param id The unique ID of the theme to apply.
     */
    setTheme: (id: string) => useThemeStore.getState().setTheme(id),

    /** * Retrieves a list of all registered themes (built-in and extension-contributed).
     * @returns {ThemeDefinition[]} Array of theme definitions.
     */
    getAll: () => themeService.getAllThemes(),
    
    onDidChangeColorTheme: (callback: (themeId: string) => void) => {
      return msEvents.on('onDidChangeColorTheme', callback);
    }
  },
});