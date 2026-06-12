// src/core/extensionAPI/registry/configurationRegistry.ts
//
// This is the absolute core orchestration engine of the entire application configuration system.
// All decoupled features, subsystems, and external extensions register their setting profiles here.
// The layout and options panels consume configuration state solely from this central hub, remaining
// blissfully agnostic of implementation origins.

// ─── Types & Schema Definitions

export type SettingType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'       // Maps to enum dropdown selector inputs
  | 'textarea'     // Maps to multi-line text input fields
  | 'object'
  | 'array'
  | 'null';


export interface SettingDefinition {
  // ─── Identity ───────────────────────────────────────────────
  /** Fully-qualified namespace address path (e.g., 'editor.fontSize') */
  id: string;
  /** Visual header title caption label rendered on structural elements */
  title: string;
  /** Secondary or alternative natural text display descriptor */
  label?: string;

  // ─── Grouping & Layout Hierarchy ────────────────────────────
  /** Primary sidebar taxonomy categorization label (e.g., "Text Editor") */
  category: string;
  /** Secondary grouping boundary index token (e.g., "Font Configuration") */
  subCategory: string;

  // ─── Value Specifications ───────────────────────────────────
  /** Structural scalar configuration primitive target validation blueprint type */
  type: SettingType;
  /** Baseline fallback configuration instantiation state initialized by application defaults */
  defaultValue: any;

  // ─── Informational Documentation ────────────────────────────
  /** Plain text string providing baseline overview descriptions for individual settings */
  description?: string;
  /** Markdown documentation strings (takes precedence over plain text inside interactive components) */
  markdownDescription?: string;

  // ─── Enum / Selection Schemas ───────────────────────────────
  /** Explicit array objects binding key indices directly into dynamic rendering selectors */
  options?: SettingOption[];
  /** Shorthand arrays declaring primitive acceptable fallback constraints natively */
  enum?: (string | number | boolean | null)[];
  /** Plain description names associated with structural positions inside alternative enum paths */
  enumItemLabels?: string[];
  /** Rich formatting markdown text accompanying corresponding entries inside programmatic enums */
  markdownEnumDescriptions?: string[];
  /** Plain fallback context definitions tracking positions matching explicit array values */
  enumDescriptions?: string[];

  // ─── Hard Boundary Constraints ──────────────────────────────
  /** Enforces numeric minimum evaluation parameters */
  minimum?: number;
  /** Enforces numeric maximum evaluation parameters */
  maximum?: number;
  /** Regular expression validation string used to verify structure strings before saving to state */
  pattern?: string;
  /** Context error notification displayed when standard regular expression patterns fail validation */
  patternErrorMessage?: string;

  // ─── UI Engine Hints ────────────────────────────────────────
  /** Positional arrangement sort criteria calculated relative to corresponding peer elements */
  order?: number;
  /** Filter tokens indexed by search queries to parse matching components */
  tags?: string[];
  /** Toggle indicator which appends visibility indicator alerts directly on container surfaces */
  experimental?: boolean;
  /** Scope configuration layer tracking runtime execution context environments */
  scope?: 'application' | 'machine' | 'window' | 'resource' | 'language-overridable' | 'workspace';

  // ─── Deprecation Management ──────────────────────────────────
  /** Standard warning banner string indicating alternative configuration paths */
  deprecationMessage?: string;
  /** Markdown message string detailing modification paths for deprecated keys */
  markdownDeprecationMessage?: string;
}

// ─── Configuration Section Specification ─────────────────────────────────────

export interface IConfigurationSection {
  /** Top-level feature domain categorization identifier (e.g., 'editor') */
  id: string;
  /** Header category title rendered as the main navigation anchor label */
  title: string;
  /** Global sort order precedence given to this entire segment group */
  order?: number;
  /** Detailed lookup dictionary mapping configurations over clean properties */
  properties: Record<
    string,
    Omit<SettingDefinition, 'id' | 'category' | 'subCategory'> & { 
      category?: string; 
      subCategory?: string; 
      default?: any; // Native compatibility alignment fallback map for incoming JSON configurations
    }
  >;
}

/**
 * Structural definition for individual selections used in bounded 'select' schema varieties.
 */
export interface SettingOption {
  /** Underlying primitive string key saved back into configuration state profiles */
  value: string;
  /** Natural text caption rendered visible to users inside components */
  label: string;
  /** Optional plain-text fallback description snippet */
  description?: string;
  /** Rich documentation layout text leveraging internal markdown renderer nodes */
  markdownDescription?: string;
}

