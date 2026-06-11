// src/core/extensionAPI/modules/themesModule.ts

import { themeService } from '@/core/theme/service/themeService';
import { useThemeStore }  from '@/core/theme/store/themeStore';
import type { ThemeDefinition } from '@/core/theme/types';

import { iconThemeService, type IconThemeDefinition } from '@/core/theme/service/iconThemeService';
import { fileIconRegistry } from '@/core/extensionAPI/registry/FileIconRegistry';

import { msEvents } from '@/core/extensionAPI/events/EventManager';

/**
 * ##  Mono Studio Theme Extension API
 * 
 */
export const createThemesModule = (extId: string) => ({
  
  // COLOR THEMES API
  color: {
    /**
     * Registers a pre-defined TypeScript/JavaScript color theme object.
     * @example
     * const disposable = mscode.themes.color.register(oceanBlueTheme);
     */
    register: (def: ThemeDefinition) => {
      const disposable = themeService.registerTheme(def, extId);
      useThemeStore.getState().sync();
      return disposable;
    },

    /**
     * Registers a color theme from a raw JSON string or object.
     */
    registerFromJson: (json: string | object) => {
      const parsed = typeof json === 'string' ? JSON.parse(json) : json;
      const disposable = themeService.registerFromJson(parsed, extId);
      useThemeStore.getState().sync();
      return disposable;
    },

    /** Returns the unique ID of the currently active color theme. */
    getActiveThemeId: () => themeService.getActiveThemeId(),

    /** Switches the editor to a registered color theme. */
    setTheme: (id: string) => useThemeStore.getState().setTheme(id),

    /** Retrieves a list of all registered color themes. */
    getAll: () => themeService.getAllThemes(),
    
    /** Fires when the active color theme changes. */
    onDidChangeColorTheme: (callback: (themeId: string) => void) => {
      return msEvents.on('onDidChangeColorTheme', callback);
    }
  },

  // ICON THEMES API
  icon: {
    /**
     * Registers a pre-defined TypeScript/JavaScript icon theme object.
     * @example
     * const disposable = mscode.themes.icon.register(materialIconsTheme);
     */
    register: (def: IconThemeDefinition) => {
      iconThemeService.registerIconTheme(def);
      return { dispose: () => iconThemeService.unregisterIconTheme(def.id) };
    },

    /**
     * Registers an icon theme from a raw JSON string or object.
     */
    registerFromJson: (json: string | object) => {
      const parsed = typeof json === 'string' ? JSON.parse(json) : json;
      const def = parsed as IconThemeDefinition;
      iconThemeService.registerIconTheme(def);
      return { dispose: () => iconThemeService.unregisterIconTheme(def.id) };
    },

    /** Returns the unique ID of the currently active icon theme. */
    getActiveThemeId: () => iconThemeService.getActiveThemeId(),

    /** Switches the file explorer to a registered icon theme. */
    setTheme: (id: string) => iconThemeService.applyTheme(id),

    /** Retrieves a list of all registered icon themes. */
    getAll: () => iconThemeService.getAllThemes(),

    /** Resolves the correct icon name for a specific file or folder. */
    getFileIcon: (fileName: string, isDirectory: boolean, isOpen: boolean = false) => {
      return fileIconRegistry.getFileIcon(fileName, isDirectory, isOpen);
    },
    
    /** Resolves the correct icon name for a specific language ID. */
    getLanguageIcon: (langId: string) => {
      return fileIconRegistry.getLanguageIcon(langId);
    },

    /** Fires when the active icon theme changes. */
    onDidChangeIconTheme: (callback: (themeId: string) => void) => {
      return { dispose: msEvents.on('onDidChangeIconTheme', callback) };
    }
  }
  
});

export type ThemesModule = ReturnType<typeof createThemesModule>;