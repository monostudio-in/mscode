// src/features/settings/config/branchs/lsp/parts/pythonSettings.ts
import { generateLspLanguageSettings } from '../lspFactory';

export const pythonLspProperties = generateLspLanguageSettings(
  'Python', 'python', 'Pyright',
  {
    // ── Python-specific ─────────────────────────────────────────────────────

    'lsp.python.typeCheckingMode': {
      title:               'Type Checking Mode',
      type:                'select',
      subCategory:         'Python',
      defaultValue:        'basic',
      options: [
        { label: 'Off',    value: 'off'    },
        { label: 'Basic',  value: 'basic'  },
        { label: 'Strict', value: 'strict' },
      ],
      markdownDescription: 'Pyright type checking strictness. `strict` catches the most errors.',
    },

    'lsp.python.signatureHelp': {
      title:               'Signature Help',
      type:                'boolean',
      subCategory:         'Python',
      defaultValue:        true,
      markdownDescription: 'Show function parameter hints when typing `(` or `,`.',
    },

    'lsp.python.autoImport': {
      title:               'Auto Import',
      type:                'boolean',
      subCategory:         'Python',
      defaultValue:        true,
      markdownDescription: 'Suggest and auto-add missing imports.',
    },
  }
);