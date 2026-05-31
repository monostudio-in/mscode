// src/features/settings/config/branchs/lsp/parts/htmlSettings.ts
import { generateLspLanguageSettings } from '../lspFactory';

export const htmlLspProperties = generateLspLanguageSettings(
  'HTML', 'html', 'Monaco Built-in',
  {
    // ── HTML-specific ────────────────────────────────────────────────────────

    'lsp.html.tagMatching': {
      title:               'Tag Matching Highlight',
      type:                'boolean',
      subCategory:         'HTML',
      defaultValue:        true,
      markdownDescription:
        'Highlight the matching opening/closing HTML tag when the cursor is on a tag.',
    },

    'lsp.html.autoCloseTag': {
      title:               'Auto Close Tags',
      type:                'boolean',
      subCategory:         'HTML',
      defaultValue:        true,
      markdownDescription: 'Automatically insert the closing tag when you type `</`.',
    },

    'lsp.html.colorDecorators': {
      title:               'Color Decorators',
      type:                'boolean',
      subCategory:         'HTML',
      defaultValue:        true,
      markdownDescription: 'Show inline colour swatches next to CSS colour values in HTML.',
    },
  }
);