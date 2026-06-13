// src/features/settings/store/settingsStore.ts
import { create } from 'zustand';
import { getDefaultSettings } from '@/features/settings/config/settingsSchema';
import { saveUserSettingsText, loadUserSettingsText } from '@/core/services/storageService';
import { generateSettingsJSONC, parseJSONC } from '@/utils/jsoncUtils';

/**
 * Interface schema defining the global application settings store state properties and mutation handlers.
 * Binds localized user overrides seamlessly with native core and third-party extension schemas.
 */
interface SettingsState {
  /** * A flat key-value database dictionary containing active running configurations.
   * Key formats utilize structured namespaces (e.g., `'workbench.sidebar.hamburgerAction'` or `'myLinter.enable'`).
   */
  settings: Record<string, any>;

  /**
   * Mutates or updates a specific configuration key and immediately commits the payload to the local file system.
   * @param id Fully qualified target configuration namespace path descriptor.
   * @param value The active configuration payload value mapping to inject.
   */
  updateSetting: (id: string, value: any) => void;

  /**
   * Safe-injects runtime fallback configurations supplied by newly activated platform extensions.
   * Consumes schema properties gracefully without modifying existing structural user modifications.
   * @param newDefaults Map record dictionary container containing target template default values.
   */
  mergeDefaults: (newDefaults: Record<string, unknown>) => void;

  /**
   * Completely flushes localized overrides, forcing all system keys to return immediately to original factory defaults.
   */
  resetToDefaults: () => void;

  /**
   * Boot pipeline controller fetching, parsing, and deserializing saved configuration logs directly from disk boundaries.
   * Merges user profiles gracefully over native configuration structures during early boot sequences.
   */
  initSettings: () => Promise<void>;

  /**
   * Delta evaluation engine analyzing changes in active values compared against structural framework defaults.
   * Encodes modifications safely back into clean JSONC blocks before writing directly to the target storage service.
   */
  saveSettingsToDisk: () => Promise<void>;
}

/**
 * Internal Platform Store Engine: System Settings Coordinator.
 * Manages atomic runtime variables, parses JSONC file streams, and triggers delta system disk flushes.
 * * @internal Third-party extensions should not interact with this store layer directly. Use the public `workspace.getConfiguration()` API proxy instead.
 */
export const useSettingsStore = create<SettingsState>((set, get) => ({
  // INITIAL STATE & CONFIGURATION DEFAULTS
  settings: getDefaultSettings(),
  updateSetting: (id, value) => {
    set((state) => ({
      settings: { ...state.settings, [id]: value }
    }));
    get().saveSettingsToDisk();
  },

  mergeDefaults: (newDefaults) => {
    set(state => {
      const merged = { ...state.settings };
      let changed = false;
      
      // Enforce lookup barriers to shield user custom overrides from collision risks
      for (const [key, val] of Object.entries(newDefaults)) {
        if (!(key in merged)) {
          merged[key] = val;
          changed = true;
        }
      }
      return changed ? { settings: merged } : state; 
    });
    
    // Commit adjustments if verification matrices detect missing extension footprints
    get().saveSettingsToDisk();
  },

  resetToDefaults: async () => {
    const defaults = getDefaultSettings();
    set({ settings: defaults });
    await get().saveSettingsToDisk(); 
  },

  initSettings: async () => {
    const jsoncText = await loadUserSettingsText();
    const defaults = getDefaultSettings();

    if (jsoncText) {
      // Decode commented layout formats securely using the JSONC parsing matrix
      const userConfig = parseJSONC(jsoncText);
      set({ settings: { ...defaults, ...userConfig } });
    } else {
      // Initialize an automated clean fallback template file if disk queries return null
      get().saveSettingsToDisk();
    }
  },

  saveSettingsToDisk: async () => {
    const { settings } = get();
    const defaults = getDefaultSettings();
    const overridesOnly: Record<string, any> = {};
    
    // Delta Scan Loop: Only serializes keys changed from system factory profiles
    Object.keys(settings).forEach(key => {
      if (settings[key] !== defaults[key]) {
        overridesOnly[key] = settings[key];
      }
    });

    // Format structural blocks into readable layout structures with internal comments
    const jsoncString = generateSettingsJSONC(overridesOnly);
    await saveUserSettingsText(jsoncString);
  }
}));