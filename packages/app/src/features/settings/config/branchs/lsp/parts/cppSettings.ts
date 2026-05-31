// src/features/settings/config/branchs/lsp/parts/cppSettings.ts
import { generateLspLanguageSettings } from '../lspFactory';

export const cppLspProperties = generateLspLanguageSettings(
  'C++', 'cpp', 'clangd',
  {
    // ── C/C++-specific ──────────────────────────────────────────────────────

    'lsp.cpp.signatureHelp': {
      title:               'Signature Help',
      type:                'boolean',
      subCategory:         'C++',
      defaultValue:        true,
      markdownDescription: 'Show function parameter hints when typing `(` or `,`.',
    },

    'lsp.cpp.clangdBackgroundIndex': {
      title:               'Background Indexing',
      type:                'boolean',
      subCategory:         'C++',
      defaultValue:        true,
      markdownDescription:
        'Let clangd index the project in the background for accurate Go-to-Definition across files.',
    },

    'lsp.cpp.clangdCompileCommands': {
      title:               'Compile Commands Path',
      type:                'string',
      subCategory:         'C++',
      defaultValue:        '',
      markdownDescription:
        'Path to `compile_commands.json` (relative to project root). Leave empty to let clangd auto-detect.',
    },
  }
);