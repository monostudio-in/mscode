// src/core/theme/store/themeStore.ts

import { create } from 'zustand';
import { themeService } from '../service/themeService';
import type { ThemeRegistryEntry } from '../types';
import { useSettingsStore } from '@/features/settings/store/settingsStore';

interface ThemeState {
  /** The current active theme identity string token */
  activeThemeId: string;
  /** Complete array of loaded and available theme registration entries */
  themes: ThemeRegistryEntry[];
  /** Forces the store to synchronize its internal states with the ThemeService data cache */
  sync: () => void;
  /** Triggers a global theme change event and persists the selection to configurations */
  setTheme: (id: string) => void;
}

/**
 * Reactive Theme Store.
 * Provides a synchronized state container connecting background configuration services
 * to front-end reactive layout components, driving instantaneous UI modifications.
 */
export const useThemeStore = create<ThemeState>((set) => {
  
  // Establish an active reactive listener over the settings store matrix.
  // Fires instantly when configuration layers alter values via UI menus or structural settings.json alterations.
  useSettingsStore.subscribe((state: any) => {
    const selectedTheme = state.settings['workbench.theme'];
    
    if (
      selectedTheme && 
      selectedTheme !== themeService.getActiveThemeId() && 
      themeService.hasTheme(selectedTheme)
    ) {
      // Defer persistence flags during propagation loops since mutations originated 
      // directly inside the persistent settings model data layer itself.
      themeService.applyTheme(selectedTheme, false); 
      
      set({
        activeThemeId: themeService.getActiveThemeId(),
        themes:        themeService.getAllThemes(),
      });
    }
  });

  return {
    activeThemeId: 'mscode-dark',
    themes:        [],

    sync: () => set({
      activeThemeId: themeService.getActiveThemeId(),
      themes:        themeService.getAllThemes(),
    }),

    setTheme: (id) => {
      // Execution path matching active user selection inputs (e.g., Command Palette interactions).
      // Dispatches state mutations downstream and triggers persistence storage pipeline saves.
      themeService.applyTheme(id); 
      
      set({
        activeThemeId: themeService.getActiveThemeId(),
        themes:        themeService.getAllThemes(),
      });
    },
  };
});
