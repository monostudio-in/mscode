// src/features/settings/config/branchs/editor/parts/displaySettings.ts
import type { IConfigurationSection } from '@/core/extensionAPI/registry/configurationRegistry';

export const displayProperties: IConfigurationSection['properties'] = {

  // ── Line Numbers ─────────────────────────────────────────────────────────

  'editor.lineNumbers': {
    title: 'Line Numbers',
    type: 'select',
    defaultValue: 'on',
    order: 1,
    tags: ['display', 'gutter'],
    description: 'Controls the display of line numbers.',
    enum: ['off', 'on', 'relative', 'interval'],
    enumItemLabels: ['Off', 'On', 'Relative', 'Interval'],
    enumDescriptions: [
      'Line numbers are not rendered.',
      'Line numbers are rendered as absolute numbers.',
      'Line numbers are rendered as distance in lines to cursor position.',
      'Line numbers are rendered every 10 lines.',
    ],
  },

  'editor.lineDecorationsWidth': {
    title: 'Line Decorations Width',
    type: 'number',
    defaultValue: 4.5,
    minimum: 0,
    maximum: 1000,
    order: 2,
    tags: ['display', 'gutter'],
    markdownDescription: 'Controls the width of the space reserved for decorations in the gutter (in pixels).',
  },

  // ── Word Wrap ────────────────────────────────────────────────────────────

  'editor.wordWrap': {
    title: 'Word Wrap',
    type: 'select',
    defaultValue: 'off',
    order: 10,
    tags: ['display', 'wrap'],
    description: 'Controls how lines should wrap.',
    enum: ['off', 'on', 'wordWrapColumn', 'bounded'],
    enumItemLabels: ['Off', 'On', 'Word Wrap Column', 'Bounded'],
    enumDescriptions: [
      'Lines will never wrap.',
      'Lines will wrap at the viewport width.',
      'Lines will wrap at editor.wordWrapColumn.',
      'Lines will wrap at the minimum of viewport width and editor.wordWrapColumn.',
    ],
  },

  'editor.wordWrapColumn': {
    title: 'Word Wrap Column',
    type: 'number',
    defaultValue: 80,
    minimum: 1,
    maximum: 10000,
    order: 11,
    tags: ['display', 'wrap'],
    markdownDescription: 'Controls the column at which to wrap when `#editor.wordWrap#` is set to `wordWrapColumn` or `bounded`.',
  },

  'editor.wrappingIndent': {
    title: 'Wrapping Indent',
    type: 'select',
    defaultValue: 'same',
    order: 12,
    tags: ['display', 'wrap'],
    description: 'Controls the indentation of wrapped lines.',
    enum: ['none', 'same', 'indent', 'deepIndent'],
    enumItemLabels: ['None', 'Same', 'Indent', 'Deep Indent'],
    enumDescriptions: [
      'No indentation — wrapped lines begin at column 1.',
      'Wrapped lines get the same indentation as the parent.',
      'Wrapped lines get +1 indentation compared to the parent.',
      'Wrapped lines get +2 indentation compared to the parent.',
    ],
  },

  'editor.wordWrapBreakAfterCharacters': {
    title: 'Word Wrap Break After Characters',
    type: 'string',
    defaultValue: ' \t})]?|/&.,;¢°′″‰℃、。｡､￠，．：；？！％・･ゝゞヽヾーァィゥェォッャュョ・。',
    order: 13,
    tags: ['wrap'],
    description: 'Configure word wrapping characters. A break will be introduced after these characters.',
  },

  // ── Rulers ───────────────────────────────────────────────────────────────

  'editor.rulers': {
    title: 'Rulers',
    type: 'string',
    defaultValue: '',
    order: 15,
    tags: ['display'],
    markdownDescription:
      'Render vertical rulers after a certain number of characters.\n\n' +
      'Use comma-separated numbers for multiple rulers. Example: `80, 120`.\n\n' +
      'No rulers are drawn if left empty.',
  },

  // ── Whitespace ───────────────────────────────────────────────────────────

  'editor.renderWhitespace': {
    title: 'Render Whitespace',
    type: 'select',
    defaultValue: 'selection',
    order: 20,
    tags: ['display', 'whitespace'],
    description: 'Controls how the editor should render whitespace characters.',
    enum: ['none', 'boundary', 'selection', 'trailing', 'all'],
    enumItemLabels: ['None', 'Boundary', 'Selection', 'Trailing', 'All'],
    enumDescriptions: [
      'No whitespace characters are rendered.',
      'Whitespace characters are rendered only on word boundaries.',
      'Whitespace characters are rendered only when selected.',
      'Trailing whitespace characters are rendered.',
      'All whitespace characters are rendered.',
    ],
  },

  'editor.experimentalWhitespaceRendering': {
    title: 'Experimental Whitespace Rendering',
    type: 'select',
    defaultValue: 'svg',
    order: 21,
    tags: ['display', 'whitespace'],
    experimental: true,
    markdownDescription:
      'Controls the rendering engine for whitespace characters.\n\n' +
      '- `svg` — Better quality, slightly more GPU usage.\n' +
      '- `font` — Faster, uses font-based rendering.\n' +
      '- `off` — Disables experimental rendering and falls back to legacy.',
    enum: ['svg', 'font', 'off'],
    enumItemLabels: ['SVG', 'Font', 'Off'],
  },

  'editor.renderControlCharacters': {
    title: 'Render Control Characters',
    type: 'boolean',
    defaultValue: true,
    order: 22,
    tags: ['display'],
    description: 'Controls whether the editor should render control characters.',
  },

  // ── Line Highlight ───────────────────────────────────────────────────────

  'editor.renderLineHighlight': {
    title: 'Render Line Highlight',
    type: 'select',
    subCategory: 'Highlighting',
    defaultValue: 'line',
    order: 25,
    tags: ['display'],
    description: 'Controls how the editor should render the current line highlight.',
    enum: ['none', 'gutter', 'line', 'all'],
    enumItemLabels: ['None', 'Gutter', 'Line', 'All'],
    enumDescriptions: [
      'No current line highlight is rendered.',
      'The gutter is highlighted.',
      'The line is highlighted.',
      'Both the gutter and the line are highlighted.',
    ],
  },

  'editor.renderLineHighlightOnlyWhenFocus': {
    title: 'Render Line Highlight Only When Focused',
    type: 'boolean',
    subCategory: 'Highlighting',
    defaultValue: false,
    order: 26,
    tags: ['display'],
    description: 'Controls if the editor should render the current line highlight only when the editor is focused.',
  },

  // ── Word & Selection Highlighting ────────────────────────────────────────

  'editor.occurrencesHighlight': {
    title: 'Occurrences Highlight',
    type: 'select',
    defaultValue: 'off',
    order: 30,
    tags: ['display', 'highlight'],
    subCategory: 'Highlighting',
    markdownDescription:
      'Controls whether the editor should highlight semantic symbol occurrences.\n\n' +
      '- `off` — No occurrence highlighting.\n' +
      '- `singleFile` — Highlights occurrences only in the current file.\n' +
      '- `multiFile` — Highlights across open files (requires language server support).',
    enum: ['off', 'singleFile', 'multiFile'],
    enumItemLabels: ['Off', 'Single File', 'Multi File'],
  },

  'editor.selectionHighlight': {
    title: 'Selection Highlight',
    type: 'boolean',
    subCategory: 'Highlighting',
    defaultValue: true,
    order: 31,
    tags: ['display', 'highlight', 'selection'],
    markdownDescription:
      'Controls whether the editor should highlight matches similar to the selection.\n\n' +
      '**Example:** Select the word `const` — all other occurrences in the visible range get highlighted with a different background.',
  },

  // ── Bracket Matching ─────────────────────────────────────────────────────

  'editor.matchBrackets': {
    title: 'Match Brackets',
    type: 'select',
    defaultValue: 'always',
    order: 40,
    tags: ['display', 'brackets'],
    description: 'Highlight matching brackets.',
    enum: ['always', 'near', 'never'],
    enumItemLabels: ['Always', 'Near', 'Never'],
    enumDescriptions: [
      'Always highlight matching brackets.',
      'Highlight matching brackets only when one bracket is next to the cursor.',
      'Never highlight matching brackets.',
    ],
  },

  // ── Bracket Pair Colorization ─────────────────────────────────────────────

  'editor.bracketPairColorization.enabled': {
    title: 'Bracket Pair Colorization',
    type: 'boolean',
    defaultValue: true,
    order: 45,
    subCategory: 'Bracket Pair Colorization',
    tags: ['display', 'brackets', 'color'],
    markdownDescription:
      'Controls whether bracket pair colorization is enabled or not.\n\n' +
      'Each matching bracket pair gets a unique color so they are easy to tell apart.\n\n' +
      '> **Tip:** Use `workbench.colorCustomizations` to override the bracket highlight colors.',
  },

  'editor.bracketPairColorization.independentColorPoolPerBracketType': {
    title: 'Independent Color Pool Per Bracket Type',
    type: 'boolean',
    defaultValue: false,
    order: 46,
    subCategory: 'Bracket Pair Colorization',
    tags: ['display', 'brackets', 'color'],
    markdownDescription:
      'Controls whether each bracket type uses its own independent color pool.\n\n' +
      '| Setting | Result |\n' +
      '|:--------|:-------|\n' +
      '| `false` | `()` `[]` `{}` share one color pool |\n' +
      '| `true` | Each type has its own color pool, so they never share a color |',
  },

  // ── Guides ───────────────────────────────────────────────────────────────

  'editor.guides.indentation': {
    title: 'Indentation Guides',
    type: 'boolean',
    defaultValue: true,
    order: 50,
    subCategory: 'Guides',
    tags: ['display', 'indent'],
    description: 'Controls whether the editor should render indent guides.',
  },

  'editor.guides.highlightActiveIndentation': {
    title: 'Highlight Active Indentation',
    type: 'select',
    defaultValue: 'true',
    order: 51,
    subCategory: 'Guides',
    tags: ['display', 'indent'],
    description: 'Controls whether the editor should highlight the active indent guide.',
    enum: ['true', 'always', 'false'],
    enumItemLabels: ['True', 'Always', 'False'],
    enumDescriptions: [
      'Highlights the active indent guide.',
      'Highlights the active indent guide even if bracket guides are highlighted.',
      'Does not highlight the indent guide.',
    ],
  },

  'editor.guides.bracketPairs': {
    title: 'Bracket Pair Guides',
    type: 'select',
    defaultValue: 'false',
    order: 52,
    subCategory: 'Guides',
    tags: ['display', 'brackets'],
    description: 'Controls whether bracket pair guides are enabled or not.',
    enum: ['true', 'active', 'false'],
    enumItemLabels: ['True', 'Active', 'False'],
    enumDescriptions: [
      'Enables bracket pair guides.',
      'Enables bracket pair guides only for the active bracket pair.',
      'Disables bracket pair guides.',
    ],
  },

  'editor.guides.bracketPairsHorizontal': {
    title: 'Bracket Pair Horizontal Guides',
    type: 'select',
    defaultValue: 'active',
    order: 53,
    subCategory: 'Guides',
    tags: ['display', 'brackets'],
    description: 'Controls whether horizontal bracket pair guides are enabled or not.',
    enum: ['true', 'active', 'false'],
    enumItemLabels: ['True', 'Active', 'False'],
  },

  // ── Folding ──────────────────────────────────────────────────────────────

  'editor.folding': {
    title: 'Folding',
    type: 'boolean',
    defaultValue: true,
    order: 60,
    tags: ['display', 'folding'],
    description: 'Controls whether the editor has code folding enabled.',
  },

  'editor.foldingStrategy': {
    title: 'Folding Strategy',
    type: 'select',
    defaultValue: 'auto',
    order: 61,
    tags: ['folding'],
    description: 'Controls the strategy for computing folding ranges.',
    enum: ['auto', 'indentation'],
    enumItemLabels: ['Auto', 'Indentation'],
    enumDescriptions: [
      'Use a language-specific folding strategy if available, else indentation-based.',
      'Use the indentation-based folding strategy.',
    ],
  },

  'editor.foldingHighlight': {
    title: 'Folding Highlight',
    type: 'boolean',
    defaultValue: true,
    order: 62,
    tags: ['folding'],
    description: 'Controls whether the editor should highlight folded ranges.',
  },

  'editor.foldingImportsByDefault': {
    title: 'Fold Imports By Default',
    type: 'boolean',
    defaultValue: false,
    order: 63,
    tags: ['folding'],
    description: 'Controls whether the editor automatically collapses import ranges.',
  },

  'editor.foldingMaximumRegions': {
    title: 'Folding Maximum Regions',
    type: 'number',
    defaultValue: 5000,
    minimum: 10,
    maximum: 65000,
    order: 64,
    tags: ['folding', 'performance'],
    markdownDescription:
      'Controls the maximum number of foldable regions.\n\n' +
      '> **Warning:** Increasing this value may have a performance impact for large files.',
  },

  'editor.showFoldingControls': {
    title: 'Show Folding Controls',
    type: 'select',
    defaultValue: 'mouseover',
    order: 65,
    tags: ['folding', 'gutter'],
    description: 'Controls when the folding controls on the gutter are shown.',
    enum: ['always', 'never', 'mouseover'],
    enumItemLabels: ['Always', 'Never', 'Mouse Over'],
    enumDescriptions: [
      'Always show the folding controls.',
      'Never show the folding controls and reduce the gutter size.',
      'Only show the folding controls when the mouse is over the gutter.',
    ],
  },
  "editor.foldingPosition" : {
    "title": "Folding Icon Position",
    "type": "select",
    "order": 66,
    "enum": ["left", "right"],
    "enumItemLabels" : ["Left","Right"],
    "defaultValue": "right",
    "markdownDescription": "Show folding controls on the left or right of the line numbers."
  },

  // ── Glyph Margin ─────────────────────────────────────────────────────────

  'editor.glyphMargin': {
    title: 'Glyph Margin',
    type: 'boolean',
    defaultValue: false,
    order: 70,
    tags: ['display', 'gutter'],
    description: 'Controls whether the editor should render the vertical glyph margin. Used for debugging breakpoints, test decorations, etc.',
  },

  // ── Padding ──────────────────────────────────────────────────────────────

  'editor.padding.top': {
    title: 'Padding Top',
    type: 'number',
    defaultValue: 0,
    minimum: 0,
    maximum: 1000,
    order: 75,
    tags: ['display'],
    markdownDescription: 'Controls the amount of space (in pixels) between the top edge of the editor and the first line.',
  },

  'editor.padding.bottom': {
    title: 'Padding Bottom',
    type: 'number',
    defaultValue: 0,
    minimum: 0,
    maximum: 1000,
    order: 76,
    tags: ['display'],
    markdownDescription: 'Controls the amount of space (in pixels) between the bottom edge of the editor and the last line.',
  },

  // ── Semantic Highlighting ─────────────────────────────────────────────────

  'editor.semanticHighlighting.enabled': {
    title: 'Semantic Highlighting',
    type: 'select',
    defaultValue: 'configuredByTheme',
    order: 80,
    subCategory: 'Highlighting > Semantic Highlighting',
    tags: ['display', 'highlight', 'color'],
    markdownDescription:
      'Controls whether semantic token coloring is enabled for languages that support it (e.g., TypeScript, Python).\n\n' +
      'Semantic highlighting adds more accurate colors based on the language\'s type system on top of syntax highlighting.\n\n' +
      '- `true` — Always enabled.\n' +
      '- `false` — Always disabled.\n' +
      '- `configuredByTheme` — Let the active color theme decide (recommended).',
    enum: ['true', 'false', 'configuredByTheme'],
    enumItemLabels: ['Always On', 'Always Off', 'Configured By Theme'],
  },

  // ── Unicode Highlight ────────────────────────────────────────────────────

  'editor.unicodeHighlight.ambiguousCharacters': {
    title: 'Unicode: Ambiguous Characters',
    type: 'boolean',
    defaultValue: true,
    order: 90,
    subCategory: 'Highlighting > Unicode Highlight',
    tags: ['display', 'unicode', 'security'],
    markdownDescription:
      'Controls whether characters that can be confused with basic ASCII characters are highlighted.\n\n' +
      '**Example:** The Cyrillic `а` (U+0430) is visually identical to Latin `a` (U+0061) — a common [homograph attack](https://en.wikipedia.org/wiki/IDN_homograph_attack) vector.',
  },

  'editor.unicodeHighlight.invisibleCharacters': {
    title: 'Unicode: Invisible Characters',
    type: 'boolean',
    defaultValue: true,
    order: 91,
    subCategory: 'Highlighting > Unicode Highlight',
    tags: ['display', 'unicode', 'security'],
    markdownDescription:
      'Controls whether invisible Unicode characters are highlighted.\n\n' +
      'Invisible characters (like zero-width spaces, soft hyphens, etc.) can cause subtle bugs and security issues.',
  },

  'editor.unicodeHighlight.nonBasicASCII': {
    title: 'Unicode: Non-Basic ASCII',
    type: 'select',
    defaultValue: 'inUntrustedWorkspace',
    order: 92,
    subCategory: 'Highlighting >Unicode Highlight',
    tags: ['display', 'unicode'],
    markdownDescription: 'Controls whether all non-basic ASCII characters are highlighted.',
    enum: ['true', 'false', 'inUntrustedWorkspace'],
    enumItemLabels: ['Always', 'Never', 'In Untrusted Workspaces Only'],
  },

  'editor.unicodeHighlight.includeComments': {
    title: 'Unicode: Include Comments',
    type: 'select',
    defaultValue: 'inUntrustedWorkspace',
    order: 93,
    subCategory: 'Highlighting >Unicode Highlight',
    tags: ['display', 'unicode'],
    markdownDescription: 'Controls whether characters in comments should also be subject to unicode highlighting.',
    enum: ['true', 'false', 'inUntrustedWorkspace'],
    enumItemLabels: ['Always', 'Never', 'In Untrusted Workspaces Only'],
  },

  'editor.unicodeHighlight.includeStrings': {
    title: 'Unicode: Include Strings',
    type: 'select',
    defaultValue: 'true',
    order: 94,
    subCategory: 'Highlighting > Unicode Highlight',
    tags: ['display', 'unicode'],
    markdownDescription: 'Controls whether characters in strings should also be subject to unicode highlighting.',
    enum: ['true', 'false', 'inUntrustedWorkspace'],
    enumItemLabels: ['Always', 'Never', 'In Untrusted Workspaces Only'],
  },

  // ── Deprecated / Unused ──────────────────────────────────────────────────

  'editor.showDeprecated': {
    title: 'Show Deprecated',
    type: 'boolean',
    defaultValue: true,
    order: 100,
    tags: ['display', 'linting'],
    markdownDescription:
      'Controls strikethrough rendering of deprecated variables.\n\n' +
      'When enabled, deprecated symbols appear with a ~~strikethrough~~ style as indicated by the language server.',
  },

  'editor.showUnused': {
    title: 'Show Unused',
    type: 'boolean',
    defaultValue: true,
    order: 101,
    tags: ['display', 'linting'],
    markdownDescription:
      'Controls fading/dimming of unused variables.\n\n' +
      'When enabled, unused declarations appear faded to draw attention to dead code.',
  },

  // ── Sticky Scroll ────────────────────────────────────────────────────────

  'editor.stickyScroll.enabled': {
    title: 'Sticky Scroll',
    type: 'boolean',
    defaultValue: true,
    order: 110,
    subCategory: 'Sticky Scroll',
    tags: ['display', 'scroll'],
    markdownDescription:
      'Shows the nested current scopes pinned at the top of the editor during scroll.\n\n' +
      '**Example:** While scrolling through a long function, the `function myFunc() {` line stays pinned at the top so you always know which scope you are in.',
  },

  'editor.stickyScroll.maxLineCount': {
    title: 'Sticky Scroll Max Line Count',
    type: 'number',
    defaultValue: 5,
    minimum: 1,
    maximum: 10,
    order: 111,
    subCategory: 'Sticky Scroll',
    tags: ['display', 'scroll'],
    markdownDescription: 'Defines the maximum number of sticky lines to show at the top of the editor.',
  },

  'editor.stickyScroll.defaultModel': {
    title: 'Sticky Scroll Default Model',
    type: 'select',
    defaultValue: 'outlineModel',
    order: 112,
    subCategory: 'Sticky Scroll',
    tags: ['display', 'scroll'],
    description: 'Defines the model to use for determining which lines to stick.',
    enum: ['outlineModel', 'foldingProviderModel', 'indentationModel'],
    enumItemLabels: ['Outline Model', 'Folding Provider Model', 'Indentation Model'],
    enumDescriptions: [
      'Use the outline model for sticky scroll.',
      'Use the folding provider model for sticky scroll.',
      'Use the indentation model for sticky scroll.',
    ],
  },

  'editor.stickyScroll.scrollWithEditor': {
    title: 'Sticky Scroll With Editor',
    type: 'boolean',
    defaultValue: true,
    order: 113,
    subCategory: 'Sticky Scroll',
    tags: ['display', 'scroll'],
    markdownDescription: "Enable scrolling of the sticky scroll widget with the editor's horizontal scrollbar.",
  },

  // ── Scrollbar ────────────────────────────────────────────────────────────

  'editor.scrollbar.vertical': {
    title: 'Vertical Scrollbar',
    type: 'select',
    defaultValue: 'hidden',
    order: 120,
    subCategory: 'Scrollbar',
    tags: ['scroll'],
    description: 'Controls the visibility of the vertical scrollbar.',
    enum: ['auto', 'visible', 'hidden'],
    enumItemLabels: ['Auto', 'Visible', 'Hidden'],
  },

  'editor.scrollbar.horizontal': {
    title: 'Horizontal Scrollbar',
    type: 'select',
    defaultValue: 'hidden',
    order: 121,
    subCategory: 'Scrollbar',
    tags: ['scroll'],
    description: 'Controls the visibility of the horizontal scrollbar.',
    enum: ['auto', 'visible', 'hidden'],
    enumItemLabels: ['Auto', 'Visible', 'Hidden'],
  },

  'editor.scrollbar.verticalScrollbarSize': {
    title: 'Vertical Scrollbar Size',
    type: 'number',
    defaultValue: 10,
    minimum: 0,
    maximum: 100,
    order: 122,
    subCategory: 'Scrollbar',
    tags: ['scroll'],
    markdownDescription: 'Controls the width of the vertical scrollbar in pixels.',
  },

  'editor.scrollbar.horizontalScrollbarSize': {
    title: 'Horizontal Scrollbar Size',
    type: 'number',
    defaultValue: 10,
    minimum: 0,
    maximum: 100,
    order: 123,
    subCategory: 'Scrollbar',
    tags: ['scroll'],
    markdownDescription: 'Controls the height of the horizontal scrollbar in pixels.',
  },

  'editor.scrollbar.scrollByPage': {
    title: 'Scroll By Page',
    type: 'boolean',
    defaultValue: false,
    order: 124,
    subCategory: 'Scrollbar',
    tags: ['scroll'],
    description: 'Controls whether clicks in the scrollbar scroll by page or jump to the click position.',
  },

  'editor.scrollbar.alwaysConsumeMouseWheel': {
    title: 'Always Consume Mouse Wheel',
    type: 'boolean',
    defaultValue: true,
    order: 125,
    subCategory: 'Scrollbar',
    tags: ['scroll'],
    description: 'Always consume mouse wheel events, preventing the page from scrolling while the cursor is over the editor.',
  },

  'editor.scrollbar.useShadows': {
    title: 'Scrollbar Use Shadows',
    type: 'boolean',
    defaultValue: true,
    order: 126,
    subCategory: 'Scrollbar',
    tags: ['scroll', 'display'],
    markdownDescription: 'Controls whether the scrollbar casts a shadow where the content is scrolled.',
  },

  'editor.scrollbar.verticalHasArrows': {
    title: 'Vertical Scrollbar Has Arrows',
    type: 'boolean',
    defaultValue: false,
    order: 127,
    subCategory: 'Scrollbar',
    tags: ['scroll'],
    markdownDescription: 'Controls whether the vertical scrollbar has arrow buttons at the top and bottom.',
  },

  'editor.scrollbar.horizontalHasArrows': {
    title: 'Horizontal Scrollbar Has Arrows',
    type: 'boolean',
    defaultValue: false,
    order: 128,
    subCategory: 'Scrollbar',
    tags: ['scroll'],
    markdownDescription: 'Controls whether the horizontal scrollbar has arrow buttons at the left and right.',
  },

  'editor.scrollbar.arrowSize': {
    title: 'Scrollbar Arrow Size',
    type: 'number',
    defaultValue: 11,
    minimum: 0,
    maximum: 100,
    order: 129,
    subCategory: 'Scrollbar',
    tags: ['scroll'],
    markdownDescription: 'Controls the size of the scrollbar arrow buttons in pixels.',
  },

  'editor.smoothScrolling': {
    title: 'Smooth Scrolling',
    type: 'boolean',
    defaultValue: false,
    order: 130,
    subCategory: 'Scrollbar',
    tags: ['scroll'],
    description: 'Controls whether the editor will scroll using an animation.',
  },

  'editor.fastScrollSensitivity': {
    title: 'Fast Scroll Sensitivity',
    type: 'number',
    defaultValue: 5,
    minimum: 1,
    maximum: 20,
    order: 131,
    subCategory: 'Scrollbar',
    tags: ['scroll'],
    markdownDescription: 'Scrolling speed multiplier when pressing `Alt`.',
  },

  'editor.mouseWheelScrollSensitivity': {
    title: 'Mouse Wheel Scroll Sensitivity',
    type: 'number',
    defaultValue: 1,
    minimum: 0.1,
    maximum: 20,
    order: 132,
    subCategory: 'Scrollbar',
    tags: ['scroll'],
    description: 'A multiplier to be used on the deltaX and deltaY of mouse wheel scroll events.',
  },

  'editor.scrollBeyondLastLine': {
    title: 'Scroll Beyond Last Line',
    type: 'boolean',
    defaultValue: true,
    order: 133,
    subCategory: 'Scrollbar',
    tags: ['scroll'],
    description: 'Controls whether the editor will scroll beyond the last line.',
  },

  'editor.scrollBeyondLastColumn': {
    title: 'Scroll Beyond Last Column',
    type: 'number',
    defaultValue: 5,
    minimum: 0,
    maximum: 100,
    order: 134,
    subCategory: 'Scrollbar',
    tags: ['scroll'],
    markdownDescription: 'Controls the number of extra characters beyond which the editor will scroll horizontally.',
  },

  'editor.scrollPredominantAxis': {
    title: 'Scroll Predominant Axis',
    type: 'boolean',
    defaultValue: true,
    order: 135,
    subCategory: 'Scrollbar',
    tags: ['scroll'],
    markdownDescription:
      'Scroll only along the predominant axis when scrolling both vertically and horizontally simultaneously.\n\n' +
      'Prevents accidentally scrolling horizontally when intending to scroll vertically (especially on trackpads).',
  },
  // ── Mobile Custom Scrollbar Settings ──

  'editor.scrollbar.thumbWidth': {
    title: 'Scrollbar Thumb Width',
    type: 'number',
    defaultValue: 15,
    minimum: 2,
    maximum: 50,
    order: 124,
    subCategory: 'Scrollbar',
    tags: ['scroll', 'mobile'],
    markdownDescription: 'Controls the visible thickness of the scrollbar thumb in pixels (Mobile Optimized).',
  },

  'editor.scrollbar.trackWidth': {
    title: 'Scrollbar Hit Track Width',
    type: 'number',
    defaultValue: 32,
    minimum: 10,
    maximum: 100,
    order: 125,
    subCategory: 'Scrollbar',
    tags: ['scroll', 'touch'],
    markdownDescription: 'Controls the invisible touch target width for easier grabbing on mobile screens.',
  },

  'editor.scrollbar.thumbFixedSize': {
    title: 'Scrollbar Thumb Fixed Height',
    type: 'number',
    defaultValue: 50,
    minimum: 10,
    maximum: 200,
    order: 126,
    subCategory: 'Scrollbar',
    tags: ['scroll', 'mobile'],
    markdownDescription: 'Sets a static height/width for the scrollbar thumb so it doesn\'t become too small on large files.',
  },

  'editor.scrollbar.autoHideDelay': {
    title: 'Scrollbar Auto Hide Delay',
    type: 'number',
    defaultValue: 1200,
    minimum: 100,
    maximum: 5000,
    order: 127,
    subCategory: 'Scrollbar',
    tags: ['scroll'],
    markdownDescription: 'Time in milliseconds before the scrollbar fades out after scrolling stops.',
  },

  // ── Performance ──────────────────────────────────────────────────────────

  'editor.largeFileOptimizations': {
    title: 'Large File Optimizations',
    type: 'boolean',
    defaultValue: true,
    order: 140,
    subCategory: 'Performance',
    tags: ['performance'],
    markdownDescription:
      'Special handling for large files to improve performance.\n\n' +
      'When enabled, certain features (tokenization, folding, etc.) are disabled for very large files.',
  },

  'editor.maxTokenizationLineLength': {
    title: 'Max Tokenization Line Length',
    type: 'number',
    defaultValue: 20000,
    minimum: 1,
    maximum: 999999,
    order: 141,
    subCategory: 'Performance',
    tags: ['performance'],
    markdownDescription:
      'Lines above this character length will **not** be tokenized for performance reasons.\n\n' +
      'Useful when working with minified files that have extremely long lines.',
  },

  'editor.stopRenderingLineAfter': {
    title: 'Stop Rendering Line After',
    type: 'number',
    defaultValue: 10000,
    minimum: -1,
    maximum: 999999,
    order: 142,
    subCategory: 'Performance',
    tags: ['performance'],
    markdownDescription:
      'Performance guard: stop rendering a line after it exceeds this many characters.\n\n' +
      'Use `-1` to disable the limit and always render the full line.',
  },
};