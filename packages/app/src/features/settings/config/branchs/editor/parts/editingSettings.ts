// src/features/settings/config/branchs/editor/parts/editingSettings.ts
import type { IConfigurationSection } from '@/core/extensionAPI/registry/configurationRegistry';

export const editingProperties: IConfigurationSection['properties'] = {

  // ── Indentation ──────────────────────────────────────────────────────────

  'editor.tabSize': {
    title: 'Tab Size',
    type: 'number',
    defaultValue: 4,
    minimum: 1,
    maximum: 32,
    order: 1,
    tags: ['indent', 'editing'],
    markdownDescription: 'The number of spaces a tab is equal to. This setting is overridden based on the file contents when `#editor.detectIndentation#` is on.',
  },

  'editor.insertSpaces': {
    title: 'Insert Spaces',
    type: 'boolean',
    defaultValue: true,
    order: 2,
    tags: ['indent', 'editing'],
    markdownDescription: 'Insert spaces when pressing `Tab`. This setting is overridden based on the file contents when `#editor.detectIndentation#` is on.',
  },

  'editor.detectIndentation': {
    title: 'Detect Indentation',
    type: 'boolean',
    defaultValue: true,
    order: 3,
    tags: ['indent', 'editing'],
    markdownDescription: 'Controls whether `#editor.tabSize#` and `#editor.insertSpaces#` will be automatically detected when a file is opened based on the file contents.',
  },

  'editor.trimAutoWhitespace': {
    title: 'Trim Auto Whitespace',
    type: 'boolean',
    defaultValue: true,
    order: 4,
    tags: ['whitespace', 'editing'],
    description: 'Remove trailing auto inserted whitespace.',
  },

  'editor.indentSize': {
    title: 'Indent Size',
    type: 'select',
    defaultValue: 'tabSize',
    order: 5,
    tags: ['indent'],
    description: 'The number of spaces used for indentation or "tabSize" to use the value from editor.tabSize.',
    enum: ['tabSize', '1', '2', '3', '4', '5', '6', '7', '8'],
    enumItemLabels: ['Use Tab Size', '1', '2', '3', '4', '5', '6', '7', '8'],
  },

  // ── Auto Closing ─────────────────────────────────────────────────────────

  'editor.autoClosingBrackets': {
    title: 'Auto Closing Brackets',
    type: 'select',
    defaultValue: 'languageDefined',
    order: 10,
    tags: ['editing', 'brackets'],
    description: 'Controls whether the editor should automatically close brackets after the user adds an opening bracket.',
    enum: ['always', 'languageDefined', 'beforeWhitespace', 'never'],
    enumItemLabels: ['Always', 'Language Defined', 'Before Whitespace', 'Never'],
    enumDescriptions: [
      'Always auto close brackets.',
      'Use language configurations to determine when to auto close brackets.',
      'Auto close brackets only when the cursor is to the left of whitespace.',
      'Never auto close brackets.',
    ],
  },

  'editor.autoClosingQuotes': {
    title: 'Auto Closing Quotes',
    type: 'select',
    defaultValue: 'languageDefined',
    order: 11,
    tags: ['editing'],
    description: 'Controls whether the editor should automatically close quotes after the user adds an opening quote.',
    enum: ['always', 'languageDefined', 'beforeWhitespace', 'never'],
    enumItemLabels: ['Always', 'Language Defined', 'Before Whitespace', 'Never'],
  },

  'editor.autoClosingDelete': {
    title: 'Auto Closing Delete',
    type: 'select',
    defaultValue: 'auto',
    order: 12,
    tags: ['editing', 'brackets'],
    description: 'Controls whether the editor should remove adjacent closing quotes or brackets when deleting.',
    enum: ['always', 'auto', 'never'],
    enumItemLabels: ['Always', 'Auto', 'Never'],
    enumDescriptions: [
      'Always remove adjacent closing brackets.',
      'Remove adjacent closing brackets only when they were automatically inserted.',
      'Never remove adjacent closing brackets.',
    ],
  },

  'editor.autoClosingOvertype': {
    title: 'Auto Closing Overtype',
    type: 'select',
    defaultValue: 'auto',
    order: 13,
    tags: ['editing'],
    description: 'Controls whether the editor should type over closing brackets or quotes.',
    enum: ['always', 'auto', 'never'],
    enumItemLabels: ['Always', 'Auto', 'Never'],
  },

  'editor.autoSurround': {
    title: 'Auto Surround',
    type: 'select',
    defaultValue: 'languageDefined',
    order: 14,
    tags: ['editing'],
    description: 'Controls whether the editor should automatically surround selections when typing quotes or brackets.',
    enum: ['languageDefined', 'quotes', 'brackets', 'never'],
    enumItemLabels: ['Language Defined', 'Quotes', 'Brackets', 'Never'],
    enumDescriptions: [
      'Use language configurations to determine when to auto-surround.',
      'Surround with quotes but not brackets.',
      'Surround with brackets but not quotes.',
      'Never auto-surround.',
    ],
  },

  // ── Paste & Copy ─────────────────────────────────────────────────────────

  'editor.copyWithSyntaxHighlighting': {
    title: 'Copy With Syntax Highlighting',
    type: 'boolean',
    defaultValue: true,
    order: 20,
    tags: ['editing'],
    description: 'Controls whether syntax highlighting should be copied into the clipboard.',
  },

  'editor.emptySelectionClipboard': {
    title: 'Empty Selection Clipboard',
    type: 'boolean',
    defaultValue: true,
    order: 21,
    tags: ['editing'],
    description: 'Controls whether copying without a selection copies the current line.',
  },

  // ── Linked Editing ───────────────────────────────────────────────────────

  'editor.linkedEditing': {
    title: 'Linked Editing',
    type: 'boolean',
    defaultValue: false,
    order: 25,
    tags: ['editing'],
    markdownDescription: 'Controls whether the editor has linked editing enabled. Depending on the language, related symbols such as HTML tags are updated while editing.',
  },

  // ── Undo / Redo ──────────────────────────────────────────────────────────

  'editor.dragAndDrop': {
    title: 'Drag And Drop',
    type: 'boolean',
    defaultValue: true,
    order: 30,
    tags: ['editing'],
    description: 'Controls whether the editor should allow moving selections via drag and drop.',
  },

  'editor.dropIntoEditor.enabled': {
    title: 'Drop Into Editor',
    type: 'boolean',
    defaultValue: true,
    order: 31,
    tags: ['editing'],
    description: 'Controls whether you can drag and drop a file into a text editor by holding down Shift.',
  },

  // ── Read Only ────────────────────────────────────────────────────────────

  'editor.readOnly': {
    title: 'Read Only',
    type: 'boolean',
    defaultValue: false,
    order: 35,
    tags: ['editing'],
    description: 'Controls whether the editor is read-only. Note that the undo/redo stack will not be cleared when the editor is set to read-only.',
  },

  'editor.readOnlyMessage': {
    title: 'Read Only Message',
    type: 'string',
    defaultValue: '',
    order: 36,
    tags: ['editing'],
    markdownDescription: 'The message to display when the editor is read-only. Supports Markdown. Defaults to `"Cannot edit in read-only editor"` if unset.',
  },

  // ── Word Operations ──────────────────────────────────────────────────────

  'editor.wordSeparators': {
    title: 'Word Separators',
    type: 'string',
    defaultValue: '`~!@#$%^&*()-=+[{]}\\|;:\'",.<>/?',
    order: 40,
    tags: ['editing'],
    description: 'Characters that will be used as word separators when doing word related navigations or operations.',
  },

  'editor.selectOnLineNumbers': {
    title: 'Select On Line Numbers',
    type: 'boolean',
    defaultValue: true,
    order: 41,
    tags: ['editing'],
    description: 'Controls whether clicking on the line numbers selects the line.',
  },

  // ── Column Selection ─────────────────────────────────────────────────────

  'editor.columnSelection': {
    title: 'Column Selection',
    type: 'boolean',
    defaultValue: false,
    order: 45,
    tags: ['editing', 'selection'],
    description: 'Enable that the selection with the mouse and keys is doing column selection.',
  },

  // ── Snippet ──────────────────────────────────────────────────────────────

  'editor.snippetSuggestions': {
    title: 'Snippet Suggestions',
    type: 'select',
    defaultValue: 'inline',
    order: 50,
    tags: ['editing', 'snippet'],
    description: 'Controls whether snippets are shown with other suggestions and how they are sorted.',
    enum: ['top', 'bottom', 'inline', 'none'],
    enumItemLabels: ['Top', 'Bottom', 'Inline', 'None'],
    enumDescriptions: [
      'Show snippet suggestions on top of other suggestions.',
      'Show snippet suggestions below other suggestions.',
      'Show snippets suggestions with other suggestions.',
      'Do not show snippet suggestions.',
    ],
  },

  // ── Tab Completion ───────────────────────────────────────────────────────

  'editor.tabCompletion': {
    title: 'Tab Completion',
    type: 'select',
    defaultValue: 'off',
    order: 51,
    tags: ['editing', 'tab'],
    description: 'Enables tab completions.',
    enum: ['on', 'off', 'onlySnippets'],
    enumItemLabels: ['On', 'Off', 'Only Snippets'],
    enumDescriptions: [
      'Tab complete will insert the best matching suggestion when pressing tab.',
      'Disable tab completions.',
      'Tab complete snippets when their prefix match. Works best when \'quickSuggestions\' aren\'t enabled.',
    ],
  },
};
