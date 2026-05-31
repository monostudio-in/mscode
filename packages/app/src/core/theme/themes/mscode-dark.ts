// src/core/theme/themes/mscode-dark.ts
//
// Why a TS file instead of theme.css?
// ────────────────────────────────────
// A static [data-theme='vs-dark'] block in CSS can only set values at load
// time.  This file runs at runtime, which means:
//   ✓ Extensions can override any token or UI color without touching CSS
//   ✓ User-saved themes (Supabase / JSON) can be deep-merged at startup
//   ✓ Monaco syntax colors and IDE shell colors come from the same source
//   ✓ TypeScript gives compile-time safety on every color key

import type { ThemeDefinition } from '../types';

export const mscodeDarkTheme: ThemeDefinition = {
  id:   'mscode-dark',
  name: 'MS Code Dark',
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
    // Backgrounds
    'ms-bg-main':         '#1e1e1e',
    'ms-bg-side':         '#252526',
    'ms-bg-activity':     '#333333',
    'ms-activity-hover':  '#444444',
    'ms-tab-inactive-bg': '#2d2d2d',
    'ms-tab-active-bg':   '#1e1e1e',

    // Text
    'ms-text-main':   '#cccccc',
    'ms-text-faded':  '#858585',
    'ms-text-bright': '#ffffff',

    // Borders
    'ms-border-light': '#393a42',
    'ms-border-dark':  '#595c64',
    'ms-menu-border':  '#454545',
    'ms-separator':    '#454545',

    // Interactive
    'ms-accent':        '#007acc',
    'ms-icon-hover-bg': '#333333',
    'ms-menu-hover-bg': '#04395e',
    'ms-shadow':        'rgba(0, 0, 0, 0.36)',

    // Settings & Forms
    'ms-settings-bg':             '#1e1e1e',
    'ms-settings-category-color': '#888888',
    'ms-settings-title-color':    '#cccccc',
    'ms-settings-desc-color':     '#999999',
    'ms-settings-link-color':     '#3794ff',
    'ms-input-bg':                '#3c3c3c',
    'ms-input-fg':                '#cccccc',
    'ms-input-border':            '#3c3c3c',
    'ms-input-focus-border':      '#007fd4',
    'ms-code-bg':                 'rgba(255, 255, 255, 0.1)',
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
    // Core editor canvas
    'editor.background':                     '#1e1e1e',
    'editor.foreground':                     '#cccccc',

    // Selection
    'editor.selectionBackground':            '#264f78',
    'editor.inactiveSelectionBackground':    '#3a3d41',
    'editor.selectionHighlightBackground':   '#add6ff26',

    // Find matches
    'editor.findMatchBackground':            '#515c6a',
    'editor.findMatchHighlightBackground':   '#ea5c0055',
    'editor.findRangeHighlightBackground':   '#3a3a3a50',

    // Line highlight
    'editor.lineHighlightBackground':        '#2a2d2e',
    'editor.lineHighlightBorder':            '#282828',

    // Cursor & whitespace
    'editorCursor.foreground':               '#aeafad',
    'editorWhitespace.foreground':           '#3b3b3b',

    // Gutter (line numbers)
    'editorLineNumber.foreground':           '#858585',
    'editorLineNumber.activeForeground':     '#c6c6c6',

    // Indent guides
    'editorIndentGuide.background':          '#404040',
    'editorIndentGuide.activeBackground':    '#707070',

    // Ruler
    'editorRuler.foreground':                '#5a5a5a',

    // Bracket matching
    'editorBracketMatch.background':         '#0064001a',
    'editorBracketMatch.border':             '#888888',

    // Diagnostics squiggles
    'editorError.foreground':                '#f48771',
    'editorWarning.foreground':              '#cca700',
    'editorInfo.foreground':                 '#75beff',

    // Scrollbar
    'scrollbarSlider.background':            '#79797966',
    'scrollbarSlider.hoverBackground':       '#646464b3',
    'scrollbarSlider.activeBackground':      '#bfbfbf66',

    // Suggest widget (autocomplete popup)
    'editorSuggestWidget.background':        '#252526',
    'editorSuggestWidget.border':            '#454545',
    'editorSuggestWidget.foreground':        '#cccccc',
    'editorSuggestWidget.selectedBackground':'#04395e',
    'editorSuggestWidget.highlightForeground':'#18a3ff',

    // Hover widget (type/doc popup)
    'editorHoverWidget.background':          '#252526',
    'editorHoverWidget.border':              '#454545',
    'editorHoverWidget.foreground':          '#cccccc',

    // Peek view (go-to-definition inline panel)
    'peekView.border':                       '#007acc',
    'peekViewEditor.background':             '#001f33',
    'peekViewResult.background':             '#252526',
    'peekViewResult.selectionBackground':    '#04395e',
    'peekViewResult.matchHighlightBackground':'#ea5c0055',
    'peekViewEditor.matchHighlightBackground':'#ff8f0099',

    // Minimap
    'minimap.background':                    '#1e1e1e',
    'minimap.selectionHighlight':            '#264f78',
    'minimap.errorHighlight':                '#f48771',
    'minimap.warningHighlight':              '#cca700',
    'minimapSlider.background':              'rgba(121,121,121,0.2)',
    'minimapSlider.hoverBackground':         'rgba(121,121,121,0.35)',
    'minimapSlider.activeBackground':        'rgba(121,121,121,0.5)',

    // Diff editor
    'diffEditor.insertedTextBackground':     'rgba(40,93,64,0.3)',
    'diffEditor.removedTextBackground':      'rgba(139,46,46,0.3)',
    'diffEditor.insertedLineBackground':     'rgba(40,93,64,0.2)',
    'diffEditor.removedLineBackground':      'rgba(139,46,46,0.2)',
    'diffEditorGutter.insertedLineBackground':'rgba(40,93,64,0.4)',
    'diffEditorGutter.removedLineBackground':'rgba(139,46,46,0.4)',

    // Inlay hints
    'editorInlayHint.foreground':            '#888888',
    'editorInlayHint.background':            'rgba(88,88,88,0.18)',
    'editorInlayHint.typeForeground':        '#888888',
    'editorInlayHint.parameterForeground':   '#888888',

    // Parameter hints widget
    'editorHint.foreground':                 '#eeeeeeb3',

    // Bracket pair colorization
    'editorBracketHighlight.foreground1':    '#ffd700',
    'editorBracketHighlight.foreground2':    '#da70d6',
    'editorBracketHighlight.foreground3':    '#87ceeb',
    'editorBracketHighlight.unexpectedBracket.foreground': '#e06c75',

    // Sticky scroll (header that pins the current scope)
    'editorStickyScroll.background':         '#1e1e1e',
    'editorStickyScrollHover.background':    '#2a2d2e',

    // Code lens (reference counts, test results)
    'editorCodeLens.foreground':             '#858585',

    // Ghost text (inline AI / Copilot suggestions)
    'editorGhostText.foreground':            '#606060',
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
  // ══════════════════════════════════════════════════════════════════════════
  tokenColors: [

    // ── Comments ──────────────────────────────────────────────────────────
    {
      scope: ['comment', 'comment.line', 'comment.block'],
      settings: { foreground: '#6A9955', fontStyle: 'italic' },
    },
    {
      // JSDoc block comments  /** ... */
      scope: 'comment.block.documentation',
      settings: { foreground: '#6A9955', fontStyle: 'italic' },
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
      settings: { foreground: '#808080' },
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
      settings: { foreground: '#6A9955' },
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