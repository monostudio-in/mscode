// src/features/settings/config/branchs/editor/parts/findSettings.ts
import type { IConfigurationSection } from '@/core/extensionAPI/registry/configurationRegistry';

export const findProperties: IConfigurationSection['properties'] = {

  'editor.find.cursorMoveOnType': {
    title: 'Cursor Move On Type',
    type: 'boolean',
    subCategory: 'Find',
    defaultValue: true,
    order: 1,
    tags: ['find', 'search'],
    description: 'Controls whether the cursor should jump to find matches while typing.',
  },

  'editor.find.seedSearchStringFromSelection': {
    title: 'Seed Search String From Selection',
    type: 'select',
    subCategory: 'Find',
    defaultValue: 'always',
    order: 2,
    tags: ['find', 'search'],
    description: 'Controls whether the search string in the Find Widget is seeded from the editor selection.',
    enum: ['never', 'always', 'selection'],
    enumItemLabels: ['Never', 'Always', 'Selection'],
    enumDescriptions: [
      'Never seed search string from the editor selection.',
      'Always seed search string from the editor selection, including word at cursor position.',
      'Only seed search string from the editor selection.',
    ],
  },

  'editor.find.autoFindInSelection': {
    title: 'Auto Find In Selection',
    type: 'select',
    subCategory: 'Find',
    defaultValue: 'never',
    order: 3,
    tags: ['find', 'search'],
    description: 'Controls the condition for turning on "Find in Selection" automatically.',
    enum: ['never', 'always', 'multiline'],
    enumItemLabels: ['Never', 'Always', 'Multiline'],
    enumDescriptions: [
      'Never turn on "Find in Selection" automatically.',
      'Always turn on "Find in Selection" automatically.',
      'Turn on "Find in Selection" automatically when multiple lines of content are selected.',
    ],
  },

  'editor.find.addExtraSpaceOnTop': {
    title: 'Add Extra Space On Top',
    type: 'boolean',
    subCategory: 'Find',
    defaultValue: true,
    order: 4,
    tags: ['find'],
    description: 'Controls whether the Find Widget should add extra lines on top of the editor.',
  },

  'editor.find.loop': {
    title: 'Find Loop',
    type: 'boolean',
    subCategory: 'Find',
    defaultValue: true,
    order: 5,
    tags: ['find'],
    description: 'Controls whether the search automatically restarts from the beginning (or the end) when no further matches can be found.',
  },
};


// src/features/settings/config/branchs/editor/parts/formattingSettings.ts
export const formattingProperties: IConfigurationSection['properties'] = {

  'editor.formatOnSave': {
    title: 'Format On Save',
    type: 'boolean',
    subCategory: 'Format',
    defaultValue: false,
    order: 1,
    tags: ['formatting'],
    markdownDescription: 'Format a file on save. A formatter must be available, the file must not be saved after delay, and the editor must not be shutting down.',
  },

  'editor.formatOnSaveMode': {
    title: 'Format On Save Mode',
    type: 'select',
    subCategory: 'Format',
    defaultValue: 'file',
    order: 2,
    tags: ['formatting'],
    markdownDescription: 'Controls if format on save formats the whole file or only modifications. Only applies when `#editor.formatOnSave#` is enabled.',
    enum: ['file', 'modifications', 'modificationsIfAvailable'],
    enumItemLabels: ['File', 'Modifications', 'Modifications If Available'],
    enumDescriptions: [
      'Format the whole file.',
      'Format modifications (requires source control).',
      'Format modifications if a source control plugin is available, otherwise format the whole file.',
    ],
  },

  'editor.formatOnType': {
    title: 'Format On Type',
    type: 'boolean',
    subCategory: 'Format',
    defaultValue: false,
    order: 3,
    tags: ['formatting'],
    description: 'Controls whether the editor should automatically format the line after typing.',
  },

  'editor.formatOnPaste': {
    title: 'Format On Paste',
    type: 'boolean',
    subCategory: 'Format',
    defaultValue: false,
    order: 4,
    tags: ['formatting'],
    description: 'Controls whether the editor should automatically format the pasted content. A formatter must be available and the formatter should be able to format a range in a document.',
  },

  'editor.defaultFormatter': {
    title: 'Default Formatter',
    type: 'string',
    subCategory: 'Format',
    defaultValue: '',
    order: 5,
    tags: ['formatting'],
    markdownDescription: 'Defines a default formatter which takes precedence over all other formatter settings. Must be the identifier of an extension contributing a formatter.',
  },
};
