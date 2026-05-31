// src/core/theme/types.ts

/**
 * ─── RATIONALE FOR JSON-DRIVEN RUNTIME THEMES ────────────────────────────────
 * Hardcoded build-time CSS schemas create strict compiling boundaries, rendering it 
 * impossible to register, inject, or update application profiles at runtime.
 * 
 * Leveraging structured JSON theme models enables dynamic schema ingestion from external 
 * third-party plug-in channels, remote data synchronization stores (e.g., Supabase), 
 * or localized user file uploads, safely inflating new profiles directly into the execution loop.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Structural interface matching the exact layout variables tracked across the 
 * document application interface (`theme.css`). 
 * 
 * Maps specific layout blocks, text states, layout boundaries, interactive controls, 
 * and configuration form containers directly to valid CSS declaration strings.
 */
export interface MSCodeUIColors {
  // ── Core Workspace Background Matrix ──
  'ms-bg-main':         string;
  'ms-bg-side':         string;
  'ms-bg-activity':     string;
  'ms-activity-hover':  string;
  'ms-tab-inactive-bg': string;
  'ms-tab-active-bg':   string;

  // ── Typography & System Text Fields ──
  'ms-text-main':   string;
  'ms-text-faded':  string;
  'ms-text-bright': string;

  // ── Layout Boundaries & Division Lines ──
  'ms-border-light': string;
  'ms-border-dark':  string;
  'ms-menu-border':  string;
  'ms-separator':    string;

  // ── Interactive Controls & Overlays ──
  'ms-accent':        string;
  'ms-icon-hover-bg': string;
  'ms-menu-hover-bg': string;
  'ms-shadow':        string;

  // ── Configuration Screens & Form Fields ──
  'ms-settings-bg':             string;
  'ms-settings-category-color': string;
  'ms-settings-title-color':    string;
  'ms-settings-desc-color':     string;
  'ms-settings-link-color':     string;
  'ms-input-bg':                string;
  'ms-input-fg':                string;
  'ms-input-border':            string;
  'ms-input-focus-border':      string;
  'ms-code-bg':                 string;
  'ms-code-fg':                 string;
}

/**
 * Token compilation rule modeling standard syntax categorization parameters 
 * mirroring VS Code and TextMate grammars.
 */
export interface TokenColor {
  /** Target text parsing descriptor string or sequence of matching context scopes */
  scope: string | string[];
  /** Applied lexical parsing style attributes */
  settings: {
    /** Target Hex color identifier tracking token typography layouts */
    foreground?: string;
    /** Background box highlight tracking single token entities */
    background?: string;
    /** Typographical style flags: "bold" | "italic" | "underline" | "bold italic" | "" */
    fontStyle?: string;
  };
}

/**
 * Complete Theme Definition Matrix.
 * Serves as the public contract interface consumed by system expansion module developer packages.
 */
export interface ThemeDefinition {
  /** Unique identifying token. Recommended format: "publisher-namespace.theme-name" */
  id:   string;
  /** Public user-facing display label for selectors and option inputs */
  name: string;
  /** Primary systemic styling base architecture */
  type: 'dark' | 'light' | 'high-contrast';

  /**
   * Application UI layout maps.
   * Directly sets root-level system variables. 
   * Partial declarations are supported; omitted keys preserve existing baseline variables.
   */
  uiColors: Partial<MSCodeUIColors>;

  /**
   * Monaco Editor syntax tokenizer tree.
   * Built onto standard TextMate layout systems to secure cross-language syntax targeting.
   */
  tokenColors: TokenColor[];

  /**
   * Optional specialized overrides mapping native parameters inside Monaco Editor Viewports.
   * e.g., tracking modifications across scrollbars, minimap channels, or suggestion panels.
   */
  editorColors?: Record<string, string>;
}

/**
 * Registry Context Entry Frame.
 * Wraps dynamic loaded definitions with tracking tracking fields specifying 
 * provider origins and disposal channels.
 */
export interface ThemeRegistryEntry {
  /** Structural specification content profile definitions */
  definition: ThemeDefinition;
  /** Core origin signature classifying the execution allocation layer */
  source: 'builtin' | 'extension' | 'user-imported';
  /** Tracking allocation token identifying the provider extension scope */
  extensionId?: string;
}

/**
 * Serialized persistence frame mapping active configurations saved back to local layout files.
 */
export interface ThemePersistedState {
  /** Target theme selection identification token string */
  activeThemeId: string;
}