// ─── Configuration Registry Subsystem ───────────────────────────────────────

/**
 * Global Configuration Manager Engine
 * Directs configuration registry parsing, update boundaries, cleanups, 
 * and retrieval operations using deterministic registration ordering lookups.
 */
class ConfigurationRegistry {
  private _settings: Map<string, SettingDefinition> = new Map();
  private _registrationOrder: string[] = [];

  /**
   * Registers or dynamically updates a structural group section profile within memory maps.
   * Gracefully overwrites schema settings dynamically at runtime during registration cascades.
   * 
   * @param section Complete block definitions parsed through the registration boundary pipeline.
   */
  registerConfiguration(section: IConfigurationSection): void {
    const sectionOrder = section.order ?? 999;

    Object.entries(section.properties).forEach(([key, raw], idx) => {
      const isUpdate = this._settings.has(key);
      
      if (isUpdate && import.meta.env.DEV) {
        console.log(`[ConfigRegistry] Updating existing setting dynamically: "${key}"`);
      }

      // Explicit configurations override generic settings definitions fallback maps
      const category = raw.category ?? section.title;
      const subCategory = raw.subCategory ?? '';
      
      // Map configuration value variations, falling back to JSON specification defaults
      const defaultValue = raw.defaultValue !== undefined ? raw.defaultValue : raw.default;

      // Programmatically interpolate structural configuration headings using camel-case patterns
      let title = raw.title;
      if (!title) {
        const parts = key.split('.');
        title = parts[parts.length - 1]
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
      }

      // Transform raw format arrays into typed structures dynamically
      let options = raw.options;
      if (!options && raw.enum) {
        options = raw.enum.map((val, i) => ({
          value: String(val),
          label: raw.enumItemLabels?.[i] ?? String(val),
          markdownDescription: raw.markdownEnumDescriptions?.[i],
          description: raw.enumDescriptions?.[i],
        }));
      }

      const definition: SettingDefinition = {
        ...(raw as any),
        id: key,
        title, 
        category,
        subCategory,
        defaultValue,
        options,
        order: raw.order ?? (isUpdate ? this._settings.get(key)!.order : sectionOrder * 1000 + idx),
      };

      this._settings.set(key, definition);
      
      if (!isUpdate) {
        this._registrationOrder.push(key);
      }
    });
  }

  // ─── Query & Aggregation Accessors ─────────────────────────────────────────

  /**
   * Resolves the full listing stack sequence sorted contextually using relative order parameters.
   * 
   * @returns An index array containing complete formatted settings definitions.
   */
  getAllSettings(): SettingDefinition[] {
    return this._registrationOrder
      .map(k => this._settings.get(k)!)
      .filter(Boolean)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  /**
   * Performs an identity key string match query inside active settings registries.
   * 
   * @param id Fully qualified dot-notated configuration key string.
   */
  getSetting(id: string): SettingDefinition | undefined {
    return this._settings.get(id);
  }

  /**
   * Aggregates configuration schemas to resolve baseline reference initialization states.
   * 
   * @returns Key-value dictionary object tracking system-wide initial configuration definitions.
   */
  getDefaults(): Record<string, any> {
    const defaults: Record<string, any> = {};
    this._settings.forEach((def, key) => {
      defaults[key] = def.defaultValue;
    });
    return defaults;
  }

  // ─── Lifecycle Lifecycle Cleanup Operations ───────────────────────────────

  unregisterConfiguration(sectionId: string): void {
    const toRemove: string[] = [];
    this._settings.forEach((_def, key) => {
      if (key.startsWith(sectionId + '.')) toRemove.push(key);
    });
    toRemove.forEach(k => {
      this._settings.delete(k);
      const i = this._registrationOrder.indexOf(k);
      if (i !== -1) this._registrationOrder.splice(i, 1);
    });
  }
  
  removeSettingsByTag(tag: string): void {
    const toRemove: string[] = [];
    this._settings.forEach((def, key) => {
      if (def.tags?.includes(tag)) toRemove.push(key);
    });
    toRemove.forEach(k => {
      this._settings.delete(k);
      const i = this._registrationOrder.indexOf(k);
      if (i !== -1) this._registrationOrder.splice(i, 1);
    });
  }
}

export const configRegistry = new ConfigurationRegistry();