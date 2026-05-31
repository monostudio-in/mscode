/**
* markdownSymbols.ts — Markdown Symbol Composer 
*
* Supports:
*  - Header Hierarchy (# H1, ## H2, ### H3)
*  - Fenced Code Blocks (```javascript, ```python, etc.)
*  - DEEP PARSING: Actually parses the code INSIDE the Markdown code blocks
*    using our existing ultimate language providers!
*/

import { SymbolSource, SymbolKind } from '../types';
import type { SymbolProvider, DocumentSymbol } from '../types';

import { jsSymbolProvider } from './jsSymbols';
import { cssSymbolProvider } from './cssSymbols';
import { pythonSymbolProvider } from './pythonSymbols';
import { rustSymbolProvider } from './rustSymbols';
import { cSymbolProvider } from './cSymbols';
import { javaSymbolProvider } from './javaSymbols';
import { htmlSymbolProvider } from './htmlSymbols';

interface ScopeEntry {
  symbol: DocumentSymbol;
  level: number;
}

const shiftLineNumbers = (symbols: DocumentSymbol[], offsetLine: number) => {
  for (const sym of symbols) {
    sym.range.startLineNumber += offsetLine;
    sym.range.endLineNumber += offsetLine;
    if (sym.children) shiftLineNumbers(sym.children, offsetLine);
  }
};

export const markdownSymbolProvider: SymbolProvider = {
  id: 'markdown-composer',
  source: SymbolSource.REGEX,
  priority: 20,

  provideSymbols: async (text: string, _languageId: string): Promise<DocumentSymbol[] | null> => {
    try {
      const lines = text.split('\n');
      const rootSymbols: DocumentSymbol[] = [];
      const scopeStack: ScopeEntry[] = [];

      let inCodeBlock = false;
      let codeBlockLang = '';
      let codeBlockStartLine = -1;
      let codeBlockText = '';
      let codeBlockNode: DocumentSymbol | null = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (trimmed.startsWith('```')) {
          if (!inCodeBlock) {
            inCodeBlock = true;
            codeBlockLang = trimmed.substring(3).trim().toLowerCase();
            codeBlockStartLine = i + 1;
            codeBlockText = '';

            codeBlockNode = {
              name: `Code Block (${codeBlockLang || 'text'})`,
              detail: '```' + codeBlockLang,
              kind: SymbolKind.Module,
              range: { startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: line.length + 1 },
              children: []
            };

            if (scopeStack.length > 0) {
              codeBlockNode.containerName = scopeStack[scopeStack.length - 1].symbol.name;
              scopeStack[scopeStack.length - 1].symbol.children!.push(codeBlockNode);
            } else {
              rootSymbols.push(codeBlockNode);
            }
            continue;

          } else {
            inCodeBlock = false;
            if (codeBlockNode) {
              codeBlockNode.range.endLineNumber = i + 1;
              let childSymbols: DocumentSymbol[] | null = null;

              try {
                switch (codeBlockLang) {
                  case 'js': case 'javascript': case 'ts': case 'typescript': childSymbols = await jsSymbolProvider.provideSymbols(codeBlockText, codeBlockLang); break;
                  case 'css': childSymbols = await cssSymbolProvider.provideSymbols(codeBlockText, codeBlockLang); break;
                  case 'py': case 'python': childSymbols = await pythonSymbolProvider.provideSymbols(codeBlockText, codeBlockLang); break;
                  case 'rs': case 'rust': childSymbols = await rustSymbolProvider.provideSymbols(codeBlockText, codeBlockLang); break;
                  case 'c': case 'cpp': case 'c++': childSymbols = await cSymbolProvider.provideSymbols(codeBlockText, codeBlockLang); break;
                  case 'java': childSymbols = await javaSymbolProvider.provideSymbols(codeBlockText, codeBlockLang); break;
                  case 'html': childSymbols = await htmlSymbolProvider.provideSymbols(codeBlockText, codeBlockLang); break;
                }

                if (childSymbols && childSymbols.length > 0) {
                  shiftLineNumbers(childSymbols, codeBlockStartLine);
                  for (const child of childSymbols) child.containerName = codeBlockNode.name;
                  codeBlockNode.children = childSymbols;
                }
              } catch (e) {
                console.warn(`[Markdown] Failed inner block: ${codeBlockLang}`);
              }
            }
            continue;
          }
        }

        if (inCodeBlock) {
          codeBlockText += line + '\n';
          continue;
        }

        const match = line.match(/^(#{1,6})\s+(.*)/);
        if (match) {
          const level = match[1].length;
          const name = match[2].replace(/<[^>]*>/g, '').trim();

          if (!name) continue;

          while (scopeStack.length > 0 && scopeStack[scopeStack.length - 1].level >= level) {
            const closedEntry = scopeStack.pop()!;
            closedEntry.symbol.range.endLineNumber = i; 
          }

          const sym: DocumentSymbol = {
            name,
            detail: `H${level}`,
            kind: SymbolKind.Module, 
            range: { startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: line.length + 1 },
            children: []
          };

          if (scopeStack.length > 0) {
            sym.containerName = scopeStack[scopeStack.length - 1].symbol.name;
            scopeStack[scopeStack.length - 1].symbol.children!.push(sym);
          } else {
            rootSymbols.push(sym);
          }

          scopeStack.push({ symbol: sym, level });
        }
      }

      for (const entry of scopeStack) {
        entry.symbol.range.endLineNumber = lines.length;
      }

      return rootSymbols.length > 0 ? rootSymbols : null;

    } catch (e) {
      console.error("[Markdown Composer Failed]:", e);
      return null;
    }
  }
};