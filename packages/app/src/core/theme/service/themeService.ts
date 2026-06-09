// src/core/theme/service/themeService.ts

import * as monaco from 'monaco-editor';
import { configRegistry } from '@/core/extensionAPI/registry/configurationRegistry';
import { useSettingsStore } from '@/features/settings/store/settingsStore'; 
import { useThemeStore } from '@/core/theme/store/themeStore';
import { msEvents } from '@/core/extensionAPI/events/EventManager';
import type { ThemeDefinition, ThemeRegistryEntry, MSCodeUIColors } from '../types';

// Export themes
import { mscodeDarkTheme } from '../themes/mscode-dark';
import { mscodeLightTheme } from '../themes/mscode-light';
import { mscodeAmoledTheme } from '../themes/mscode-amoled';


/**
 * Direct operational design map matching static interface keys to
 * global Document Object Model (DOM) root variable selectors.
 */
const CSS_VAR_MAP: Record<keyof MSCodeUIColors, string> = {
  'ms-bg-main':                 '--ms-bg-main',
  'ms-bg-side':                 '--ms-bg-side',
  'ms-bg-activity':             '--ms-bg-activity',
  'ms-activity-hover':          '--ms-activity-hover',
  'ms-tab-inactive-bg':         '--ms-tab-inactive-bg',
  'ms-tab-active-bg':           '--ms-tab-active-bg',
  'ms-text-main':               '--ms-text-main',
  'ms-text-faded':              '--ms-text-faded',
  'ms-text-bright':             '--ms-text-bright',
  'ms-border-light':            '--ms-border-light',
  'ms-border-dark':             '--ms-border-dark',
  'ms-menu-border':             '--ms-menu-border',
  'ms-separator':               '--ms-separator',
  'ms-accent':                  '--ms-accent',
  'ms-icon-hover-bg':           '--ms-icon-hover-bg',
  'ms-menu-hover-bg':           '--ms-menu-hover-bg',
  'ms-shadow':                  '--ms-shadow',
  'ms-settings-bg':             '--ms-settings-bg',
  'ms-settings-category-color': '--ms-settings-category-color',
  'ms-settings-title-color':    '--ms-settings-title-color',
  'ms-settings-desc-color':     '--ms-settings-desc-color',
  'ms-settings-link-color':     '--ms-settings-link-color',
  'ms-input-bg':                '--ms-input-bg',
  'ms-input-fg':                '--ms-input-fg',
  'ms-input-border':            '--ms-input-border',
  'ms-input-focus-border':      '--ms-input-focus-border',
  'ms-code-bg':                 '--ms-code-bg',
  'ms-code-fg':                 '--ms-code-fg',
};

/**
 * Application Theme Orchestrator.
 * Centralizes the registration, processing, and lifecycle distribution of user interface color schemas.
 * Compiles schema tokens to synchronize CSS layout properties and native Monaco Editor viewports uniformly.
 */
class ThemeService {
  private registry = new Map<string, ThemeRegistryEntry>();
  private activeId = 'mscode-dark';
  private pendingThemeId: string | null = null; 

  constructor() {
    // Inject the native dark theme layout profile directly during instance creation
    this._addBuiltin(mscodeDarkTheme);
    this._addBuiltin(mscodeLightTheme);
    this._addBuiltin(mscodeAmoledTheme);
  }
  
  /**
   * Internal wrapper tracking system-native theme profiles.
   */
  private _addBuiltin(def: ThemeDefinition): void {
    this.registry.set(def.id, {
      definition: def,
      source: 'builtin',
      extensionId: 'builtin'
    });
  }

  /**
   * Updates user experience preference selectors within configuration dashboard screens.
   */
  private _updateSettingsOptions(): void {
    configRegistry.registerConfiguration({
      id: 'workbench_theme_update',
      title: 'Workbench',
      properties: {
        'workbench.theme': {
          title: 'Color Theme',
          category: 'Workbench',
          subCategory: 'Appearance',
          type: 'select',
          defaultValue: 'mscode-dark',
          markdownDescription: 'Specifies the color theme used in the workbench and editor.',
          options: this.getAllThemes().map(t => ({
            label: t.definition.name,
            value: t.definition.id
          }))
        }
      }
    });
  }

  /**
   * Restores historical user theme selections during core workspace boot routines.
   */
  public async init(): Promise<void> {
    this._updateSettingsOptions();
    const savedId = useSettingsStore.getState().settings['workbench.theme'];
    const themeId = (savedId && this.registry.has(savedId)) ? savedId : 'mscode-dark';
    
    this.applyTheme(themeId, false);
  }

