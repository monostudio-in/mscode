// src/features/extensions/types.ts

/**
 * ============================================================================
 *  MS CODE EXTENSION SYSTEM ENTITY TYPE DEFINITIONS
 * ============================================================================
 * * ─── DATA LIFE CYCLE SCHEMATIC ──────────────────────────────────────────────
 * * Cloud Registry Catalog                Local System Storage (Disk Log)
 * ┌───────────────────────┐             ┌─────────────────────────────┐
 * │   ExtensionManifest   │             │       ExtensionRecord       │
 * │  (Static Identity)    │             │   (Runtime State & Sync)    │
 * └──────────┬────────────┘             └──────────────┬──────────────┘
 * │                                         │
 * ├────────────────────┬────────────────────┘
 * ▼                    ▼
 * ┌────────────────────────────────────────────────────────────────────┐
 * │                             Extension                              │
 * │        (Hydrated Runtime Entity with Local Workspace Pointer)       │
 * └───────────────────────────────┬────────────────────────────────────┘
 * │
 * ▼ Parses 'contributes' Hook
 * ┌────────────────────────────────────────────────────────────────────┐
 * │                        ExtensionContributions                      │
 * │   (Dynamic Declarative System Injections: Menus, Themes, Keys...)   │
 * └====================================================================┘
 * * @description
 * This module establishes the strict TypeScript contracts governing the MS Code
 * plug-in ecosystem. It segregates purely decorative store catalog metadata,
 * sandboxed hardware storage paths, non-volatile execution records, and active 
 * declarative registry structural hooks.
 */

/**
 * Represents the immediate execution state of a plugin within the workspace context.
 */
export type ExtensionRuntimeState =
  /** The package has metadata present in registry cache references but no deployment folder layout. */
  | 'not-installed'
  /** Placed within sandboxed folders, parsed by synchronization engines, and injected into proxy scopes. */
  | 'installed-enabled'
  /** Assets exist locally on the tracking workspace layout, but core components and runtime configurations are bypassed. */
  | 'installed-disabled'
  
  | 'uninstalled'
  
  | 'installed-dev';

/**
 * Categorization tags mapping how the extension appears and groups inside the Marketplace storefront view.
 */
export type ExtensionCategory = 
  | 'All' 
  | 'Language Support' 
  | 'Themes' 
  | 'Linters' 
  | 'Formatters' 
  | 'Snippets' 
  | 'Other';

/**
 * Base configuration blueprint representing an extension's internal package rules,
 * activation criteria hooks, and structured information layouts.
 * Matches the core properties declared inside a plug-in's 'manifest.json'.
 */
export interface ExtensionManifest {
  /** Unique structural identification namespace (e.g., 'publisher.extension-id') */
  id:          string;
  /** Natural text naming token displayed across storefront catalogs and lists */
  name:        string;
  /** Developer or enterprise handle managing publishing workflows */
  publisher:   string;
  /** Abstract summarizing the functional capabilities of the package bundle */
  description: string;
  /** Strict Semantic Versioning string token (e.g., '1.4.2') */
  version:     string;
  /** Primary category anchor positioning item placement inside search filters */
  category:    ExtensionCategory;
  /** Descriptive keywords indexing utility features for system discovery algorithms */
  tags:        string[];
  /** Relative icon filename token path pointing to asset layouts inside folder structures */
  icon?:       string; 
  /** Optional aesthetic background configuration hex parameter token applied during visual rendering */
  iconColor?:  string;
  /** Single alphanumeric glyph character fallback used if an extension is missing an avatar asset */
  iconLetter?: string;
  /** Sandbox bootstrap bundle execution target script filename entrypoint path (e.g., 'out/main.js') */
  main?:       string;   
  /** * Dynamic conditional context initialization string identifiers tracking workspace actions.
   * @example ['onLanguage:javascript', 'onCommand:myExtension.runLint']
   */
  activates:   string[]; 
  /** Extracted inline plain-text string formatting sheet or absolute reference target path */
  readme?:     string;
  /** Collection block documenting updates and feature addition records */
  changelog?:  string;
  /** Legal copyright governance agreement document text */
  license?:    string;
}

/**
 * Enhanced runtime blueprint reflecting telemetry properties, verification records,
 * and system platform mapping coordinates resolved from cloud distribution catalogs.
 */
export interface Extension extends ExtensionManifest {
  /** Physical targeted sandboxed location directory pointer tracked within system storage tables (e.g., 'extensions/id-v1') */
  storeDir:    string;   
  /** Flags whether the module belongs to core baseline IDE internal packages (bundled by default) */
  isBuiltIn:   boolean;  
  /** True if the developer cryptographic signature passes standard framework origin validation rules */
  isVerified:  boolean;  
  /** Total statistical counter aggregation indicating installation usage across the lifetime repository */
  downloads:   number;   
  /** Star rating score (0.0 to 5.0) compiled mathematically out of community evaluations */
  rating:      number;   
  /** String metric evaluating package download constraints (e.g., '2.4 MB') */
  zipSize?:    string;
  /** Cloud payload binary source URL pointer used during extraction operations */
  fileUrl?:    string;
  /** Raw dynamic fallback contribution hook tracking configurations before static JSON parsing loops */
  contributes?: any;     
}

