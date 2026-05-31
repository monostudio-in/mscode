/**
 * pythonSymbols.ts — Python Symbol Provider
 *
 * Supports:
 *  - Indentation-based scope detection
 *  - Classes, Functions (sync/async/lambda)
 *  - Variables, Arrays ([]), Objects/Dicts ({})
 *  - Class Properties (self.varName)
 *  - Constants and Module exports
 */

import { SymbolSource, SymbolKind } from '../types';
import type { SymbolProvider, DocumentSymbol } from '../types';

function getIndent(line: string): number {
  return line.match(/^(\s*)/)?.[1].length ?? 0;
}

function isBlankOrComment(line: string): boolean {
  const t = line.trim();
  return t === '' || t.startsWith('#');
}

function findBlockEnd(lines: string[], blockStartIdx: number, blockIndent: number): number {
  let lastContentLine = blockStartIdx + 1;
  for (let j = blockStartIdx + 1; j < lines.length; j++) {
    const l = lines[j];
    if (isBlankOrComment(l)) continue;
    const ind = getIndent(l);
    if (ind <= blockIndent) break;
    lastContentLine = j + 1;
  }
  return lastContentLine;
}

const RE_DECORATOR = /^\s*(@[\w.]+(?:\(.*\))?)/;
const RE_DEF = /^\s*(async\s+)?def\s+([A-Za-z_]\w*)\s*\(/;
const RE_CLASS = /^\s*class\s+([A-Za-z_]\w*)\s*(?:\(([^)]*)\))?\s*:/;
const RE_GENERIC_VAR = /^\s*(self\.)?([A-Za-z_]\w*)\s*(?::\s*[\w\[\], |.]+)?\s*=\s*(.*)/;
const NOTABLE_RHS = /\b(TypeVar|NewType|NamedTuple|TypedDict|dataclass|Protocol|Enum|IntEnum|Flag)\s*\(/;

const BUILTIN_DECORATOR_KINDS: Record<string, SymbolKind> = {
  property          : SymbolKind.Property,
  'property.setter' : SymbolKind.Property,
  'property.deleter': SymbolKind.Property,
  staticmethod      : SymbolKind.Function,
  classmethod       : SymbolKind.Function,
  abstractmethod    : SymbolKind.Function,
  overload          : SymbolKind.Function,
};

export const pythonSymbolProvider: SymbolProvider = {
  id: 'python-regex',
  source: SymbolSource.REGEX,
  priority: 20,

  provideSymbols: async (text: string, _languageId: string, _model?: any): Promise<DocumentSymbol[] | null> => {
    const lines = text.split('\n');
    const rootSymbols: DocumentSymbol[] = [];
    interface ScopeEntry { symbol: DocumentSymbol; indent: number; }
    const scopeStack: ScopeEntry[] = [];
    let pendingDecorators: string[] = [];
    let inSignature = false;

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const trimmed = raw.trim();

      if (inSignature) {
        if (trimmed.includes(')')) inSignature = false;
        continue;
      }

      if (isBlankOrComment(trimmed)) continue;
      const currentIndent = getIndent(raw);

      while (scopeStack.length > 0 && scopeStack[scopeStack.length - 1].indent >= currentIndent) {
        scopeStack.pop();
      }

      const decoratorMatch = raw.match(RE_DECORATOR);
      if (decoratorMatch) {
        pendingDecorators.push(decoratorMatch[1].trim());
        continue;
      }

      const classMatch = raw.match(RE_CLASS);
      if (classMatch) {
        const className = classMatch[1];
        const bases = classMatch[2]?.trim() || '';
        const endLine = findBlockEnd(lines, i, currentIndent);
        const decoratorStr = pendingDecorators.length ? pendingDecorators.join(', ') : undefined;

        const sym: DocumentSymbol = {
          name: className,
          detail: bases ? `class(${bases})${decoratorStr ? ' ' + decoratorStr : ''}` : `class${decoratorStr ? ' ' + decoratorStr : ''}`,
          kind: pendingDecorators.some(d => d.startsWith('@dataclass')) ? SymbolKind.Struct : SymbolKind.Class,
          range: { startLineNumber: i + 1, startColumn: 1, endLineNumber: endLine, endColumn: lines[endLine - 1]?.length + 1 || 1 },
          children: [],
        };

        pendingDecorators = [];
        if (scopeStack.length > 0) {
          const parent = scopeStack[scopeStack.length - 1].symbol;
          parent.children!.push(sym);
          sym.containerName = parent.name;
        } else rootSymbols.push(sym);
        scopeStack.push({ symbol: sym, indent: currentIndent });
        continue;
      }

      const defMatch = raw.match(RE_DEF);
      if (defMatch) {
        const isAsync = !!defMatch[1];
        const fnName  = defMatch[2];
        const openParens  = (raw.match(/\(/g) || []).length;
        const closeParens = (raw.match(/\)/g) || []).length;
        if (openParens > closeParens) inSignature = true;

        const endLine = findBlockEnd(lines, i, currentIndent);
        
        let kind: SymbolKind = SymbolKind.Function;
        
        const decoratorNames = pendingDecorators.map(d => d.replace(/^@/, '').replace(/\(.*\)$/, ''));
        for (const dn of decoratorNames) {
          if (BUILTIN_DECORATOR_KINDS[dn]) { kind = BUILTIN_DECORATOR_KINDS[dn]; break; }
        }

        const isInsideClass = scopeStack.length > 0 && (scopeStack[scopeStack.length - 1].symbol.kind === SymbolKind.Class || scopeStack[scopeStack.length - 1].symbol.kind === SymbolKind.Struct);
        if (isInsideClass) {
          if (fnName === '__init__') kind = SymbolKind.Constructor;
          else if (fnName.startsWith('__') && fnName.endsWith('__')) kind = SymbolKind.Operator;
          else if (kind === SymbolKind.Function) kind = SymbolKind.Method;
        }

        let detail = isAsync ? 'async def' : 'def';
        if (pendingDecorators.length) detail += '  ' + pendingDecorators.join(' ');

        const sym: DocumentSymbol = {
          name: fnName, detail, kind,
          range: { startLineNumber: i + 1, startColumn: 1, endLineNumber: endLine, endColumn: lines[endLine - 1]?.length + 1 || 1 },
          children: [],
        };

        pendingDecorators = [];
        if (scopeStack.length > 0) {
          const parent = scopeStack[scopeStack.length - 1].symbol;
          parent.children!.push(sym);
          sym.containerName = parent.name;
        } else rootSymbols.push(sym);
        scopeStack.push({ symbol: sym, indent: currentIndent });
        continue;
      }

      const varMatch = raw.match(RE_GENERIC_VAR);
      if (varMatch) {
        const isSelf = !!varMatch[1];
        const varName = varMatch[2];
        const rhs = varMatch[3].trim();

        let kind: SymbolKind = SymbolKind.Variable;
        let detail = 'variable';

        if (rhs.startsWith('[')) { kind = SymbolKind.Array; detail = 'list'; }
        else if (rhs.startsWith('{')) { kind = SymbolKind.Object; detail = 'dict'; }
        else if (isSelf) { kind = SymbolKind.Property; detail = 'property'; }
        else if (/^[A-Z][A-Z0-9_]+$/.test(varName)) { kind = SymbolKind.Constant; detail = 'constant'; }

        const notableMatch = rhs.match(NOTABLE_RHS);
        if (notableMatch) {
          const typeName = notableMatch[1];
          kind = ['NamedTuple', 'TypedDict', 'Enum'].includes(typeName) ? SymbolKind.Class : SymbolKind.TypeParameter;
          detail = typeName;
        }

        const sym: DocumentSymbol = {
          name: varName, detail, kind,
          range: { startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: raw.length + 1 },
        };

        if (scopeStack.length > 0) {
          const parent = scopeStack[scopeStack.length - 1].symbol;
          parent.children!.push(sym);
          sym.containerName = parent.name;
        } else {
          rootSymbols.push(sym);
        }
        pendingDecorators = [];
        continue;
      }

      pendingDecorators = [];
    }

    return rootSymbols.length > 0 ? rootSymbols : null;
  }
};