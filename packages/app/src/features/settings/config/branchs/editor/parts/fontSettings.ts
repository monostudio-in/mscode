// src/features/settings/config/branchs/editor/parts/fontSettings.ts
import type { IConfigurationSection } from '@/core/extensionAPI/registry/configurationRegistry';

export const fontProperties: IConfigurationSection['properties'] = {

  'editor.fontSize': {
    title: 'Font Size',
    type: 'number',
    subCategory: 'Font',
    defaultValue: 13,
    minimum: 6,
    maximum: 100,
    order: 1,
    tags: ['font'],
    // 🌟 Code Span (`...`) ব্যবহার করা হয়েছে
    markdownDescription: 'Controls the font size in pixels. For example: `14`, `16`, `18`.',
  },

'editor.fontFamily': {
    title: 'Font Family',
    type: 'string',
    subCategory: 'Font',
    defaultValue: "Fira Code",
    order: 2,
    tags: ['font'],
    // 🌟 MAGIC FIX: Template Literal (Backticks) ব্যবহার করা হলো যাতে ফালতু + বা \n দিতে না হয়!
    markdownDescription: `Controls the font family. Use a comma-separated list of font names.

**Top Programming Fonts:**
- [Fira Code](https://github.com/tonsky/FiraCode) *(Recommended for Ligatures)*
- [Cascadia Code](https://github.com/microsoft/cascadia-code)
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/)

**More Popular Options:**
- \`Source Code Pro\`
- \`Google Sans Code\`
- \`Fira Mono\`
- \`Courier New\`
- \`monospace\` *(Universal Fallback)`
  },

  'editor.fontWeight': {
    title: 'Font Weight',
    type: 'select',
    subCategory: 'Font',
    defaultValue: 'normal',
    order: 3,
    tags: ['font'],
    // 🌟 Internal Link (#...#) VS Code স্টাইল!
    markdownDescription: 'Controls the font weight. This setting will only take effect if the chosen `#editor.fontFamily#` supports it.',
    enum: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    enumItemLabels: [
      'Normal', 'Bold',
      '100 — Thin', '200 — Extra Light', '300 — Light', '400 — Regular',
      '500 — Medium', '600 — Semi Bold', '700 — Bold', '800 — Extra Bold', '900 — Black',
    ],
  },

  'editor.fontLigatures': {
    title: 'Font Ligatures',
    type: 'boolean',
    subCategory: 'Font',
    defaultValue: true,
    order: 4,
    tags: ['font'],
    // 🌟 Markdown Table এবং Blockquote
    markdownDescription: 
      'Enables/disables font ligatures. \n\n' +
      '| Characters | Becomes |\n' +
      '| :--- | :--- |\n' +
      '| `=>` | ➔ |\n' +
      '| `!==` | ≢ |\n\n' +
      '> **Note:** Requires a font that supports ligatures (e.g., Fira Code).',
  },

  'editor.lineHeight': {
    title: 'Line Height',
    type: 'number',
    subCategory: 'Font',
    defaultValue: 0,
    minimum: 0,
    maximum: 150,
    order: 6,
    tags: ['font'],
    // 🌟 Multi-line Bullet Points
    markdownDescription: 
      'Controls the line height. \n' +
      '- Use `0` to automatically compute the line height from the font size.\n' +
      '- Values between `0` and `8` will be used as a multiplier with the font size.\n' +
      '- Values `>= 8` will be used as absolute pixel values.',
  }
};