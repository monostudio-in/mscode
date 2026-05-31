// src/core/symbols/types.ts

/**
 * Standard structured enumerations for syntax elements.
 * Aligns perfectly with Monaco Editor and Language Server Protocol type schemas,
 * allowing lightweight token comparisons without runtime baggage.
 */
export const SymbolKind = {
  File: 0,
  Module: 1,
  Namespace: 2,
  Package: 3,
  Class: 4,
  Method: 5,
  Property: 6,
  Field: 7,
  Constructor: 8,
  Enum: 9,
  Interface: 10,
  Function: 11,
  Variable: 12,
  Constant: 13,
  String: 14,
  Number: 15,
  Boolean: 16,
  Array: 17,
  Object: 18,
  Key: 19,
  Null: 20,
  EnumMember: 21,
  Struct: 22,
  Event: 23,
  Operator: 24,
  TypeParameter: 25
} as const;

export type SymbolKind = typeof SymbolKind[keyof typeof SymbolKind];

/**
 * Operational origin markers designating the dynamic tracking engine 
 * responsible for mining document semantic tokens.
 */
export const SymbolSource = {
  LSP: 'LSP',
  MONACO: 'Monaco',
  EXTENSION: 'Extension',
  REGEX: 'Mono'
} as const;

export type SymbolSource = typeof SymbolSource[keyof typeof SymbolSource];

/**
 * Central blueprint describing structural program tokens, parent ownership tracking keys, 
 * and absolute coordinates within open document viewports.
 */
export interface DocumentSymbol {
  /** The explicit structural title label (e.g., class name or variable indicator) */
  name: string;
  /** Supplemental metadata typing declarations or target structural parameter specs */
  detail: string;
  /** Categorized structural node identification flag */
  kind: SymbolKind; 
  /** Comprehensive bounding text range tracking starting layouts right through to closing bracket lines */
  range: any; 
  /** Highlighting scope focus target bounding box coordinates */
  selectionRange?: any;
  /** Hierarchical container sorting children matching structural scopes nested inside this element */
  children?: DocumentSymbol[];
  /** Reference identity tracking the containing structural scope parent element */
  containerName?: string;
  /** Telemetry tag classifying which extraction provider built this node */
  source?: SymbolSource;
}

/**
 * Functional lifecycle strategy layout interface.
 * Implemented across global parsers, explicit regular expressions, and native editor bridge drivers 
 * to stream uniform data models into structural sidebars.
 */
export interface SymbolProvider {
  /** Distinct identifier trace key matching registration blocks uniquely */
  id: string;
  /** System identifier marking core parser engine sources */
  source: SymbolSource;
  /** Absolute weight allocation governing priority ranking assignments over secondary fallbacks */
  priority: number;
  /**
   * Evaluates text structures asynchronously to generate valid application symbol charts.
   * Accepts text strings, context parameters, and deep model pointers to preserve multi-threaded safety vectors.
   * 
   * @param text Raw textual data buffer representation.
   * @param languageId System identifier key mapping compilation profiles.
   * @param model Secondary contextual data structures.
   */
  provideSymbols: (text: string, languageId: string, model?: any) => Promise<DocumentSymbol[] | null>;
}
