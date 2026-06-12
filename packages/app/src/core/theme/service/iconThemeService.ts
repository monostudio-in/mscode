// src/core/theme/service/iconThemeService.ts 

import { fileIconRegistry, type IconThemeMap } from '@/core/extensionAPI/registry/FileIconRegistry';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { configRegistry } from '@/core/extensionAPI/registry/configurationRegistry';
import defaultThemeMap from '@/core/constants/defaultIconTheme';

import { msEvents } from '@/core/extensionAPI/events/EventManager';

export interface IconThemeDefinition {
  id: string;
  name: string;
  themeMap: Partial<IconThemeMap>;
}

class IconThemeService {
  private registry = new Map<string, IconThemeDefinition>();
  private activeId = 'mscode-icons';
  private pendingThemeId: string | null = null;

  constructor() {
    this.registry.set('mscode-icons', {
      id: 'mscode-icons',
      name: 'MS Code Icons (Default)',
      themeMap: defaultThemeMap
    });
  }

  public init() {
    this._updateSettingsOptions();
    const savedId = useSettingsStore.getState().settings['workbench.iconTheme'];
    
    if (savedId && !this.registry.has(savedId)) {
      this.pendingThemeId = savedId;
      this.applyTheme('mscode-icons');
    } else {
      this.applyTheme(savedId || 'mscode-icons');
    }
    
  }

  public applyTheme(id: string) {
    const theme = this.registry.get(id) || this.registry.get('mscode-icons');
    if (!theme) return;

    this.activeId = theme.id;
    fileIconRegistry.loadIconTheme(theme.themeMap);
    useSettingsStore.getState().updateSetting('workbench.iconTheme', theme.id);
    
    msEvents.emit('onDidChangeIconTheme', theme.id);
  }

  public registerIconTheme(def: IconThemeDefinition) {
    this.registry.set(def.id, def);
    this._updateSettingsOptions();
    
    if (this.pendingThemeId === def.id || this.activeId === def.id) {
      this.applyTheme(def.id);
      this.pendingThemeId = null;
    }
  }

  public unregisterIconTheme(id: string) {
    if (id === 'mscode-icons') return; // Protect the default built-in theme!
    
    this.registry.delete(id);
    this._updateSettingsOptions(); // Remove from settings dropdown
    
    // If the user was currently using the deleted theme, fallback to default
    if (this.activeId === id) {
      this.applyTheme('mscode-icons');
    }
  }
  

  public getAllThemes() {
    return Array.from(this.registry.values());
  }
  public getActiveThemeId(): string {
    return this.activeId;
  }

  private _updateSettingsOptions() {
    configRegistry.registerConfiguration({
      id: 'workbench_icon_theme_update',
      title: 'Workbench',
      properties: {
        'workbench.iconTheme': {
          title: 'File Icon Theme',
          category: 'Workbench',
          subCategory: 'Appearance',
          type: 'select',
          defaultValue: 'mscode-icons',
          options: this.getAllThemes().map(t => ({ label: t.name, value: t.id }))
        }
      }
    });
  }
}

export const iconThemeService = new IconThemeService();