import * as monaco from 'monaco-editor';

/**
 * Maps Monaco's Integer SymbolKind to VS Code Standard Codicon Names.
 * These strings directly match the icons available in your IconRegistry.
 */
export const getSymbolIconName = (kind: monaco.languages.SymbolKind): string => {
  const Kinds = monaco.languages.SymbolKind;
  switch (kind) {
    case Kinds.File: return 'symbol-file';
    case Kinds.Module: return 'symbol-namespace';
    case Kinds.Namespace: return 'symbol-namespace';
    case Kinds.Package: return 'symbol-namespace';
    case Kinds.Class: return 'symbol-class';
    case Kinds.Method: return 'symbol-method';
    case Kinds.Property: return 'symbol-property';
    case Kinds.Field: return 'symbol-field';
    case Kinds.Constructor: return 'symbol-method';
    case Kinds.Enum: return 'symbol-enum';
    case Kinds.Interface: return 'symbol-interface';
    case Kinds.Function: return 'symbol-method';
    case Kinds.Variable: return 'symbol-variable';
    case Kinds.Constant: return 'symbol-constant';
    case Kinds.String: return 'symbol-string';
    case Kinds.Number: return 'symbol-numeric';
    case Kinds.Boolean: return 'symbol-boolean';
    case Kinds.Array: return 'symbol-array';
    case Kinds.Object: return 'symbol-misc';
    case Kinds.Key: return 'symbol-key';
    case Kinds.Null: return 'symbol-misc';
    case Kinds.EnumMember: return 'symbol-enum-member';
    case Kinds.Struct: return 'symbol-struct';
    case Kinds.Event: return 'symbol-event';
    case Kinds.Operator: return 'symbol-operator';
    case Kinds.TypeParameter: return 'symbol-type-parameter';
    default: return 'symbol-misc';
  }
};

export const getSymbolCategoryName = (kind: monaco.languages.SymbolKind): string => {
  const Kinds = monaco.languages.SymbolKind;
  switch (kind) {
    case Kinds.Class:
    case Kinds.Struct: return 'Classes & Structs';
    case Kinds.Method:
    case Kinds.Function:
    case Kinds.Constructor: return 'Functions & Methods';
    case Kinds.Variable: return 'Variables';
    case Kinds.Constant: return 'Constants';
    case Kinds.Interface: return 'Interfaces';
    default: return 'Others';
  }
};