/**
 * Local non-volatile manifest log record mapping current execution states,
 * configuration update sequences, and origin installation targets.
 * Persisted in the IDE system storage database layout.
 */
export interface ExtensionRecord {
  /** Current functional state mapping (enabled, disabled, or uninstalled tracker flags) */
  state:         ExtensionRuntimeState;
  /** Unix Epoch millisecond timestamp index tracking exactly when the installation completed */
  installedAt:   number;   
  /** Current active local tracking deployment release variant tag */
  version:       string;
  /** Virtual workspace source indicator recording local absolute filepaths or server cloud signatures */
  installedFrom: string;  
}

/**
 * Bounded state parameters mapping real-time text mutations and category dropdown targets in search views.
 */
export interface ExtensionFilter {
  /** Raw text query containing matching search expressions or specialized lookup tokens like '@id:git' */
  query:    string;
  /** Filter selection targeting specific group arrays exclusively */
  category: ExtensionCategory;
}

/**
 * Registered configuration extensions blueprint detailing language mappings,
 * custom workbench menu interactions, environment settings schemas, and visual themes.
 * Supports string configurations pointing to external sub-JSON definition paths.
 */
export interface ExtensionContributions {
  /**
   * Grammar registries injecting syntactical definitions to handle custom file extensions inside Monaco.
   * Supports an external relative filepath pointer string or direct array mappings.
   */
  languages?: Array<{
    id:         string;
    extensions: string[]; 
    aliases:    string[]; 
  }> | string;

  /**
   * Visual actions injected directly into the Global Command Palette window index schemas.
   */
  commands?: Array<{
    id:    string;
    title: string;
    icon?: string;
  }>;
  
  /**
   * Custom application runtime schema configurations exposed inside the settings workbench engine views.
   * Supports an external configuration filepath token string or raw key-value schema definitions block.
   */
  configuration?: Record<string, {
    type:        'string' | 'boolean' | 'number' | 'array';
    default:     unknown;
    description: string;
    enum?:       string[];
  }> | string;

  /** Autocomplete text templates mapping syntax blocks based on structural language file identifiers */
  snippets?: Array<{ language: string; path: string }>;
  
  /** Workbench color themes templates mapping background values and tokens highlighting configurations */
  themes?: Array<{ label: string; uiTheme: 'vs' | 'vs-dark' | 'hc-black'; path: string }>;
  
  /** File icon visualization mapping templates targeting file matching layouts inside the Explorer trees */
  iconThemes?: Array<{ id: string; label: string; path: string }>;
  
  /**
   * Sidebar navigation panel visual launchers injected onto the primary horizontal activity toolbar.
   */
  activityBar?: Array<{
    id:       string;
    title:    string;
    icon:     string;
    position?: 'top' | 'bottom';
    priority?: number;
  }>;
  
  /**
   * Keyboard shortcuts matching complex environmental focus conditions ('when' context validation expressions).
   */
  keybindings?: Array<{
    command: string;
    key:     string;
    mac?:    string; 
    when?:   string;
    args?:   any;
  }>;
  
  /** 
   * Declarative Menu Contributions
   */ 
  menus?: Record<string, Array<{
    command:   string;      // The registered command ID to execute
    label?:    string;      // Display text (optional, but recommended)
    icon?:     string;      // Codicon name (optional)
    when?:     string;      // Context evaluation (e.g., 'editorTextFocus')
    order?:    number;      // Sorting priority
    shortcut?: string;      // Display shortcut text
  }>>;
  
}

/**
 * Single historical development data block log entry describing version milestones tracking release notes.
 */
export interface ChangelogEntry {
  /** Targeted descriptive tracking release token tag matching current changes (e.g., 'v2.1.0') */
  version: string;
  /** Natural language date indicator matching execution metrics (e.g., '2026-05-25') */
  date:    string; 
  /** Detailed line items summarizing structural updates, bug fixes, or framework enhancements */
  changes: string[]; 
}

/**
 * Resolved aggregate package profile housing active extension metadata blueprints alongside 
 * sanitized markup sheets ready for UI view presentations. Used by the Extension Manager View.
 */
export interface ExtensionDetail {
  /** Hydrated core catalog identity profile metrics data block */
  manifest:      Extension;             
  /** Parsed declarative system features and active API integration hooks */
  contributions: ExtensionContributions;
  /** Fully prepared Markdown layout content mapping documentation sheets */
  readme:        string;                
  /** Prepared application modification records mapping release note streams */
  changelog:     string;
  /** Prepared governance text detailing legal restrictions, usage criteria, and ownership parameters */
  license:       string;
}

/**
 * Enumerated navigation anchor identifiers controlling active view states inside the Extension Details View panel.
 */
export type DetailTab = 'details' | 'contributions' | 'changelog' | 'runtime';