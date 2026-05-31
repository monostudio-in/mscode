/**
 * javaSymbols.ts — Java Symbol Provider
 *
 * Supports:
 *  - Multi-line comments ( ... ) and String literal boundaries bypass
 *  - Modern Java: records, sealed/non-sealed classes, @interface
 *  - Annotation stacking (@Override, @Autowired etc attached to details)
 *  - Deep Generics mapping (Map<String, List<Integer>>)
 *  - Nested classes, interfaces, enums
 *  - Constructors vs Methods detection
 *  - Fields & Arrays
**/
 
import type { SymbolProvider, DocumentSymbol } from '../types';
import { SymbolSource, SymbolKind } from '../types';

// ---- Helpers ----

const KEYWORDS_TO_SKIP = new Set([
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
  'return', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'throws',
  'new', 'assert', 'synchronized'
]);

const stripStrings = (line: string) => line.replace(/"(?:\\.|[^"\\])*"/g, '""');

const countChar = (line: string, ch: '{' | '}'): number => {
  let count = 0;
  for (let i = 0; i < line.length; i++) if (line[i] === ch) count++;
  return count;
};

// ---- Patterns ----

const RE = {
  PACKAGE: /^\s*package\s+([\w.]+)\s*;/,
  ANNOTATION: /^\s*@([A-Za-z_$][\w$]*)(?:\([^)]*\))?/,
  CLASS_LIKE: /^\s*(?:(?:public|protected|private|abstract|static|final|strictfp|sealed|non-sealed)\s+)*(class|interface|enum|record|@interface)\s+([A-Za-z_$][\w$]*)/,
  CONSTRUCTOR: /^\s*(?:(?:public|protected|private)\s+)*([A-Z][A-Za-z_$][\w$]*)\s*\([^)]*\)\s*(?:throws\s+[\w$,\s]+)?\s*\{/,
  METHOD: /^\s*(?:(?:public|protected|private|abstract|static|final|synchronized|native|strictfp|<[^>]+>)\s+)*([\w$<>\[\]\?,\s]+)\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*(?:throws\s+[\w$,\s]+)?\s*(?:\{|;)/,
  FIELD: /^\s*(?:(?:public|protected|private|static|final|transient|volatile)\s+)*([\w$<>\[\]\?,\s]+)\s+([A-Za-z_$][\w$]*)\s*(?:=[^;]+)?;/
};

interface ScopeEntry {
  symbol: DocumentSymbol;
  openAtDepth: number;
}

const makeRange = (startLine: number, endLine = startLine, endCol = 1) => 
  ({ startLineNumber: startLine, startColumn: 1, endLineNumber: endLine, endColumn: endCol });

export const javaSymbolProvider: SymbolProvider = {
  id: 'java-regex',
  source: SymbolSource.REGEX,
  priority: 20,

  provideSymbols: async (text: string, _languageId: string): Promise<DocumentSymbol[] | null> => {
    const rawLines = text.split('\n');
    const rootSymbols: DocumentSymbol[] = [];

    const scopeStack: ScopeEntry[] = [];
    
    let braceDepth = 0;
    let pendingSymbol: DocumentSymbol | null = null;
    let pendingAnnotations: string[] = []; 
    let inBlockComment = false;

    for (let i = 0; i < rawLines.length; i++) {
      let line = rawLines[i];

      let cleanLine = '';
      if (inBlockComment) {
        const endIdx = line.indexOf('*/');
        if (endIdx !== -1) {
          inBlockComment = false;
          line = line.substring(endIdx + 2); 
        } else {
          continue; 
        }
      }

      const startIdx = line.indexOf('/*');
      if (startIdx !== -1) {
        const endIdx = line.indexOf('*/', startIdx + 2);
        if (endIdx !== -1) {
          line = line.substring(0, startIdx) + line.substring(endIdx + 2);
        } else {
          inBlockComment = true;
          line = line.substring(0, startIdx); 
        }
      }

      cleanLine = stripStrings(line.replace(/\/\/.*$/, '')).trim();
      if (!cleanLine) continue;

      const opens = countChar(cleanLine, '{');
      const closes = countChar(cleanLine, '}');

      if (closes > 0) {
        const newDepth = braceDepth - closes;
        while (scopeStack.length > 0 && scopeStack[scopeStack.length - 1].openAtDepth > newDepth) {
          const entry = scopeStack.pop()!;
          entry.symbol.range.endLineNumber = i + 1;
        }
        braceDepth = newDepth < 0 ? 0 : newDepth;
      }

      let newSymbol: DocumentSymbol | null = null;
      let shouldOpenScope = opens > 0;

      const annMatch = cleanLine.match(RE.ANNOTATION);
      if (annMatch) {
        pendingAnnotations.push(`@${annMatch[1]}`);
        continue; 
      }

      const annStr = pendingAnnotations.length > 0 ? pendingAnnotations.join(' ') + ' ' : '';

      if (RE.PACKAGE.test(cleanLine)) {
        newSymbol = {
          name: cleanLine.match(RE.PACKAGE)![1],
          detail: 'package',
          kind: SymbolKind.Module,
          range: makeRange(i + 1),
          children: []
        };
        shouldOpenScope = false;
      }
      else if (RE.CLASS_LIKE.test(cleanLine)) {
        const m = cleanLine.match(RE.CLASS_LIKE)!;
        const type = m[1]; 
        const name = m[2];

        // ভুল: let kind = SymbolKind.Class;
        let kind: SymbolKind = SymbolKind.Class;
        if (type === 'enum') kind = SymbolKind.Enum;
        else if (type === 'interface' || type === '@interface') kind = SymbolKind.Interface;
        else if (type === 'record') kind = SymbolKind.Struct;

        newSymbol = {
          name,
          detail: annStr + type,
          kind,
          range: makeRange(i + 1),
          children: []
        };
      }
      else if (RE.CONSTRUCTOR.test(cleanLine)) {
        const name = cleanLine.match(RE.CONSTRUCTOR)![1];
        const parentName = scopeStack.length > 0 ? scopeStack[scopeStack.length - 1].symbol.name : null;
        if (parentName && name === parentName) {
          newSymbol = {
            name,
            detail: annStr + 'constructor',
            kind: SymbolKind.Constructor,
            range: makeRange(i + 1),
            children: []
          };
        }
      }
      else if (!newSymbol && RE.METHOD.test(cleanLine)) {
        const m = cleanLine.match(RE.METHOD)!;
        const returnType = m[1].trim();
        const methodName = m[2].trim();

        if (!KEYWORDS_TO_SKIP.has(methodName) && !KEYWORDS_TO_SKIP.has(returnType)) {
          newSymbol = {
            name: methodName,
            detail: annStr + returnType, 
            kind: SymbolKind.Method,
            range: makeRange(i + 1),
            children: []
          };
        }
      }
      else if (!newSymbol && RE.FIELD.test(cleanLine)) {
        const m = cleanLine.match(RE.FIELD)!;
        const fieldType = m[1].trim();
        const fieldName = m[2].trim();

        if (!KEYWORDS_TO_SKIP.has(fieldName) && !KEYWORDS_TO_SKIP.has(fieldType)) {
          newSymbol = {
            name: fieldName,
            detail: annStr + fieldType, 
            kind: SymbolKind.Field,
            range: makeRange(i + 1),
            children: []
          };
          shouldOpenScope = false; 
        }
      }

      if (newSymbol) {
        if (scopeStack.length > 0) {
          const parent = scopeStack[scopeStack.length - 1].symbol;
          parent.children!.push(newSymbol);
          newSymbol.containerName = parent.name;
        } else {
          rootSymbols.push(newSymbol);
        }

        if (shouldOpenScope) pendingSymbol = newSymbol;
        pendingAnnotations = []; 
      }
      else if (cleanLine !== '{' && cleanLine !== '}') {
        pendingAnnotations = [];
      }

      if (opens > 0) {
        braceDepth += opens;
        if (pendingSymbol) {
          scopeStack.push({ symbol: pendingSymbol, openAtDepth: braceDepth });
          pendingSymbol = null;
        }
      }
    }

    for (const entry of scopeStack) {
      entry.symbol.range.endLineNumber = rawLines.length;
    }

    return rootSymbols.length > 0 ? rootSymbols : null;
  }
};