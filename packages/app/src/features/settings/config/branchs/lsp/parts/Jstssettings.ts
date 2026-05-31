// src/features/settings/config/branchs/lsp/parts/jstsSettings.ts
import { generateLspLanguageSettings } from '../lspFactory';

// ── JavaScript ────────────────────────────────────────────────────────────────

export const jsLspProperties = generateLspLanguageSettings(
  'JavaScript', 'javascript', 'Monaco Built-in',
  {
    'lsp.javascript.implicitAny': {
      title:               'Report Implicit Any',
      type:                'boolean',
      subCategory:         'JavaScript',
      defaultValue:        false,
      markdownDescription:
        'Flag variables that are implicitly typed as `any` (useful for migrating to TypeScript).',
    },

    'lsp.javascript.unusedLocals': {
      title:               'Report Unused Variables',
      type:                'boolean',
      subCategory:         'JavaScript',
      defaultValue:        false,
      markdownDescription: 'Warn about declared variables that are never used.',
    },

    'lsp.javascript.strictNullChecks': {
      title:               'Strict Null Checks',
      type:                'boolean',
      subCategory:         'JavaScript',
      defaultValue:        false,
      markdownDescription: 'Treat `null` and `undefined` as distinct types.',
    },
  }
);

// ── TypeScript ────────────────────────────────────────────────────────────────

export const tsLspProperties = generateLspLanguageSettings(
  'TypeScript', 'typescript', 'Monaco Built-in',
  {
    'lsp.typescript.strictMode': {
      title:               'Strict Mode',
      type:                'boolean',
      subCategory:         'TypeScript',
      defaultValue:        true,
      markdownDescription:
        'Enable all strict type-checking options (`strictNullChecks`, `noImplicitAny`, etc.).',
    },

    'lsp.typescript.unusedLocals': {
      title:               'Report Unused Variables',
      type:                'boolean',
      subCategory:         'TypeScript',
      defaultValue:        true,
      markdownDescription: 'Warn about declared variables that are never used.',
    },

    'lsp.typescript.unusedParameters': {
      title:               'Report Unused Parameters',
      type:                'boolean',
      subCategory:         'TypeScript',
      defaultValue:        false,
      markdownDescription: 'Warn about function parameters that are never used.',
    },
  }
);