// src/core/theme/themes/mscode-amoled.ts
//
// Why a TS file instead of theme.css?
// ────────────────────────────────────
// A static [data-theme='amoled'] block in CSS can only set values at load
// time.  This file runs at runtime, which means:
//   ✓ Extensions can override any token or UI color without touching CSS
//   ✓ User-saved themes (Supabase / JSON) can be deep-merged at startup
//   ✓ Monaco syntax colors and IDE shell colors come from the same source
//   ✓ TypeScript gives compile-time safety on every color key
//
// AMOLED note
// ───────────
// OLED/AMOLED panels turn individual pixels completely off when they display
// pure black (#000000), drawing zero current for those pixels.  All surfaces
// that the user stares at most (editor canvas, sidebar, tab bar) are set to
// true black.  Secondary surfaces use near-black (#0a0a0a / #111111) for
// subtle depth without sacrificing battery savings.

import type { ThemeDefinition } from '../types';

export const mscodeAmoledTheme: ThemeDefinition = {
  id:   'mscode-amoled',
  name: 'MS Code AMOLED',
  type: 'dark',

  // ══════════════════════════════════════════════════════════════════════════
  // § A  IDE Shell Variables  –  injected as CSS custom properties on <html>
  //
  // Naming convention:  --ms-<component>-<role>
  // Usage in CSS:       color: var(--ms-text-main);
  //
  // Groups
  //   A1  Backgrounds
  //   A2  Text
  //   A3  Borders & Dividers
  //   A4  Interactive / Accent
  //   A5  Tabs
  //   A6  Activity Bar
  //   A7  Status Bar
  //   A8  Breadcrumb
  //   A9  Panels & Terminal
  //   A10 Notifications & Badges
  //   A11 List & Tree
  //   A12 Input / Form Controls
  //   A13 Settings Page
  //   A14 Diff Editor
  //   A15 Inline Hints & Decorations
  // ══════════════════════════════════════════════════════════════════════════
  uiColors: {
    // Backgrounds  — true black where eyes rest, near-black for structure
    'ms-bg-main':         '#000000', // editor canvas  → OLED pixels off
    'ms-bg-side':         '#0a0a0a', // sidebar        → near-black
    'ms-bg-activity':     '#111111', // activity bar   → slight depth
    'ms-activity-hover':  '#626262',
    'ms-tab-inactive-bg': '#0d0d0d',
    'ms-tab-active-bg':   '#000000', // active tab = editor background

    // Text
    'ms-text-main':   '#d4d4d4',
    'ms-text-side': '#ffffff',
    'ms-text-activity': '#ffefef',
    'ms-text-faded':  '#6e6e6e',
    'ms-text-bright': '#ffffff',

    // Borders  — very subtle on pure black
    'ms-border-light': '#1e1e1e',
    'ms-border-dark':  '#2d2d2d',
    'ms-menu-border':  '#252525',
    'ms-separator':    '#252525',

    // Interactive
    'ms-accent':        '#007acc',
    'ms-icon-hover-bg': '#1a1a1a',
    'ms-menu-hover-bg': '#0a2840',
    'ms-shadow':        'rgba(0, 0, 0, 0.7)',

    // Settings & Forms
    'ms-settings-bg':             '#000000',
    'ms-settings-category-color': '#6e6e6e',
    'ms-settings-title-color':    '#d4d4d4',
    'ms-settings-desc-color':     '#888888',
    'ms-settings-link-color':     '#3794ff',
    'ms-input-bg':                '#141414',
    'ms-input-fg':                '#d4d4d4',
    'ms-input-border':            '#2a2a2a',
    'ms-input-focus-border':      '#007fd4',
    'ms-code-bg':                 'rgba(255, 255, 255, 0.07)',
    'ms-code-fg':                 '#ce9178',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // § B  Monaco Editor Colors
  //
  // These are passed directly to monaco.editor.defineTheme() under `colors`.
  // They control Monaco-internal UI: scrollbars, minimap, suggest widget, etc.
  // Keys are the standard VS Code color token identifiers.
  // ══════════════════════════════════════════════════════════════════════════
  editorColors: {
    // Core editor canvas  — pure black
    'editor.background':                     '#000000',
    'editor.foreground':                     '#d4d4d4',

    // Selection
    'editor.selectionBackground':            '#1a3a5c',
    'editor.inactiveSelectionBackground':    '#1a2028',
    'editor.selectionHighlightBackground':   '#add6ff18',

    // Find matches
    'editor.findMatchBackground':            '#2f3f4f',
    'editor.findMatchHighlightBackground':   '#ea5c0044',
    'editor.findRangeHighlightBackground':   '#2a2a2a44',

    // Line highlight  — barely visible on pure black
    'editor.lineHighlightBackground':        '#0d0d0d',
    'editor.lineHighlightBorder':            '#0a0a0a',

    // Cursor & whitespace
    'editorCursor.foreground':               '#c8c8c8',
    'editorWhitespace.foreground':           '#1e1e1e',

    // Gutter (line numbers)
    'editorLineNumber.foreground':           '#4a4a4a',
    'editorLineNumber.activeForeground':     '#aaaaaa',

    // Indent guides
    'editorIndentGuide.background':          '#1a1a1a',
    'editorIndentGuide.activeBackground':    '#3a3a3a',

    // Ruler
    'editorRuler.foreground':                '#2a2a2a',

    // Bracket matching
    'editorBracketMatch.background':         '#0064001a',
    'editorBracketMatch.border':             '#555555',

    // Diagnostics squiggles
    'editorError.foreground':                '#f48771',
    'editorWarning.foreground':              '#cca700',
    'editorInfo.foreground':                 '#75beff',

    // Scrollbar
    'scrollbarSlider.background':            '#79797944',
    'scrollbarSlider.hoverBackground':       '#6464649e',
    'scrollbarSlider.activeBackground':      '#bfbfbf55',

    // Suggest widget (autocomplete popup)
    'editorSuggestWidget.background':        '#0a0a0a',
    'editorSuggestWidget.border':            '#252525',
    'editorSuggestWidget.foreground':        '#d4d4d4',
    'editorSuggestWidget.selectedBackground':'#0a2840',
    'editorSuggestWidget.highlightForeground':'#18a3ff',

    // Hover widget (type/doc popup)
    'editorHoverWidget.background':          '#0a0a0a',
    'editorHoverWidget.border':              '#252525',
    'editorHoverWidget.foreground':          '#d4d4d4',

    // Peek view (go-to-definition inline panel)
    'peekView.border':                       '#007acc',
    'peekViewEditor.background':             '#000d1a',
    'peekViewResult.background':             '#0a0a0a',
    'peekViewResult.selectionBackground':    '#0a2840',
    'peekViewResult.matchHighlightBackground':'#ea5c0044',
    'peekViewEditor.matchHighlightBackground':'#ff8f0077',

    // Minimap
    'minimap.background':                    '#000000',
    'minimap.selectionHighlight':            '#1a3a5c',
    'minimap.errorHighlight':                '#f48771',
    'minimap.warningHighlight':              '#cca700',
    'minimapSlider.background':              'rgba(100,100,100,0.15)',
    'minimapSlider.hoverBackground':         'rgba(100,100,100,0.28)',
    'minimapSlider.activeBackground':        'rgba(100,100,100,0.45)',

    // Diff editor
    'diffEditor.insertedTextBackground':     'rgba(40,93,64,0.28)',
    'diffEditor.removedTextBackground':      'rgba(139,46,46,0.28)',
    'diffEditor.insertedLineBackground':     'rgba(40,93,64,0.18)',
    'diffEditor.removedLineBackground':      'rgba(139,46,46,0.18)',
    'diffEditorGutter.insertedLineBackground':'rgba(40,93,64,0.38)',
    'diffEditorGutter.removedLineBackground':'rgba(139,46,46,0.38)',

    // Inlay hints
    'editorInlayHint.foreground':            '#565656',
    'editorInlayHint.background':            'rgba(80,80,80,0.14)',
    'editorInlayHint.typeForeground':        '#565656',
    'editorInlayHint.parameterForeground':   '#565656',

    // Parameter hints widget
    'editorHint.foreground':                 '#d4d4d4b3',

    // Bracket pair colorization
    'editorBracketHighlight.foreground1':    '#ffd700',
    'editorBracketHighlight.foreground2':    '#da70d6',
    'editorBracketHighlight.foreground3':    '#87ceeb',
    'editorBracketHighlight.unexpectedBracket.foreground': '#e06c75',

    // Sticky scroll (header that pins the current scope)
    'editorStickyScroll.background':         '#000000',
    'editorStickyScrollHover.background':    '#0d0d0d',

    // Code lens (reference counts, test results)
    'editorCodeLens.foreground':             '#565656',

    // Ghost text (inline AI / Copilot suggestions)
    'editorGhostText.foreground':            '#363636',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // § C  Monaco Syntax Token Colors
  //
  // These are passed to monaco.editor.defineTheme() under `rules`.
  // Each entry maps one or more TextMate scope selectors to a color/style.
  //
  // Why so many scopes?
  //   With only ~10 entries most language grammars fall back to plain text.
  //   The ~50 entries below ensure correct coloring for JS/TS, JSX/TSX,
  //   HTML, CSS/SCSS, JSON, Python, Regex, and any TextMate-based grammar.
  //
  // Token palette vs mscode-dark
  // ─────────────────────────────
  // Pure black background makes every color appear more saturated.
  // Brightness has been pulled down slightly on the brightest tokens so
  // they don't cause eye strain against #000000.
  // ══════════════════════════════════════════════════════════════════════════
  tokenColors: [

    // ── Comments ──────────────────────────────────────────────────────────
    {
      scope: ['comment', 'comment.line', 'comment.block'],
      settings: { foreground: '#5a8a5a', fontStyle: 'italic' },
    },
    {
      // JSDoc block comments  /** ... */
      scope: 'comment.block.documentation',
      settings: { foreground: '#5a8a5a', fontStyle: 'italic' },
    },

    // ── Storage / Declaration keywords ────────────────────────────────────
    {
      // var  let  const  function  class  async  static  public  private
      scope: ['storage.type', 'storage.modifier'],
      settings: { foreground: '#569cd6' },
    },
    {
      // Arrow function  =>
      scope: 'storage.type.function.arrow',
      settings: { foreground: '#569cd6' },
    },

    // ── Control-flow keywords ─────────────────────────────────────────────
    {
      // if  else  for  while  return  break  continue  switch  try  catch
      scope: [
        'keyword.control',
        'keyword.control.flow',
        'keyword.control.conditional',
        'keyword.control.loop',
        'keyword.control.switch',
        'keyword.control.trycatch',
      ],
      settings: { foreground: '#c586c0' },
    },
    {
      // import  export  from  as
      scope: ['keyword.control.import', 'keyword.control.export', 'keyword.control.from'],
      settings: { foreground: '#c586c0' },
    },

    // ── Other keywords ────────────────────────────────────────────────────
    {
      // new  delete  typeof  void  instanceof  in  of  await  yield
      scope: [
        'keyword',
        'keyword.other',
        'keyword.operator.new',
        'keyword.operator.delete',
        'keyword.operator.typeof',
        'keyword.operator.void',
        'keyword.operator.instanceof',
        'keyword.operator.in',
        'keyword.operator.of',
      ],
      settings: { foreground: '#569cd6' },
    },

    // ── Operators ─────────────────────────────────────────────────────────
    {
      // = == === + - * / % & | ^ ~ ? : ??  ?.  ...
      scope: [
        'keyword.operator',
        'keyword.operator.assignment',
        'keyword.operator.comparison',
        'keyword.operator.logical',
        'keyword.operator.arithmetic',
        'keyword.operator.bitwise',
        'keyword.operator.ternary',
        'keyword.operator.spread',
        'keyword.operator.optional',
        'keyword.operator.nullish',
      ],
      settings: { foreground: '#d4d4d4' },
    },

    // ── Strings ───────────────────────────────────────────────────────────
    {
      scope: [
        'string',
        'string.quoted.single',
        'string.quoted.double',
        'string.quoted.backtick',
        'string.other',
        'string.template',
      ],
      settings: { foreground: '#ce9178' },
    },
    {
      // Opening/closing quote punctuation  '  "  `
      scope: 'punctuation.definition.string',
      settings: { foreground: '#ce9178' },
    },

    // ── Template-literal expression  ${...} ───────────────────────────────
    {
      // The ${ and } delimiters inside a template literal
      scope: [
        'punctuation.definition.template-expression',
        'punctuation.section.embedded',
      ],
      settings: { foreground: '#569cd6' },
    },

    // ── Numbers ───────────────────────────────────────────────────────────
    {
      scope: [
        'constant.numeric',
        'constant.numeric.integer',
        'constant.numeric.float',
        'constant.numeric.hex',
        'constant.numeric.octal',
        'constant.numeric.binary',
      ],
      settings: { foreground: '#b5cea8' },
    },

    // ── Language constants ────────────────────────────────────────────────
    {
      // true  false  null  undefined  NaN  Infinity  None  True  False
      scope: [
        'constant.language',
        'constant.language.boolean',
        'constant.language.null',
        'constant.language.undefined',
        'constant.language.nan',
        'constant.language.infinity',
      ],
      settings: { foreground: '#569cd6' },
    },

    // ── Variables ─────────────────────────────────────────────────────────
    {
      scope: ['variable', 'variable.other', 'variable.other.readwrite'],
      settings: { foreground: '#9cdcfe' },
    },
    {
      // const-declared identifiers (some grammars emit this scope)
      scope: 'variable.other.constant',
      settings: { foreground: '#4fc1ff' },
    },
    {
      // Function / method parameters
      scope: 'variable.parameter',
      settings: { foreground: '#9cdcfe' },
    },
    {
      // this  self  super  — italic to distinguish from regular vars
      scope: ['variable.language.this', 'variable.language.self', 'variable.language.super'],
      settings: { foreground: '#569cd6', fontStyle: 'italic' },
    },

    // ── Object / member properties ────────────────────────────────────────
    {
      // obj.property  —  the part after the dot
      scope: [
        'variable.other.property',
        'variable.other.object.property',
        'support.variable.property',
        'meta.property-name',
        'entity.name.label',
      ],
      settings: { foreground: '#9cdcfe' },
    },

    // ── Function definitions ──────────────────────────────────────────────
    {
      // function foo() {}  —  the identifier "foo"
      scope: ['entity.name.function', 'meta.definition.method entity.name.function'],
      settings: { foreground: '#dcdcaa' },
    },
    {
      // Built-ins: console.log  Math.abs  parseInt  fetch  etc.
      scope: 'support.function',
      settings: { foreground: '#dcdcaa' },
    },
    {
      // Generic function calls that some grammars emit
      scope: 'meta.function-call.generic',
      settings: { foreground: '#dcdcaa' },
    },

    // ── Classes / Types / Interfaces ──────────────────────────────────────
    {
      // class Foo  —  the identifier "Foo"
      scope: ['entity.name.class', 'entity.name.type.class', 'support.class'],
      settings: { foreground: '#4ec9b0' },
    },
    {
      // TypeScript types: interface, enum, type alias, primitives
      scope: [
        'entity.name.type',
        'entity.name.type.interface',
        'entity.name.type.enum',
        'entity.name.type.alias',
        'support.type',
        'support.type.primitive',
      ],
      settings: { foreground: '#4ec9b0' },
    },
    {
      // TypeScript namespace / module
      scope: 'entity.name.namespace',
      settings: { foreground: '#4ec9b0' },
    },

    // ── Decorators ────────────────────────────────────────────────────────
    {
      // @Component  @Injectable  @Override  etc.
      scope: ['meta.decorator', 'punctuation.decorator', 'entity.name.function.decorator'],
      settings: { foreground: '#dcdcaa', fontStyle: 'italic' },
    },

    // ── HTML / JSX Tags ───────────────────────────────────────────────────
    {
      // <div>  <span>  <input>  — lowercase HTML tags
      scope: ['entity.name.tag', 'meta.tag.sgml'],
      settings: { foreground: '#4ec9b0' },
    },
    {
      // <MyComponent>  — PascalCase JSX components
      scope: 'support.class.component',
      settings: { foreground: '#4ec9b0' },
    },
    {
      // HTML/JSX attribute names  class=  onClick=
      scope: ['entity.other.attribute-name', 'meta.tag entity.other.attribute-name'],
      settings: { foreground: '#9cdcfe' },
    },
    {
      // Tag angle brackets  < > />
      scope: 'punctuation.definition.tag',
      settings: { foreground: '#666666' },
    },

    // ── Regular Expressions ───────────────────────────────────────────────
    {
      scope: ['string.regexp', 'constant.regexp'],
      settings: { foreground: '#d16969' },
    },
    {
      // Regex alternation and group punctuation  |  ( )
      scope: ['keyword.operator.or.regexp', 'punctuation.definition.group.regexp'],
      settings: { foreground: '#d16969' },
    },

    // ── Import / export wildcard ──────────────────────────────────────────
    {
      // The  *  in  import * as foo
      scope: 'constant.language.import-export-all',
      settings: { foreground: '#d4d4d4' },
    },

    // ── CSS / SCSS specifics ──────────────────────────────────────────────
    {
      // CSS property names: color  margin  display  etc.
      scope: ['support.type.property-name.css', 'entity.name.tag.css'],
      settings: { foreground: '#9cdcfe' },
    },
    {
      // CSS property values: solid  center  inherit
      scope: [
        'support.constant.property-value',
        'support.constant.color',
        'support.constant.font-name',
      ],
      settings: { foreground: '#ce9178' },
    },
    {
      // .className selectors
      scope: 'entity.other.attribute-name.class.css',
      settings: { foreground: '#d7ba7d' },
    },
    {
      // #id selectors
      scope: 'entity.other.attribute-name.id.css',
      settings: { foreground: '#d7ba7d' },
    },
    {
      // Pseudo-class selectors: :hover  :focus  :nth-child
      scope: 'entity.other.attribute-name.pseudo-class.css',
      settings: { foreground: '#d7ba7d' },
    },
    {
      // At-rules: @media  @keyframes  @import  @supports
      scope: 'keyword.control.at-rule.css',
      settings: { foreground: '#c586c0' },
    },

    // ── JSON ──────────────────────────────────────────────────────────────
    {
      // JSON object keys (quoted strings in key position)
      scope: 'support.type.property-name.json',
      settings: { foreground: '#9cdcfe' },
    },

    // ── Punctuation ───────────────────────────────────────────────────────
    {
      // Generic: ; , . ( ) [ ] { }
      scope: ['punctuation', 'punctuation.separator', 'punctuation.terminator'],
      settings: { foreground: '#d4d4d4' },
    },
    {
      // Comment-opening punctuation  //  /*  */
      scope: 'punctuation.definition.comment',
      settings: { foreground: '#5a8a5a' },
    },

    // ── Invalid / Deprecated ──────────────────────────────────────────────
    {
      // Syntax errors
      scope: 'invalid',
      settings: { foreground: '#f44747' },
    },
    {
      // Deprecated API calls — strike-through keeps them visible but marked
      scope: 'invalid.deprecated',
      settings: { foreground: '#d4d4d4', fontStyle: 'strikethrough' },
    },
  ],
};