// src/features/settings/config/branchs/editor/editorSettings.ts
import type { IConfigurationSection } from '@/core/extensionAPI/registry/configurationRegistry';

import { fontProperties }        from './parts/fontSettings';
import { filesProperties }        from './parts/filesSettings';
import { cursorProperties }      from './parts/cursorSettings';
import { displayProperties }     from './parts/displaySettings';
import { editingProperties }     from './parts/editingSettings';
import { minimapProperties }     from './parts/minimapSettings';
import { suggestionProperties }  from './parts/suggestionSettings';
import { menuProperties }  from './parts/menuSettings';
import { findProperties, formattingProperties } from './parts/findSettings';

export const editorSection: IConfigurationSection = {
  id: 'editor',
  title: 'Editor',
  order: 10,
  properties: {
    ...filesProperties,
    ...fontProperties,        // Font Size, Family, Weight, Ligatures…
    ...cursorProperties,      // Style, Blinking, Width, Surround…
    ...displayProperties,     // Line Numbers, Wrap, Whitespace, Folding, Guides…
    ...editingProperties,     // Tab Size, Auto Close, Drag Drop, Snippets…
    ...minimapProperties,     // Enabled, Side, Size, Slider…
    ...menuProperties,
    ...suggestionProperties,  // Quick Suggestions, Hover, InlayHints, Params…
    ...findProperties,        // Find Loop, Seed, Auto Find…
    ...formattingProperties,  // Format On Save/Type/Paste…
  },
};
