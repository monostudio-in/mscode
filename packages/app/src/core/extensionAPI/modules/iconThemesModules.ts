// src/core/extensionAPI/modules/iconThemesModule.ts

import { iconThemeService, type IconThemeDefinition } from '@/core/theme/service/iconThemeService';
import { msEvents } from '@/core/extensionAPI/events/EventManager';

export const createIconThemesModule = (_extId: string) => ({
  iconThemes: {
    /**
     * Registers a Type-Safe JavaScript/TypeScript icon theme object.
     */
    register: (def: IconThemeDefinition) => {
      iconThemeService.registerIconTheme(def);
      return { dispose: () => { /* TODO: Unregister logic */ } };
    },

    /**
     * Registers an icon theme from a raw JSON string or object.
     */
    registerFromJson: (json: string | object) => {
      const parsed = typeof json === 'string' ? JSON.parse(json) : json;
      const def = parsed as IconThemeDefinition;
      iconThemeService.registerIconTheme(def);
      return { dispose: () => { /* TODO: Unregister logic */ } };
    },

    /** Returns the unique ID of the currently active icon theme. */
    getActiveThemeId: () => iconThemeService.getActiveThemeId(),

    /** Switches the editor to a registered icon theme. */
    setTheme: (id: string) => iconThemeService.applyTheme(id),

    /** Retrieves a list of all registered icon themes. */
    getAll: () => iconThemeService.getAllThemes(),

    // Event Listener API for Extensions
    /**
     * Fires when the active icon theme changes.
     * @returns A function to unsubscribe from the event.
    
     * @example
     * 
     * const themeListener = mscode.themes.onDidChangeColorTheme((newThemeId) => {
     *      console.log("Color theme changed to:", newThemeId);ে
     *   });
     */
    onDidChangeIconTheme: (callback: (themeId: string) => void) => {
      return msEvents.on('onDidChangeIconTheme', callback);
    }
  },
});

