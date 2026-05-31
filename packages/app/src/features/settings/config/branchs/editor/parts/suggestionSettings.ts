// src/features/settings/config/branchs/editor/parts/suggestionSettings.ts
import type { IConfigurationSection } from '@/core/extensionAPI/registry/configurationRegistry';

export const suggestionProperties: IConfigurationSection['properties'] = {

  // ── Quick Suggestions ────────────────────────────────────────────────────

  'editor.quickSuggestions': {
    title: 'Quick Suggestions',
    type: 'select',
    subCategory: 'Suggestions',
    defaultValue: 'on',
    order: 1,
    tags: ['suggestions', 'intellisense'],
    markdownDescription:
      'Controls whether suggestions should automatically show up while typing.\n\n' +
      '- `on` — Shows suggestions inside the suggest widget.\n' +
      '- `off` — Quick suggestions are disabled.\n' +
      '- `inline` — Shows suggestions as inline ghost text.',
    enum: ['on', 'off', 'inline'],
    enumItemLabels: ['On', 'Off', 'Inline'],
  },

  'editor.quickSuggestionsDelay': {
    title: 'Quick Suggestions Delay',
    type: 'number',
    subCategory: 'Suggestions',
    defaultValue: 10,
    minimum: 0,
    maximum: 1000,
    order: 2,
    tags: ['suggestions'],
    markdownDescription: 'Controls the delay in milliseconds after which quick suggestions will show up.',
  },

  // ── Accept Behavior ──────────────────────────────────────────────────────

  'editor.acceptSuggestionOnCommitCharacter': {
    title: 'Accept Suggestion On Commit Character',
    type: 'boolean',
    subCategory: 'Suggestions',
    defaultValue: true,
    order: 5,
    tags: ['suggestions'],
    markdownDescription:
      'Controls whether suggestions should be accepted on commit characters.\n\n' +
      '**Example:** In JavaScript, pressing `;` can accept a suggestion and type that character simultaneously.',
  },

  'editor.acceptSuggestionOnEnter': {
    title: 'Accept Suggestion On Enter',
    type: 'select',
    subCategory: 'Suggestions',
    defaultValue: 'on',
    order: 6,
    tags: ['suggestions'],
    markdownDescription:
      'Controls whether suggestions should be accepted on `Enter`, in addition to `Tab`.\n\n' +
      'Helps to avoid ambiguity between inserting new lines or accepting suggestions.',
    enum: ['on', 'smart', 'off'],
    enumItemLabels: ['On', 'Smart', 'Off'],
    enumDescriptions: [
      'Always accept a suggestion on Enter.',
      'Only accept a suggestion with Enter when it makes a textual change.',
      'Never accept a suggestion on Enter.',
    ],
  },

  'editor.suggestOnTriggerCharacters': {
    title: 'Suggest On Trigger Characters',
    type: 'boolean',
    subCategory: 'Suggestions',
    defaultValue: true,
    order: 7,
    tags: ['suggestions'],
    markdownDescription:
      'Controls whether suggestions should automatically show up when typing trigger characters.\n\n' +
      '**Example:** In JavaScript, typing `.` after an object triggers method suggestions.',
  },

  // ── Suggest Widget Appearance ────────────────────────────────────────────

  'editor.suggestSelection': {
    title: 'Suggest Selection',
    type: 'select',
    subCategory: 'Suggestions',
    defaultValue: 'first',
    order: 10,
    tags: ['suggestions'],
    description: 'Controls how suggestions are pre-selected when showing the suggest list.',
    enum: ['first', 'recentlyUsed', 'recentlyUsedByPrefix'],
    enumItemLabels: ['First', 'Recently Used', 'Recently Used By Prefix'],
    enumDescriptions: [
      'Always select the first suggestion.',
      'Select recent suggestions unless further typing selects one.',
      'Select suggestions based on previous prefixes that have completed those suggestions.',
    ],
  },

  'editor.suggestFontSize': {
    title: 'Suggest Font Size',
    type: 'number',
    subCategory: 'Suggestions',
    defaultValue: 0,
    minimum: 0,
    maximum: 100,
    order: 11,
    tags: ['suggestions'],
    markdownDescription: 'Font size for the suggest widget. When set to `0`, the value of `#editor.fontSize#` is used.',
  },

  'editor.suggestLineHeight': {
    title: 'Suggest Line Height',
    type: 'number',
    subCategory: 'Suggestions',
    defaultValue: 0,
    minimum: 0,
    maximum: 1000,
    order: 12,
    tags: ['suggestions'],
    markdownDescription: 'Line height for the suggest widget. When set to `0`, the value of `#editor.lineHeight#` is used.',
  },

  'editor.suggest.insertMode': {
    title: 'Suggest Insert Mode',
    type: 'select',
    subCategory: 'Suggestions',
    defaultValue: 'insert',
    order: 13,
    tags: ['suggestions'],
    markdownDescription:
      'Controls whether words are overwritten when accepting completions.\n\n' +
      '| Mode | Behavior |\n' +
      '|:-----|:---------|\n' +
      '| `insert` | Inserts the completion text without deleting the word to the right of the cursor |\n' +
      '| `replace` | Replaces the entire word to the right of the cursor |',
    enum: ['insert', 'replace'],
    enumItemLabels: ['Insert', 'Replace'],
  },

  'editor.suggest.filterGraceful': {
    title: 'Suggest Filter Graceful',
    type: 'boolean',
    subCategory: 'Suggestions',
    defaultValue: true,
    order: 14,
    tags: ['suggestions'],
    markdownDescription:
      'Controls graceful matching of suggestions.\n\n' +
      'When enabled, minor typos are tolerated and still produce matches. When disabled, only exact prefix matches are shown.',
  },

  'editor.suggest.localityBonus': {
    title: 'Suggest Locality Bonus',
    type: 'boolean',
    subCategory: 'Suggestions',
    defaultValue: false,
    order: 15,
    tags: ['suggestions'],
    markdownDescription:
      'Controls sorting of completions by proximity to the cursor.\n\n' +
      'When enabled, suggestions that appear closer to the current cursor position in the file are ranked higher.',
  },

  'editor.suggest.shareSuggestSelections': {
    title: 'Suggest Share Selections',
    type: 'boolean',
    subCategory: 'Suggestions',
    defaultValue: false,
    order: 16,
    tags: ['suggestions'],
    markdownDescription:
      'Controls whether the suggestion selection persists across editor sessions.\n\n' +
      'When enabled, your last accepted suggestion is remembered and pre-selected next time.',
  },

  'editor.suggest.preview': {
    title: 'Suggest Preview',
    type: 'boolean',
    subCategory: 'Suggestions',
    defaultValue: false,
    order: 17,
    tags: ['suggestions'],
    markdownDescription:
      'Controls whether to preview the suggestion outcome in the editor.\n\n' +
      'When enabled, the accepted text is shown inline as ghost text before you confirm.',
  },

  'editor.suggest.previewMode': {
    title: 'Suggest Preview Mode',
    type: 'select',
    subCategory: 'Suggestions',
    defaultValue: 'subwordSmart',
    order: 18,
    tags: ['suggestions'],
    markdownDescription: 'Controls the way in which the inline completion is shown.',
    enum: ['prefix', 'subword', 'subwordSmart'],
    enumItemLabels: ['Prefix', 'Subword', 'Subword Smart'],
    enumDescriptions: [
      'Shows the preview only for the prefix part.',
      'Shows the preview for all subwords.',
      'Shows the preview for all subwords, but skips if the current word matches a subword.',
    ],
  },

  'editor.suggest.showIcons': {
    title: 'Suggest Show Icons',
    type: 'boolean',
    subCategory: 'Suggestions',
    defaultValue: true,
    order: 19,
    tags: ['suggestions'],
    markdownDescription: 'Controls whether to show or hide icons in suggestions.',
  },

  'editor.suggest.showStatusBar': {
    title: 'Suggest Show Status Bar',
    type: 'boolean',
    subCategory: 'Suggestions',
    defaultValue: false,
    order: 20,
    tags: ['suggestions'],
    markdownDescription:
      'Controls the visibility of the status bar at the bottom of the suggest widget.\n\n' +
      'The status bar shows keyboard hints for accepting, toggling details, etc.',
  },

  'editor.suggestMatchOnWordStartOnly': {
    title: 'Suggest Match On Word Start Only',
    type: 'boolean',
    subCategory: 'Suggestions',
    defaultValue: true,
    order: 21,
    tags: ['suggestions'],
    markdownDescription:
      'Controls whether filtering and sorting suggestions accounts for small typos.\n\n' +
      'When disabled, fuzzy matching is more permissive.',
  },

  // ── Word-Based Suggestions ────────────────────────────────────────────────

  'editor.wordBasedSuggestions': {
    title: 'Word Based Suggestions',
    type: 'select',
    subCategory: 'Suggestions',
    defaultValue: 'matchingDocuments',
    order: 25,
    tags: ['suggestions'],
    markdownDescription:
      'Controls which documents are used to compute word based completions.\n\n' +
      '| Mode | Behavior |\n' +
      '|:-----|:---------|\n' +
      '| `off` | No word-based completions |\n' +
      '| `currentDocument` | Only uses words from the current document |\n' +
      '| `matchingDocuments` | Uses words from all open documents of the same language |\n' +
      '| `allDocuments` | Uses words from all open documents |',
    enum: ['off', 'currentDocument', 'matchingDocuments', 'allDocuments'],
    enumItemLabels: ['Off', 'Current Document', 'Matching Documents', 'All Documents'],
  },

  'editor.wordBasedSuggestionsOnlySameLanguage': {
    title: 'Word Based Suggestions Only Same Language',
    type: 'boolean',
    subCategory: 'Suggestions',
    defaultValue: false,
    order: 26,
    tags: ['suggestions'],
    markdownDescription:
      'Controls whether word-based completions should only be provided from documents of the same language.\n\n' +
      'Only effective when `#editor.wordBasedSuggestions#` is not `off`.',
  },

  // ── Suggest Item Visibility (what types show up) ──────────────────────────

  'editor.suggest.showMethods': {
    title: 'Show Methods in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 30,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether method-completions are shown in the suggest widget.',
  },

  'editor.suggest.showFunctions': {
    title: 'Show Functions in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 31,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether function-completions are shown in the suggest widget.',
  },

  'editor.suggest.showConstructors': {
    title: 'Show Constructors in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 32,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether constructor-completions are shown in the suggest widget.',
  },

  'editor.suggest.showFields': {
    title: 'Show Fields in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 33,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether field-completions are shown in the suggest widget.',
  },

  'editor.suggest.showVariables': {
    title: 'Show Variables in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 34,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether variable-completions are shown in the suggest widget.',
  },

  'editor.suggest.showClasses': {
    title: 'Show Classes in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 35,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether class-completions are shown in the suggest widget.',
  },

  'editor.suggest.showStructs': {
    title: 'Show Structs in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 36,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether struct-completions are shown in the suggest widget.',
  },

  'editor.suggest.showInterfaces': {
    title: 'Show Interfaces in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 37,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether interface-completions are shown in the suggest widget.',
  },

  'editor.suggest.showModules': {
    title: 'Show Modules in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 38,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether module-completions are shown in the suggest widget.',
  },

  'editor.suggest.showProperties': {
    title: 'Show Properties in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 39,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether property-completions are shown in the suggest widget.',
  },

  'editor.suggest.showEvents': {
    title: 'Show Events in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 40,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether event-completions are shown in the suggest widget.',
  },

  'editor.suggest.showOperators': {
    title: 'Show Operators in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 41,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether operator-completions are shown in the suggest widget.',
  },

  'editor.suggest.showUnits': {
    title: 'Show Units in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 42,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether unit-completions are shown in the suggest widget.',
  },

  'editor.suggest.showValues': {
    title: 'Show Values in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 43,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether value-completions are shown in the suggest widget.',
  },

  'editor.suggest.showConstants': {
    title: 'Show Constants in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 44,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether constant-completions are shown in the suggest widget.',
  },

  'editor.suggest.showEnums': {
    title: 'Show Enums in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 45,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether enum-completions are shown in the suggest widget.',
  },

  'editor.suggest.showEnumMembers': {
    title: 'Show Enum Members in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 46,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether enumMember-completions are shown in the suggest widget.',
  },

  'editor.suggest.showKeywords': {
    title: 'Show Keywords in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 47,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether keyword-completions are shown in the suggest widget.',
  },

  'editor.suggest.showWords': {
    title: 'Show Words in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 48,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether word-based completions are shown in the suggest widget.',
  },

  'editor.suggest.showColors': {
    title: 'Show Colors in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 49,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether color-completions are shown in the suggest widget.',
  },

  'editor.suggest.showFiles': {
    title: 'Show Files in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 50,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether file-completions are shown in the suggest widget.',
  },

  'editor.suggest.showReferences': {
    title: 'Show References in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 51,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether reference-completions are shown in the suggest widget.',
  },

  'editor.suggest.showFolders': {
    title: 'Show Folders in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 52,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether folder-completions are shown in the suggest widget.',
  },

  'editor.suggest.showTypeParameters': {
    title: 'Show Type Parameters in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 53,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether typeParameter-completions are shown in the suggest widget.',
  },

  'editor.suggest.showSnippets': {
    title: 'Show Snippets in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 54,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions', 'snippet'],
    description: 'Controls whether snippet-completions are shown in the suggest widget.',
  },

  'editor.suggest.showUsers': {
    title: 'Show Users in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 55,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether user-completions are shown in the suggest widget.',
  },

  'editor.suggest.showIssues': {
    title: 'Show Issues in Suggestions',
    type: 'boolean',
    defaultValue: true,
    order: 56,
    subCategory: 'Suggestions > Suggest Item Visibility',
    tags: ['suggestions'],
    description: 'Controls whether issue-completions are shown in the suggest widget.',
  },

  // ── Snippet & Tab ─────────────────────────────────────────────────────────

  'editor.snippetSuggestions': {
    title: 'Snippet Suggestions',
    type: 'select',
    subCategory: 'Suggestions',
    defaultValue: 'inline',
    order: 60,
    tags: ['suggestions', 'snippet'],
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

  'editor.tabCompletion': {
    title: 'Tab Completion',
    type: 'select',
    subCategory: 'Suggestions',
    defaultValue: 'off',
    order: 61,
    tags: ['suggestions', 'tab'],
    description: 'Enables tab completions.',
    enum: ['on', 'off', 'onlySnippets'],
    enumItemLabels: ['On', 'Off', 'Only Snippets'],
    enumDescriptions: [
      'Tab complete will insert the best matching suggestion when pressing Tab.',
      'Disable tab completions.',
      'Tab complete snippets when their prefix match. Works best when quickSuggestions are disabled.',
    ],
  },

  // ── Parameter Hints ──────────────────────────────────────────────────────

  'editor.parameterHints.enabled': {
    title: 'Parameter Hints Enabled',
    type: 'boolean',
    defaultValue: true,
    order: 70,
    subCategory: 'Parameter Hints',
    tags: ['suggestions', 'hints'],
    markdownDescription:
      'Enables a pop-up that shows parameter documentation and type information as you type a function call.\n\n' +
      '**Example:** Typing `console.log(` shows the signature `log(message?: any, ...optionalParams: any[]): void`.',
  },

  'editor.parameterHints.cycle': {
    title: 'Parameter Hints Cycle',
    type: 'boolean',
    defaultValue: false,
    order: 71,
    subCategory: 'Parameter Hints',
    tags: ['suggestions', 'hints'],
    description: 'Controls whether the parameter hints menu cycles or closes when reaching the end of the list.',
  },

  // ── Hover ────────────────────────────────────────────────────────────────

  'editor.hover.enabled': {
    title: 'Hover Enabled',
    type: 'boolean',
    defaultValue: true,
    order: 80,
    subCategory: 'Hover',
    tags: ['hover'],
    description: 'Controls whether the hover is shown.',
  },

  'editor.hover.delay': {
    title: 'Hover Delay',
    type: 'number',
    defaultValue: 300,
    minimum: 0,
    maximum: 10000,
    order: 81,
    subCategory: 'Hover',
    tags: ['hover'],
    description: 'Controls the delay in milliseconds after which the hover is shown.',
  },

  'editor.hover.sticky': {
    title: 'Hover Sticky',
    type: 'boolean',
    defaultValue: true,
    order: 82,
    subCategory: 'Hover',
    tags: ['hover'],
    description: 'Controls whether the hover should remain visible when mouse is moved over it.',
  },

  'editor.hover.above': {
    title: 'Hover Above',
    type: 'boolean',
    defaultValue: true,
    order: 83,
    subCategory: 'Hover',
    tags: ['hover'],
    description: 'Prefer showing hovers above the line, if there is space.',
  },

  'editor.hover.hidingDelay': {
    title: 'Hover Hiding Delay',
    type: 'number',
    defaultValue: 300,
    minimum: 0,
    maximum: 10000,
    order: 84,
    subCategory: 'Hover',
    tags: ['hover'],
    markdownDescription: 'Controls the delay in milliseconds after which the hover widget is hidden when `#editor.hover.sticky#` is enabled.',
  },

  // ── Inlay Hints ──────────────────────────────────────────────────────────

  'editor.inlayHints.enabled': {
    title: 'Inlay Hints Enabled',
    type: 'select',
    defaultValue: 'on',
    order: 90,
    subCategory: 'Inlay Hints',
    tags: ['hints', 'intellisense'],
    markdownDescription:
      'Enables the inlay hints in the editor.\n\n' +
      'Inlay hints show inline type information, parameter names, and other annotations directly in the code.\n\n' +
      '| Setting | Behavior |\n' +
      '|:--------|:---------|\n' +
      '| `on` | Always visible |\n' +
      '| `onUnlessPressed` | Visible by default, hidden when `Ctrl+Alt` is held |\n' +
      '| `offUnlessPressed` | Hidden by default, shown when `Ctrl+Alt` is held |\n' +
      '| `off` | Always hidden |',
    enum: ['on', 'onUnlessPressed', 'offUnlessPressed', 'off'],
    enumItemLabels: ['On', 'On Unless Pressed', 'Off Unless Pressed', 'Off'],
  },

  'editor.inlayHints.fontSize': {
    title: 'Inlay Hints Font Size',
    type: 'number',
    defaultValue: 0,
    minimum: 0,
    maximum: 100,
    order: 91,
    subCategory: 'Inlay Hints',
    tags: ['hints', 'font'],
    markdownDescription: 'Controls font size of inlay hints in the editor. When set to `0`, 90% of `#editor.fontSize#` is used.',
  },

  'editor.inlayHints.fontFamily': {
    title: 'Inlay Hints Font Family',
    type: 'string',
    defaultValue: '',
    order: 92,
    subCategory: 'Inlay Hints',
    tags: ['hints', 'font'],
    markdownDescription: 'Controls font family of inlay hints in the editor. When set to empty, `#editor.fontFamily#` is used.',
  },

  'editor.inlayHints.padding': {
    title: 'Inlay Hints Padding',
    type: 'boolean',
    defaultValue: false,
    order: 93,
    subCategory: 'Inlay Hints',
    tags: ['hints'],
    description: 'Enables the padding around the inlay hints in the editor.',
  },

  // ── Code Lens ────────────────────────────────────────────────────────────

  'editor.codeLens': {
    title: 'Code Lens',
    type: 'boolean',
    defaultValue: true,
    order: 100,
    subCategory: 'Code Lens',
    tags: ['display', 'codelens'],
    markdownDescription:
      'Controls whether the editor shows CodeLens.\n\n' +
      'CodeLens shows actionable, contextual information alongside your code (e.g., "5 references", "Run Test").',
  },

  'editor.codeLensFontFamily': {
    title: 'Code Lens Font Family',
    type: 'string',
    defaultValue: '',
    order: 101,
    subCategory: 'Code Lens',
    tags: ['codelens', 'font'],
    markdownDescription: 'Controls the font family for CodeLens. When set to empty, `#editor.fontFamily#` is used.',
  },

  'editor.codeLensFontSize': {
    title: 'Code Lens Font Size',
    type: 'number',
    defaultValue: 0,
    minimum: 0,
    maximum: 100,
    order: 102,
    subCategory: 'Code Lens',
    tags: ['codelens', 'font'],
    markdownDescription: 'Controls the font size in pixels for CodeLens. When set to `0`, 90% of `#editor.fontSize#` is used.',
  },

  // ── Light Bulb ───────────────────────────────────────────────────────────

  'editor.lightbulb.enabled': {
    title: 'Light Bulb Enabled',
    type: 'select',
    defaultValue: 'onCode',
    order: 110,
    tags: ['display', 'quickfix'],
    markdownDescription:
      'Controls whether to show the light bulb 💡 for quick fixes and code actions.\n\n' +
      '- `off` — Never shown.\n' +
      '- `on` — Always shown when quick fixes are available.\n' +
      '- `onCode` — Only shown on lines with code (not blank lines or comments).',
    enum: ['off', 'on', 'onCode'],
    enumItemLabels: ['Off', 'On', 'On Code'],
  },
};