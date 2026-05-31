// src/core/theme/themes/mscode-light.ts
//
// Why a TS file instead of theme.css?
// ────────────────────────────────────
// A static [data-theme='light'] block in CSS can only set values at load
// time.  This file runs at runtime, which means:
//   ✓ Extensions can override any token or UI color without touching CSS
//   ✓ User-saved themes (Supabase / JSON) can be deep-merged at startup
//   ✓ Monaco syntax colors and IDE shell colors come from the same source
//   ✓ TypeScript gives compile-time safety on every color key

import type { ThemeDefinition } from '../types';

export const mscodeLightTheme: ThemeDefinition = {
  id:   'mscode-light',
  name: 'MS Code Light',
  type: 'light',

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
    'ms-bg-main':         '#ffffff',
    'ms-bg-side':         '#f3f3f3',
    'ms-bg-activity':     '#2c2c2c', // activity bar 
    'ms-activity-hover':  '#9e9e9e',
    'ms-tab-inactive-bg': '#ececec',
    'ms-tab-active-bg':   '#ffffff',

    // Text
    'ms-text-main':   '#333333',
    'ms-text-faded':  '#717171',
    'ms-text-bright': '#000000',

    // Borders
    'ms-border-light': '#e4e4e4',
    'ms-border-dark':  '#c8c8c8',
    'ms-menu-border':  '#d4d4d4',
    'ms-separator':    '#d4d4d4',

    // Interactive
    'ms-accent':        '#007acc',
    'ms-icon-hover-bg': '#e8e8e8',
    'ms-menu-hover-bg': '#d6ebff',
    'ms-shadow':        'rgba(0, 0, 0, 0.16)',

    // Settings & Forms
    'ms-settings-bg':             '#ffffff',
    'ms-settings-category-color': '#717171',
    'ms-settings-title-color':    '#333333',
    'ms-settings-desc-color':     '#717171',
    'ms-settings-link-color':     '#006ab1',
    'ms-input-bg':                '#ffffff',
    'ms-input-fg':                '#333333',
    'ms-input-border':            '#cecece',
    'ms-input-focus-border':      '#007fd4',
    'ms-code-bg':                 'rgba(0, 0, 0, 0.05)',
    'ms-code-fg':                 '#a31515',
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
    'editor.background':                     '#ffffff',
    'editor.foreground':                     '#000000',

    // Selection
    'editor.selectionBackground':            '#add6ff',
    'editor.inactiveSelectionBackground':    '#e5ebf1',
    'editor.selectionHighlightBackground':   '#add6ff80',

    // Find matches
    'editor.findMatchBackground':            '#a8ac94',
    'editor.findMatchHighlightBackground':   '#ea5c0055',
    'editor.findRangeHighlightBackground':   '#b4b4b430',

    // Line highlight
    'editor.lineHighlightBackground':        '#f0f0f0',
    'editor.lineHighlightBorder':            '#eeeeee',

    // Cursor & whitespace
    'editorCursor.foreground':               '#000000',
    'editorWhitespace.foreground':           '#d3d3d3',

    // Gutter (line numbers)
    'editorLineNumber.foreground':           '#999999',
    'editorLineNumber.activeForeground':     '#333333',

    // Indent guides
    'editorIndentGuide.background':          '#d3d3d3',
    'editorIndentGuide.activeBackground':    '#939393',

    // Ruler
    'editorRuler.foreground':                '#d3d3d3',

    // Bracket matching
    'editorBracketMatch.background':         '#0064001a',
    'editorBracketMatch.border':             '#b9b9b9',

    // Diagnostics squiggles
    'editorError.foreground':                '#e51400',
    'editorWarning.foreground':              '#bf8803',
    'editorInfo.foreground':                 '#1a85ff',

    // Scrollbar
    'scrollbarSlider.background':            '#64646466',
    'scrollbarSlider.hoverBackground':       '#646464b3',
    'scrollbarSlider.activeBackground':      '#00000066',

    // Suggest widget (autocomplete popup)
    'editorSuggestWidget.background':        '#f8f8f8',
    'editorSuggestWidget.border':            '#c8c8c8',
    'editorSuggestWidget.foreground':        '#000000',
    'editorSuggestWidget.selectedBackground':'#d6ebff',
    'editorSuggestWidget.highlightForeground':'#0066bf',

    // Hover widget (type/doc popup)
    'editorHoverWidget.background':          '#f8f8f8',
    'editorHoverWidget.border':              '#c8c8c8',
    'editorHoverWidget.foreground':          '#000000',

    // Peek view (go-to-definition inline panel)
    'peekView.border':                       '#007acc',
    'peekViewEditor.background':             '#f2f8fc',
    'peekViewResult.background':             '#f3f3f3',
    'peekViewResult.selectionBackground':    '#d6ebff',
    'peekViewResult.matchHighlightBackground':'#ea5c0055',
    'peekViewEditor.matchHighlightBackground':'#ff8f0055',

    // Minimap
    'minimap.background':                    '#ffffff',
    'minimap.selectionHighlight':            '#add6ff',
    'minimap.errorHighlight':                '#e51400',
    'minimap.warningHighlight':              '#bf8803',
    'minimapSlider.background':              'rgba(100,100,100,0.2)',
    'minimapSlider.hoverBackground':         'rgba(100,100,100,0.35)',
    'minimapSlider.activeBackground':        'rgba(100,100,100,0.5)',

    // Diff editor
    'diffEditor.insertedTextBackground':     'rgba(156,204,44,0.25)',
    'diffEditor.removedTextBackground':      'rgba(255,0,0,0.2)',
    'diffEditor.insertedLineBackground':     'rgba(156,204,44,0.15)',
    'diffEditor.removedLineBackground':      'rgba(255,0,0,0.12)',
    'diffEditorGutter.insertedLineBackground':'rgba(156,204,44,0.35)',
    'diffEditorGutter.removedLineBackground':'rgba(255,0,0,0.3)',

    // Inlay hints
    'editorInlayHint.foreground':            '#6f6f6f',
    'editorInlayHint.background':            'rgba(0,0,0,0.07)',
    'editorInlayHint.typeForeground':        '#6f6f6f',
    'editorInlayHint.parameterForeground':   '#6f6f6f',

    // Parameter hints widget
    'editorHint.foreground':                 '#333333b3',

    // Bracket pair colorization
    'editorBracketHighlight.foreground1':    '#0431fa',
    'editorBracketHighlight.foreground2':    '#319331',
    'editorBracketHighlight.foreground3':    '#7b3814',
    'editorBracketHighlight.unexpectedBracket.foreground': '#ff1212',

    // Sticky scroll (header that pins the current scope)
    'editorStickyScroll.background':         '#ffffff',
    'editorStickyScrollHover.background':    '#f0f0f0',

    // Code lens (reference counts, test results)
    'editorCodeLens.foreground':             '#999999',

    // Ghost text (inline AI / Copilot suggestions)
    'editorGhostText.foreground':            '#b0b0b0',
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
      settings: { foreground: '#008000', fontStyle: 'italic' },
    },
    {
      // JSDoc block comments  /** ... */
      scope: 'comment.block.documentation',
      settings: { foreground: '#008000', fontStyle: 'italic' },
    },

    // ── Storage / Declaration keywords ────────────────────────────────────
    {
      // var  let  const  function  class  async  static  public  private
      scope: ['storage.type', 'storage.modifier'],
      settings: { foreground: '#0000ff' },
    },
    {
      // Arrow function  =>
      scope: 'storage.type.function.arrow',
      settings: { foreground: '#0000ff' },
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
      settings: { foreground: '#af00db' },
    },
    {
      // import  export  from  as
      scope: ['keyword.control.import', 'keyword.control.export', 'keyword.control.from'],
      settings: { foreground: '#af00db' },
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
      settings: { foreground: '#0000ff' },
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
      settings: { foreground: '#000000' },
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
      settings: { foreground: '#a31515' },
    },
    {
      // Opening/closing quote punctuation  '  "  `
      scope: 'punctuation.definition.string',
      settings: { foreground: '#a31515' },
    },

    // ── Template-literal expression  ${...} ───────────────────────────────
    {
      // The ${ and } delimiters inside a template literal
      scope: [
        'punctuation.definition.template-expression',
        'punctuation.section.embedded',
      ],
      settings: { foreground: '#0000ff' },
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
      settings: { foreground: '#098658' },
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
      settings: { foreground: '#0000ff' },
    },

    // ── Variables ─────────────────────────────────────────────────────────
    {
      scope: ['variable', 'variable.other', 'variable.other.readwrite'],
      settings: { foreground: '#001080' },
    },
    {
      // const-declared identifiers (some grammars emit this scope)
      scope: 'variable.other.constant',
      settings: { foreground: '#0070c1' },
    },
    {
      // Function / method parameters
      scope: 'variable.parameter',
      settings: { foreground: '#001080' },
    },
    {
      // this  self  super  — italic to distinguish from regular vars
      scope: ['variable.language.this', 'variable.language.self', 'variable.language.super'],
      settings: { foreground: '#0000ff', fontStyle: 'italic' },
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
      settings: { foreground: '#001080' },
    },

    // ── Function definitions ──────────────────────────────────────────────
    {
      // function foo() {}  —  the identifier "foo"
      scope: ['entity.name.function', 'meta.definition.method entity.name.function'],
      settings: { foreground: '#795e26' },
    },
    {
      // Built-ins: console.log  Math.abs  parseInt  fetch  etc.
      scope: 'support.function',
      settings: { foreground: '#795e26' },
    },
    {
      // Generic function calls that some grammars emit
      scope: 'meta.function-call.generic',
      settings: { foreground: '#795e26' },
    },

    // ── Classes / Types / Interfaces ──────────────────────────────────────
    {
      // class Foo  —  the identifier "Foo"
      scope: ['entity.name.class', 'entity.name.type.class', 'support.class'],
      settings: { foreground: '#267f99' },
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
      settings: { foreground: '#267f99' },
    },
    {
      // TypeScript namespace / module
      scope: 'entity.name.namespace',
      settings: { foreground: '#267f99' },
    },

    // ── Decorators ────────────────────────────────────────────────────────
    {
      // @Component  @Injectable  @Override  etc.
      scope: ['meta.decorator', 'punctuation.decorator', 'entity.name.function.decorator'],
      settings: { foreground: '#795e26', fontStyle: 'italic' },
    },

    // ── HTML / JSX Tags ───────────────────────────────────────────────────
    {
      // <div>  <span>  <input>  — lowercase HTML tags
      scope: ['entity.name.tag', 'meta.tag.sgml'],
      settings: { foreground: '#800000' },
    },
    {
      // <MyComponent>  — PascalCase JSX components
      scope: 'support.class.component',
      settings: { foreground: '#267f99' },
    },
    {
      // HTML/JSX attribute names  class=  onClick=
      scope: ['entity.other.attribute-name', 'meta.tag entity.other.attribute-name'],
      settings: { foreground: '#e50000' },
    },
    {
      // Tag angle brackets  < > />
      scope: 'punctuation.definition.tag',
      settings: { foreground: '#800000' },
    },

    // ── Regular Expressions ───────────────────────────────────────────────
    {
      scope: ['string.regexp', 'constant.regexp'],
      settings: { foreground: '#811f3f' },
    },
    {
      // Regex alternation and group punctuation  |  ( )
      scope: ['keyword.operator.or.regexp', 'punctuation.definition.group.regexp'],
      settings: { foreground: '#811f3f' },
    },

    // ── Import / export wildcard ──────────────────────────────────────────
    {
      // The  *  in  import * as foo
      scope: 'constant.language.import-export-all',
      settings: { foreground: '#000000' },
    },

    // ── CSS / SCSS specifics ──────────────────────────────────────────────
    {
      // CSS property names: color  margin  display  etc.
      scope: ['support.type.property-name.css', 'entity.name.tag.css'],
      settings: { foreground: '#e50000' },
    },
    {
      // CSS property values: solid  center  inherit
      scope: [
        'support.constant.property-value',
        'support.constant.color',
        'support.constant.font-name',
      ],
      settings: { foreground: '#0451a5' },
    },
    {
      // .className selectors
      scope: 'entity.other.attribute-name.class.css',
      settings: { foreground: '#800000' },
    },
    {
      // #id selectors
      scope: 'entity.other.attribute-name.id.css',
      settings: { foreground: '#800000' },
    },
    {
      // Pseudo-class selectors: :hover  :focus  :nth-child
      scope: 'entity.other.attribute-name.pseudo-class.css',
      settings: { foreground: '#800000' },
    },
    {
      // At-rules: @media  @keyframes  @import  @supports
      scope: 'keyword.control.at-rule.css',
      settings: { foreground: '#af00db' },
    },

    // ── JSON ──────────────────────────────────────────────────────────────
    {
      // JSON object keys (quoted strings in key position)
      scope: 'support.type.property-name.json',
      settings: { foreground: '#0451a5' },
    },

    // ── Punctuation ───────────────────────────────────────────────────────
    {
      // Generic: ; , . ( ) [ ] { }
      scope: ['punctuation', 'punctuation.separator', 'punctuation.terminator'],
      settings: { foreground: '#000000' },
    },
    {
      // Comment-opening punctuation  //  /*  */
      scope: 'punctuation.definition.comment',
      settings: { foreground: '#008000' },
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
      settings: { foreground: '#000000', fontStyle: 'strikethrough' },
    },
  ],
};