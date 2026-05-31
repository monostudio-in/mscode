/**
 * cSymbols.ts — Full C/C++ Symbol Provider
 *
 * Supports:
 *  - Classes, Structs, Unions, Namespaces, Functions
 *  - Variables (Local & Global) and Arrays (e.g., int arr[10])
 *  - Constructors & Destructors
 *  - Operators, Typedefs, Macros
 */

import { SymbolSource, SymbolKind } from '../types';
import type { SymbolProvider, DocumentSymbol } from '../types';


const stripLineComment = (line: string) =>
  line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');

function countChar(line: string, ch: '{' | '}'): number {
  let count = 0;
  let inSingleStr = false;
  let inDoubleStr = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '\\') { i++; continue; }
    if (c === "'" && !inDoubleStr) { inSingleStr = !inSingleStr; continue; }
    if (c === '"' && !inSingleStr) { inDoubleStr = !inDoubleStr; continue; }
    if (inSingleStr || inDoubleStr) continue;
    if (c === ch) count++;
  }
  return count;
}

const KEYWORDS_TO_SKIP = new Set([
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
  'return', 'break', 'continue', 'goto', 'try', 'catch', 'throw',
  'new', 'delete', 'sizeof', 'typeof', 'decltype', 'alignof',
  'static_assert', 'nullptr', 'true', 'false', 'and', 'or', 'not',
]);