  /**
   * Deploys a targeted color theme identity token across active UI viewports.
   * 
   * @param id Targeted absolute registration key string.
   * @param persist When true, writes tracking selection keys into persistent layout storage files.
   */
  public applyTheme(id: string, persist: boolean = true): void {
    const entry = this.registry.get(id);
    if (!entry) {
      console.warn(`[ThemeService] Abandoning application layout routine. Theme sequence missing: "${id}"`);
      return;
    }
    this._applyDefinition(entry.definition);
    this.activeId = id;
    
    if (persist) {
      this._persist(id);
    }
    
    try { 
      useThemeStore.getState().sync(); 
    } catch (e) {
      // Catch optional storage synchronizer anomalies gracefully
    }
    
    msEvents.emit('onDidChangeColorTheme', id);
  }

  /**
   * Commits the updated tracking identity back into serialization configuration files.
   */
  private async _persist(id: string): Promise<void> {
    useSettingsStore.getState().updateSetting('workbench.theme', id);
  }
 
  /**
   * Translates incoming schema configurations into low-level CSS properties and editor syntax maps.
   */
  private _applyDefinition(def: ThemeDefinition, source: string = 'builtin'): void {
    const root = document.documentElement;
    root.setAttribute('data-theme', def.id);

    // Phase 1: Bind interface background, boundary, and typographical color channels to root DOM styles
    const { uiColors } = def;
    for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
      const value = uiColors[key as keyof MSCodeUIColors];
      if (value !== undefined) {
        root.style.setProperty(cssVar, value);
      }
    }

    // Phase 2: Structural translation mapping abstract color arrays into native Monaco token configuration trees
    const rules: monaco.editor.ITokenThemeRule[] = [];
    for (const token of def.tokenColors) {
      const scopes = Array.isArray(token.scope) ? token.scope : [token.scope];
      for (const scope of scopes) {
        rules.push({
          token: scope, 
          foreground: token.settings.foreground?.replace('#', ''),
          background: token.settings.background?.replace('#', ''),
          fontStyle:  token.settings.fontStyle ?? '',
        });
      }
    }

    // Phase 3: Update Monaco context instances using standard baseline configuration options
    monaco.editor.defineTheme(def.id, {
      base:    def.type === 'light' ? 'vs' : def.type === 'high-contrast' ? 'hc-black' : 'vs-dark',
      inherit: true,   
      rules,
      colors:  def.editorColors ?? {},
    });
    monaco.editor.setTheme(def.id);

    console.log(`[ThemeService] Execution cycle completed: loaded "${def.name}" via [${source}]`);
  }

  /**
   * Registers dynamic theme configurations injected from third-party application plug-ins.
   * Handles asynchronous loading scenarios when customized profiles match pending selections.
   * 
   * @param def Configured workspace layout specifications map.
   * @param extensionId Dynamic string token identifying the structural origin extension pack.
   * @returns An unregister allocation context mapping disposable execution closures.
   */
  public registerTheme(def: ThemeDefinition, extensionId: string): { dispose: () => void } {
    // if (this.registry.has(def.id)) {
    //   return { dispose: () => {} };
    // } // Removed the early return. Now themes can be updated dynamically!
    
    this.registry.set(def.id, { definition: def, source: 'extension', extensionId });
    console.log(`[ThemeService] Dynamic configuration layer attached: "${def.name}" under allocation context [${extensionId}]`);

    this._updateSettingsOptions();

    if (this.pendingThemeId === def.id) {
      this.applyTheme(def.id, false);
      this.pendingThemeId = null; 
    }

    return {
      dispose: () => {
        this.registry.delete(def.id);
        this._updateSettingsOptions();
        if (this.activeId === def.id) {
          this.applyTheme('mscode-dark', true);
        }
      },
    };
  }

  /**
   * Decodes, tests, and parses structural workspace text assets directly into theme configuration matrices.
   * 
   * @param rawJson Deserialized structural configuration asset layout tree.
   * @param extensionId Source tracking marker representing origin context locations.
   */
  public registerFromJson(rawJson: unknown, extensionId = 'user'): { dispose: () => void } {
    const def = rawJson as ThemeDefinition;
    if (!def.id || !def.name || !def.uiColors || !def.tokenColors) {
      throw new Error('[ThemeService] Structural parsing failure — Target entity schema misses critical theme fields.');
    }
    return this.registerTheme(def, extensionId);
  }

  public getActiveThemeId(): string { return this.activeId; }
  public getActiveTheme(): ThemeDefinition | undefined { return this.registry.get(this.activeId)?.definition; }
  public getAllThemes(): ThemeRegistryEntry[] { return Array.from(this.registry.values()); }
  public hasTheme(id: string): boolean { return this.registry.has(id); }
}

export const themeService = new ThemeService();
