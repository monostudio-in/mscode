/**
 * jsSymbols.ts — JS/TS Symbol Provider
 *
 * Supports:
 *  - Classes, Functions, Arrow Functions, Variables
 *  - Class Methods (constructor, checkHealth, etc.) -> NEW!
 *  - Brace tracking for PERFECT endLineNumber (Fixes Sticky Scroll!) -> NEW!
 *  - Bypasses strings, template literals, and comments safely
 */

import type { SymbolProvider, DocumentSymbol } from '../types';
import { SymbolSource, SymbolKind } from '../types';

const KEYWORDS_TO_SKIP = new Set([
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 
  'return', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new'
]);

const RE = {
  CLASS: /^\s*(?:export\s+)?(?:default\s+)?class\s+([A-Za-z_$][\w$]*)/,
  FUNCTION: /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s*(?:\*)?\s+([A-Za-z_$][\w$]*)/,
  ARROW: /^\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?(?:(?:\([^)]*\))|[A-Za-z_$][\w$]*)\s*=>/,
  VARIABLE: /^\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(.*)/,
  METHOD: /^\s*(?:async\s+)?(?:get\s+|set\s+)?\*?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*(?::\s*[\w<>\[\]\s|&]+)?\s*\{/,
  OBJECT_BLOCK: /^\s*(?:'|")?([A-Za-z_$][\w$]*)(?:'|")?\s*:\s*\{/
};

export const jsSymbolProvider: SymbolProvider = {
  id: 'javascript-regex',
  source: SymbolSource.REGEX,
  priority: 20,

  provideSymbols: async (text: string, _languageId: string): Promise<DocumentSymbol[] | null> => {
    try {
      const rawLines = text.split('\n');
      const rootSymbols: DocumentSymbol[] = [];
      const scopeStack: { symbol: DocumentSymbol; openAtDepth: number }[] = [];

      let braceDepth = 0;
      let inBlockComment = false;
      let pendingSymbol: DocumentSymbol | null = null;

      for (let i = 0; i < rawLines.length; i++) {
        let line = rawLines[i];

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

        let cleanLine = line.replace(/\/\/.*$/, '');
        cleanLine = cleanLine.replace(/(["'`])(?:\\.|(?!\1)[^\\])*\1/g, '""').trim();

        if (!cleanLine) continue;

        const opens = (cleanLine.match(/\{/g) || []).length;
        const closes = (cleanLine.match(/\}/g) || []).length;

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

        if (RE.CLASS.test(cleanLine)) {
          newSymbol = { name: cleanLine.match(RE.CLASS)![1], detail: 'class', kind: SymbolKind.Class, range: { startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: line.length + 1 }, children: [] };
        } else if (RE.FUNCTION.test(cleanLine)) {
          newSymbol = { name: cleanLine.match(RE.FUNCTION)![1], detail: 'function', kind: SymbolKind.Function, range: { startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: line.length + 1 }, children: [] };
        } else if (RE.ARROW.test(cleanLine)) {
          newSymbol = { name: cleanLine.match(RE.ARROW)![1], detail: 'arrow function', kind: SymbolKind.Function, range: { startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: line.length + 1 }, children: [] };
        } else if (RE.METHOD.test(cleanLine)) {
          const methodName = cleanLine.match(RE.METHOD)![1];
          if (!KEYWORDS_TO_SKIP.has(methodName)) {
            const kind = methodName === 'constructor' ? SymbolKind.Constructor : SymbolKind.Method;
            newSymbol = { name: methodName, detail: kind === SymbolKind.Constructor ? 'constructor' : 'method', kind, range: { startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: line.length + 1 }, children: [] };
          }
        } else if (RE.VARIABLE.test(cleanLine)) {
          const m = cleanLine.match(RE.VARIABLE)!;
          const rhs = m[2].trim();
          let kind: SymbolKind = SymbolKind.Variable;
          let detail = 'variable';

          if (rhs.startsWith('[')) { kind = SymbolKind.Array; detail = 'array'; }
          else if (rhs.startsWith('{')) { kind = SymbolKind.Object; detail = 'object'; }

          newSymbol = { name: m[1], detail, kind, range: { startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: line.length + 1 }, children: [] };
          shouldOpenScope = false; 
        } else if (RE.OBJECT_BLOCK.test(cleanLine)) {
          newSymbol = { 
            name: cleanLine.match(RE.OBJECT_BLOCK)![1], 
            detail: 'object', 
            kind: SymbolKind.Namespace, 
            range: { startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: line.length + 1 }, 
            children: [] 
          };
        }

        if (newSymbol) {
          if (scopeStack.length > 0) {
            newSymbol.containerName = scopeStack[scopeStack.length - 1].symbol.name;
            scopeStack[scopeStack.length - 1].symbol.children!.push(newSymbol);
          } else {
            rootSymbols.push(newSymbol);
          }
          if (shouldOpenScope) pendingSymbol = newSymbol;
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
    } catch (e) {
      console.error("[JS Parser Failed]:", e);
      return null;
    }
  }
};