/**
 * rustSymbols.ts — Rust Symbol Provider
 *
 * Supports:
 *  - Nested Block Comments (/ inner /) support!
 *  - Raw strings (r#"..."#) and byte strings bypass.
 *  - Dynamic modifier extraction (pub(crate) async unsafe fn)
 *  - Attribute stacking (#[derive(...)], #![no_std]) 
 *  - Smart Impl blocks (impl<T> Trait for Struct) 
 *  - Traits, Macros, Enums, Structs, Mods, Constants 
 */ 

import type { SymbolProvider, DocumentSymbol } from '../types';
import { SymbolSource, SymbolKind } from '../types';

interface ScopeEntry {
  symbol: DocumentSymbol;
  openAtDepth: number;
}

const makeRange = (startLine: number, endLine = startLine, endCol = 1) => 
  ({ startLineNumber: startLine, startColumn: 1, endLineNumber: endLine, endColumn: endCol });

export const rustSymbolProvider: SymbolProvider = {
  id: 'rust-lexer',
  source: SymbolSource.REGEX,
  priority: 20, 

  provideSymbols: async (text: string, _languageId: string): Promise<DocumentSymbol[] | null> => {
    try {
      const rawLines = text.split('\n');
      const rootSymbols: DocumentSymbol[] = [];
      const scopeStack: ScopeEntry[] = [];
      
      let braceDepth = 0;
      let pendingSymbol: DocumentSymbol | null = null;
      let pendingAttributes: string[] = [];
      let commentDepth = 0; 

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        let cleanLine = '';
        let inString = false;
        let inChar = false;
        let inRawString = false;

        if (commentDepth === 0 && /^\s*#\!?(?:\[.*\])/.test(line)) {
          pendingAttributes.push(line.trim());
          continue;
        }

        for (let j = 0; j < line.length; j++) {
          const c = line[j];
          const next = line[j + 1];

          if (!inString && !inRawString && !inChar) {
            if (c === '/' && next === '*') { commentDepth++; j++; continue; }
            if (c === '*' && next === '/') { if (commentDepth > 0) commentDepth--; j++; continue; }
            if (commentDepth > 0) continue;
            
            if (c === '/' && next === '/') break; 

            if (c === 'r' && next === '#') { inRawString = true; continue; }
            if (c === '"') { inString = true; continue; }
            if (c === "'") { inChar = true; continue; }
            
            cleanLine += c; 
          } else {
            if ((inString || inChar) && c === '\\') { j++; continue; }
            if (inString && c === '"') { inString = false; continue; }
            if (inChar && c === "'") { inChar = false; continue; }
            if (inRawString && c === '"' && next === '#') { inRawString = false; j++; continue; }
          }
        }

        let opens = 0;
        let closes = 0;
        for (const char of cleanLine) {
          if (char === '{') opens++;
          else if (char === '}') closes++;
        }

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
        const attrPrefix = pendingAttributes.length > 0 ? pendingAttributes.join(' ') + ' ' : '';

        const processSymbol = (_keyword: string, name: string, kind: SymbolKind) => {
          const prefixMatch = cleanLine.substring(0, cleanLine.indexOf(name)).trim();
          const detail = (attrPrefix + prefixMatch).replace(/\s+/g, ' ').trim();
          newSymbol = { name, detail, kind, range: makeRange(i + 1), children: [] };
        };

        const modMatch = cleanLine.match(/\bmod\s+([A-Za-z_]\w*)/);
        const structMatch = cleanLine.match(/\bstruct\s+([A-Za-z_]\w*)/);
        const enumMatch = cleanLine.match(/\benum\s+([A-Za-z_]\w*)/);
        const traitMatch = cleanLine.match(/\btrait\s+([A-Za-z_]\w*)/);
        const fnMatch = cleanLine.match(/\bfn\s+([A-Za-z_]\w*)/);
        const macroMatch = cleanLine.match(/\bmacro_rules!\s+([A-Za-z_]\w*)/);
        const typeMatch = cleanLine.match(/\btype\s+([A-Za-z_]\w*)/);
        const constMatch = cleanLine.match(/\b(?:const|static)\s+(?:mut\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*:/);
        const implMatch = cleanLine.match(/\bimpl\b(.*)$/);

        if (modMatch) processSymbol('mod', modMatch[1], SymbolKind.Namespace);
        else if (structMatch) processSymbol('struct', structMatch[1], SymbolKind.Struct);
        else if (enumMatch) processSymbol('enum', enumMatch[1], SymbolKind.Enum);
        else if (traitMatch) processSymbol('trait', traitMatch[1], SymbolKind.Interface);
        else if (fnMatch) processSymbol('fn', fnMatch[1], SymbolKind.Function);
        else if (macroMatch) processSymbol('macro_rules!', macroMatch[1], SymbolKind.Function);
        else if (typeMatch) processSymbol('type', typeMatch[1], SymbolKind.TypeParameter);
        else if (constMatch) {
          processSymbol('const', constMatch[1], SymbolKind.Constant);
          shouldOpenScope = false; 
        }
        else if (implMatch) {
          let implName = implMatch[1].split('{')[0].split(';')[0].trim();
          const detail = (attrPrefix + 'impl').trim();
          newSymbol = { name: implName || '(anonymous impl)', detail, kind: SymbolKind.Class, range: makeRange(i + 1), children: [] };
        }

        if (newSymbol) {
          if (scopeStack.length > 0) {
            newSymbol.containerName = scopeStack[scopeStack.length - 1].symbol.name;
            scopeStack[scopeStack.length - 1].symbol.children!.push(newSymbol);
          } else {
            rootSymbols.push(newSymbol);
          }

          if (shouldOpenScope) pendingSymbol = newSymbol;
          pendingAttributes = []; 
        } else if (cleanLine.trim() !== '' && cleanLine !== '{' && cleanLine !== '}') {
          pendingAttributes = [];
        }

        if (opens > 0) {
          braceDepth += opens;
          if (pendingSymbol) {
            scopeStack.push({ symbol: pendingSymbol, openAtDepth: braceDepth });
            pendingSymbol = null;
          }
        }
      }

      for (const entry of scopeStack) entry.symbol.range.endLineNumber = rawLines.length;

      return rootSymbols.length > 0 ? rootSymbols : null;
      
    } catch (e) {
      console.error("[Rust Parser Failed]:", e);
      return null;
    }
  }
};