const RE = {
  DEFINE_FUNC  : /^\s*#\s*define\s+([A-Za-z_]\w*)\s*\(/,
  DEFINE_CONST : /^\s*#\s*define\s+([A-Za-z_]\w*)(?!\s*\()\s/,
  PRAGMA_REGION: /^\s*#\s*pragma\s+region(?:\s+(.+))?/i,
  PRAGMA_ENDREG: /^\s*#\s*pragma\s+endregion/i,
  NAMESPACE    : /^\s*namespace\s+([A-Za-z_][\w:]*)?\s*\{?/,
  TEMPLATE     : /^\s*template\s*</,
  CLASS        : /^\s*(?:template\s*<[^>]*>\s*)?(?:export\s+)?class\s+([A-Za-z_]\w*)(?:\s*:\s*(?:(?:public|protected|private|virtual)\s+[\w:<>, *&]+(?:,\s*)?)+)?(?:\s*\{|\s*$)/,
  STRUCT       : /^\s*(?:template\s*<[^>]*>\s*)?struct\s+([A-Za-z_]\w*)(?:\s*:\s*[\w:<>, *&]+)?(?:\s*\{|\s*$)/,
  UNION        : /^\s*union\s+([A-Za-z_]\w*)\s*(?:\{|$)/,
  ENUM_CLASS   : /^\s*enum\s+class\s+([A-Za-z_]\w*)(?:\s*:\s*[\w:]+)?\s*(?:\{|$)/,
  ENUM         : /^\s*enum\s+(?!class\b)([A-Za-z_]\w*)\s*(?:\{|$)/,
  TYPEDEF_SU   : /^\s*typedef\s+(?:struct|union)\s+([A-Za-z_]\w*)?\s*\{/,
  TYPEDEF_E    : /^\s*typedef\s+enum\s+([A-Za-z_]\w*)?\s*\{/,
  DESTRUCTOR   : /^\s*(?:virtual\s+)?~([A-Za-z_]\w*)\s*\(\s*\)\s*(?:noexcept\s*)?(?:override\s*)?(?:\{|$)/,
  CONSTRUCTOR  : /^\s*(?:explicit\s+)?([A-Z][A-Za-z_]\w*)\s*\(([^)]*)\)\s*(?:(?::\s*[\w:,\s<>()*&]+)?\s*)?(?:\{|$)/,
  OPERATOR     : /^\s*(?:[\w:<>*& \t]+?\s+)?operator\s*([\S]+)\s*\(/,
  FUNCTION     : /^\s*(?:(?:static|inline|virtual|explicit|constexpr|consteval|extern|friend)\s+)*(?:const\s+)?(?:[\w:<>*&, \t[\]]+?)\s+(\*{0,2}[A-Za-z_]\w*(?:::[A-Za-z_]\w*)*)\s*\(([^;{]*)\)\s*(?:const\s*)?(?:noexcept[^{;]*)?\s*(?:->\s*[\w:<>*& \t]+\s*)?(?:\{|$)/,
  ACCESS       : /^\s*(public|protected|private)\s*:/,
  VARIABLE     : /^\s*(?:(?:inline|static|extern|constexpr|const|volatile|struct|class|enum)\s+)*([A-Za-z_][\w:]*(?:<[^>]+>)?)(?:\s+|\s*[*&]+\s*)([A-Za-z_]\w*)\s*(\[[^\]]*\])?\s*(?:=|;)/,
};

interface ScopeEntry {
  symbol: DocumentSymbol;
  openAtDepth: number;
}

function makeRange(startLine: number, endLine = startLine, endCol = 1) {
  return { startLineNumber: startLine, startColumn: 1, endLineNumber: endLine, endColumn: endCol };
}

function addToHierarchy(sym: DocumentSymbol, scopeStack: ScopeEntry[], rootSymbols: DocumentSymbol[]) {
  if (scopeStack.length > 0) {
    const parent = scopeStack[scopeStack.length - 1].symbol;
    parent.children!.push(sym);
    sym.containerName = parent.name;
  } else {
    rootSymbols.push(sym);
  }
}

export const cSymbolProvider: SymbolProvider = {
  id: 'c-cpp-regex',
  source: SymbolSource.REGEX,
  priority: 20,

  provideSymbols: async (text: string, _languageId: string): Promise<DocumentSymbol[] | null> => {
    const rawLines = text.split('\n');
    const lines = rawLines.map(stripLineComment);

    const rootSymbols: DocumentSymbol[] = [];
    const scopeStack: ScopeEntry[] = [];
    let braceDepth = 0;
    let pendingSymbol: DocumentSymbol | null = null;
    let templatePrefix: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed) continue;

      const opens  = countChar(line, '{');
      const closes = countChar(line, '}');

      if (closes > 0) {
        const newDepth = braceDepth - closes;
        while (scopeStack.length > 0 && scopeStack[scopeStack.length - 1].openAtDepth > newDepth) {
          const entry = scopeStack.pop()!;
          entry.symbol.range = { ...entry.symbol.range, endLineNumber: i + 1, endColumn: line.length + 1 };
        }
        braceDepth = newDepth < 0 ? 0 : newDepth;
      }

      let newSymbol: DocumentSymbol | null = null;
      let shouldOpenScope = opens > 0 || !trimmed.endsWith(';');

      if (RE.DEFINE_FUNC.test(line)) {
        newSymbol = { name: line.match(RE.DEFINE_FUNC)![1], detail: '#define', kind: SymbolKind.Function, range: makeRange(i + 1), children: [] };
        shouldOpenScope = false;
      } else if (RE.DEFINE_CONST.test(line)) {
        newSymbol = { name: line.match(RE.DEFINE_CONST)![1], detail: '#define', kind: SymbolKind.Constant, range: makeRange(i + 1), children: [] };
        shouldOpenScope = false;
      } else if (RE.TEMPLATE.test(trimmed)) {
        templatePrefix = trimmed;
      } else if (RE.NAMESPACE.test(line)) {
        const m = line.match(RE.NAMESPACE)!;
        newSymbol = { name: m[1]?.trim() || '(anonymous)', detail: templatePrefix ? `template namespace` : 'namespace', kind: SymbolKind.Module, range: makeRange(i + 1), children: [] };
        templatePrefix = null;
      } else if (RE.CLASS.test(line)) {
        newSymbol = { name: line.match(RE.CLASS)![1], detail: templatePrefix ? `template class` : 'class', kind: SymbolKind.Class, range: makeRange(i + 1), children: [] };
        templatePrefix = null;
      } else if (RE.STRUCT.test(line)) {
        const m = line.match(RE.STRUCT)!;
        if (m[1]) { newSymbol = { name: m[1], detail: templatePrefix ? 'template struct' : 'struct', kind: SymbolKind.Struct, range: makeRange(i + 1), children: [] }; templatePrefix = null; }
      } else if (RE.UNION.test(line)) {
        newSymbol = { name: line.match(RE.UNION)![1], detail: 'union', kind: SymbolKind.Struct, range: makeRange(i + 1), children: [] };
      } else if (RE.ENUM_CLASS.test(line)) {
        newSymbol = { name: line.match(RE.ENUM_CLASS)![1], detail: 'enum class', kind: SymbolKind.Enum, range: makeRange(i + 1), children: [] };
      } else if (RE.ENUM.test(line)) {
        newSymbol = { name: line.match(RE.ENUM)![1], detail: 'enum', kind: SymbolKind.Enum, range: makeRange(i + 1), children: [] };
      } else if (RE.TYPEDEF_SU.test(line)) {
        newSymbol = { name: line.match(RE.TYPEDEF_SU)![1]?.trim() || `__typedef_${i + 1}`, detail: 'typedef', kind: SymbolKind.Struct, range: makeRange(i + 1), children: [] };
      } else if (RE.DESTRUCTOR.test(line)) {
        newSymbol = { name: `~${line.match(RE.DESTRUCTOR)![1]}`, detail: 'destructor', kind: SymbolKind.Constructor, range: makeRange(i + 1), children: [] };
      } else if (RE.OPERATOR.test(line)) {
        newSymbol = { name: `operator${line.match(RE.OPERATOR)![1]}`, detail: templatePrefix ? 'template operator' : 'operator', kind: SymbolKind.Operator, range: makeRange(i + 1), children: [] };
        templatePrefix = null;
      } else if (RE.FUNCTION.test(line)) {
        const m = line.match(RE.FUNCTION)!;
        const fname = m[1].trim();
        if (!KEYWORDS_TO_SKIP.has(fname)) {
          const parentName = scopeStack.length > 0 ? scopeStack[scopeStack.length - 1].symbol.name : null;
          const isConstructor = parentName && fname === parentName;
          newSymbol = { name: fname, detail: isConstructor ? 'constructor' : 'function', kind: isConstructor ? SymbolKind.Constructor : SymbolKind.Function, range: makeRange(i + 1), children: [] };
          templatePrefix = null;
        }
      } 
      else if (RE.VARIABLE.test(line)) {
        const m = line.match(RE.VARIABLE)!;
        const varType = m[1].trim();
        const varName = m[2].trim();
        const isArray = !!m[3];

        if (!KEYWORDS_TO_SKIP.has(varType) && !KEYWORDS_TO_SKIP.has(varName)) {
          newSymbol = { 
            name: varName, 
            detail: varType, 
            kind: isArray ? SymbolKind.Array : SymbolKind.Variable, 
            range: makeRange(i + 1), 
            children: [] 
          };
          shouldOpenScope = false; 
        }
      }

      if (RE.ACCESS.test(line) && scopeStack.length > 0) {
        scopeStack[scopeStack.length - 1].symbol.detail = line.match(RE.ACCESS)![1];
      }

      if (newSymbol) {
        addToHierarchy(newSymbol, scopeStack, rootSymbols);
        if (shouldOpenScope) {
          pendingSymbol = newSymbol;
        }
      }

      if (opens > 0) {
        braceDepth += opens;
        if (pendingSymbol) {
          scopeStack.push({ symbol: pendingSymbol, openAtDepth: braceDepth });
          pendingSymbol = null;
        }
      }
    }

    return rootSymbols.length > 0 ? rootSymbols : null;
  }
};