// src/features/settings/config/branchs/lsp/lspFactory.ts
//
// Factory for generating LSP settings entries.
//
// Every language gets the same base settings (enabled, completion, hover, linting).
// Languages can ALSO declare extra settings specific to them — e.g. HTML gets
// "tag matching", Python gets "type checking mode", etc.
//
// Extra settings are plain IConfigurationSection['properties'] objects.
// They are merged with the base settings under the same subCategory.

import type { IConfigurationSection } from '@/core/extensionAPI/registry/configurationRegistry';

// ─── Base settings (all languages get these) ─────────────────────────────────

export const generateLspLanguageSettings = (
  displayName: string,
  langId:      string,
  serverName:  string,
  /** Optional extra settings specific to this language. */
  extraSettings?: IConfigurationSection['properties'],
): IConfigurationSection['properties'] => ({

  // ── Always present ──────────────────────────────────────────────────────
  [`lsp.${langId}.enabled`]: {
    title:               `Enable ${displayName} Language Features`,
    type:                'boolean',
    subCategory:         displayName,
    defaultValue:        true,
    tags:                ['lsp', langId],
    markdownDescription: `Enable language features (completion, hover, linting) for ${displayName} via \`${serverName}\`.`,
  },

  [`lsp.${langId}.completion`]: {
    title:               'Auto Completion',
    type:                'boolean',
    subCategory:         displayName,
    defaultValue:        true,
    markdownDescription: `Show auto-completion suggestions for ${displayName}.`,
  },

  [`lsp.${langId}.hover`]: {
    title:               'Hover Documentation',
    type:                'boolean',
    subCategory:         displayName,
    defaultValue:        true,
    markdownDescription: `Show type info and docs when hovering over ${displayName} symbols.`,
  },

  [`lsp.${langId}.linting`]: {
    title:               'Real-time Error Checking',
    type:                'boolean',
    subCategory:         displayName,
    defaultValue:        true,
    markdownDescription: `Highlight errors and warnings as you type in ${displayName} files.`,
  },

  // ── Language-specific extras (spread in after base) ─────────────────────
  ...extraSettings,
});