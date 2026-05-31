// src/core/extensionAPI/modules/workspace/configurationAPI.ts

import { configRegistry }   from '@/core/extensionAPI/registry/configurationRegistry';
import { useSettingsStore }  from '@/features/settings/store/settingsStore';
import type { IConfigurationSection } from '@/core/extensionAPI/registry/configurationRegistry';

/**
 * Factory function to create the Configuration API.
 * @param {string} extId - The unique identifier of the extension.
 */
export const createConfigurationAPI = (extId: string) => ({
  /**
   * Accesses configuration settings for a specific section.
   * @param {string} [section] - The configuration section (e.g., 'editor', 'terminal').
   * @returns An object containing the `get` method for the specified section.
   */
  getConfiguration: (section?: string) => ({
    /**
     * Retrieves a configuration value.
     * @template T - The expected type of the configuration value.
     * @param {string} key - The configuration key.
     * @param {T} [defaultValue] - The fallback value if the key is not found.
     * @returns {T} The value from settings or the provided default.
     */
    get: <T = any>(key: string, defaultValue?: T): T => {
      const fullKey = section ? `${section}.${key}` : key;
      const val     = useSettingsStore.getState().settings[fullKey];
      return val !== undefined ? (val as T) : (defaultValue as T);
    },
  }),

  /**
   * Registers a new configuration schema to the IDE settings UI.
   * @param {IConfigurationSection} schema - The configuration schema defining properties and defaults.
   * @returns An object with a `dispose` method to unregister the settings.
   */
  registerConfiguration: (schema: IConfigurationSection) => {
    configRegistry.registerConfiguration(schema);
    useSettingsStore.getState().mergeDefaults(configRegistry.getDefaults());

    return {
      /** Unregisters the configuration associated with this extension. */
      dispose: () => {
        (configRegistry as any).removeSettingsByTag?.(extId);
      },
    };
  },
});
