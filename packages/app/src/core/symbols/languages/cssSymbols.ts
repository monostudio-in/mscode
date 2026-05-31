/**
 * cssSymbols.ts — CSS Symbol Provider
 *
 * Supports:
 *  - Global Variables (:root)
 *  - At-rules (@media, @supports) -> Shown as Modules/Namespaces
 *  - CSS Animations (@keyframes) -> Shown as Functions
 *  - Keyframe Steps (from, to, 50%) -> Shown as Events
 *  - Modern CSS Nesting (& .child, &::after) -> Hierarchical Tree!
 *  - Complex Selectors (.ide-container > nav a.active)
 *  - Ignores properties correctly (color: red;)
 *  - Safely bypasses strings ("{") and comments ()
 */

import type { SymbolProvider, DocumentSymbol } from '../types';
import { SymbolSource, SymbolKind } from '../types';

export const cssSymbolProvider: SymbolProvider = {
  id: 'css-regex',
  source: SymbolSource.REGEX,
  priority: 20, 

  provideSymbols: async (text: string, _languageId: string): Promise<DocumentSymbol[] | null> => {
    try {
      const lines = text.split('\n');
      
      const rootSymbols: DocumentSymbol[] = [];
      const scopeStack: DocumentSymbol[] = [];

      let inComment = false;
      let inSingleQuote = false;
      let inDoubleQuote = false;
      
      let buffer = ''; 
      let startLine = -1;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          const nextChar = line[j + 1];

          if (!inSingleQuote && !inDoubleQuote) {
            if (inComment) {
              if (char === '*' && nextChar === '/') {
                inComment = false;
                j++; 
              }
              continue;
            } else if (char === '/' && nextChar === '*') {
              inComment = true;
              j++; 
              continue;
            }
          }

          if (!inComment) {
            if (inSingleQuote) {
              if (char === '\\') { j++; continue; }
              if (char === "'") inSingleQuote = false;
              continue;
            } else if (inDoubleQuote) {
              if (char === '\\') { j++; continue; }
              if (char === '"') inDoubleQuote = false;
              continue;
            } else if (char === "'") {
              inSingleQuote = true;
              continue;
            } else if (char === '"') {
              inDoubleQuote = true;
              continue;
            }
          }
          
          if (char === '{') {
            let selector = buffer.trim().replace(/\s+/g, ' '); 
            
            if (selector) {
              let kind: SymbolKind = SymbolKind.Class;
              let detail = 'selector';

              if (selector.startsWith('@media') || selector.startsWith('@supports')) {
                kind = SymbolKind.Module;
                detail = 'at-rule';
              } else if (selector.startsWith('@keyframes')) {
                kind = SymbolKind.Function;
                detail = 'animation';
              } else if (selector === 'from' || selector === 'to' || /^[0-9.]+%\s*$/.test(selector)) {
                kind = SymbolKind.Event;
                detail = 'keyframe step';
              } else if (selector === ':root') {
                kind = SymbolKind.Variable;
                detail = 'global variables';
              } else if (selector.startsWith('#')) {
                kind = SymbolKind.Field; 
              } else if (selector.startsWith('&')) {
                kind = SymbolKind.Property; 
                detail = 'nested rule';
              }

              const sym: DocumentSymbol = {
                name: selector,
                detail,
                kind,
                range: { 
                  startLineNumber: startLine !== -1 ? startLine : i + 1, 
                  startColumn: 1, 
                  endLineNumber: i + 1, 
                  endColumn: j + 2 
                },
                children: []
              };

              if (scopeStack.length > 0) {
                sym.containerName = scopeStack[scopeStack.length - 1].name;
                scopeStack[scopeStack.length - 1].children!.push(sym);
              } else {
                rootSymbols.push(sym);
              }
              
              scopeStack.push(sym);
            }
            
            buffer = ''; 
            startLine = -1;
            
          } else if (char === '}') {
            if (scopeStack.length > 0) {
              const closedSym = scopeStack.pop()!;
              closedSym.range.endLineNumber = i + 1;
              closedSym.range.endColumn = j + 2;
            }
            buffer = ''; 
            startLine = -1;

          } else if (char === ';') {
            buffer = ''; 
            startLine = -1;

          } else {
            if (buffer.length === 0 && char.trim() !== '') {
              startLine = i + 1; 
            }
            buffer += char;
          }
        }
        
        if (buffer.length > 0) buffer += ' ';
      }

      return rootSymbols.length > 0 ? rootSymbols : null;
      
    } catch (e) {
      console.error("[CSS Parser Failed]:", e);
      return null;
    }
  }
};