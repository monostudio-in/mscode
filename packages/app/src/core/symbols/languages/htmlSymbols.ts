/**
* htmlSymbols.ts — HTML Symbol Composer with Hierarchy
*
* - Builds true nested tree (not flat)
* - Uses a robust character-by-character parser
* - Supports embedded JS and CSS seamlessly
*/

import type { SymbolProvider, DocumentSymbol } from '../types';
import { SymbolSource, SymbolKind } from '../types';
import { jsSymbolProvider } from './jsSymbols';
import { cssSymbolProvider } from './cssSymbols';

const SELF_CLOSING_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

function shiftLineNumbers(symbols: DocumentSymbol[], offsetLines: number) {
  for (const sym of symbols) {
    sym.range.startLineNumber += offsetLines;
    sym.range.endLineNumber += offsetLines;
    if (sym.children) shiftLineNumbers(sym.children, offsetLines);
  }
}

export const htmlSymbolProvider: SymbolProvider = {
  id: 'html-composer',
  source: SymbolSource.REGEX,
  priority: 20,

  provideSymbols: async (text: string, _languageId: string): Promise<DocumentSymbol[] | null> => {
    try {
      const rootSymbols: DocumentSymbol[] = [];
      const stack: DocumentSymbol[] = []; 

      function getLineCol(offset: number): { line: number; col: number } {
        let line = 1;
        let lastNewline = -1;
        for (let i = 0; i < offset; i++) {
          if (text[i] === '\n') { line++; lastNewline = i; }
        }
        const col = offset - lastNewline;
        return { line, col: col <= 0 ? 1 : col };
      }

      let i = 0;
      const n = text.length;

      while (i < n) {
        if (text[i] !== '<') { i++; continue; }

        const tagStart = i;
        i++; 

        if (i + 2 < n && text[i] === '!' && text[i + 1] === '-' && text[i + 2] === '-') {
          const endComment = text.indexOf('-->', i);
          i = endComment !== -1 ? endComment + 3 : n;
          continue;
        }

        let isClosing = false;
        if (text[i] === '/') { isClosing = true; i++; }

        let tagName = '';
        while (i < n && /[a-zA-Z0-9\-:]/.test(text[i])) {
          tagName += text[i];
          i++;
        }
        tagName = tagName.toLowerCase();
        if (!tagName) { i = tagStart + 1; continue; }

        let attributes = '';
        let isSelfClosing = false;
        while (i < n && text[i] !== '>') {
          if (text[i] === '/' && i + 1 < n && text[i + 1] === '>') {
            isSelfClosing = true;
            i++; 
            break;
          }
          attributes += text[i];
          i++;
        }
        if (i < n && text[i] === '>') i++; 

        const startPos = getLineCol(tagStart);
        const endPos = getLineCol(i - 1);
        const lineNum = startPos.line;

        let id: string | undefined;
        const classes: string[] = [];
        const idMatch = attributes.match(/id\s*=\s*(["'])(.*?)\1/);
        if (idMatch) id = idMatch[2];
        const classMatch = attributes.match(/class\s*=\s*(["'])(.*?)\1/);
        if (classMatch) classes.push(...classMatch[2].trim().split(/\s+/));

        let richName = tagName;
        if (id) richName += `#${id}`;
        if (classes.length) richName += `.${classes.join('.')}`;

        // ----- CLOSING TAG -----
        if (isClosing) {
          for (let idx = stack.length - 1; idx >= 0; idx--) {
            if ((stack[idx] as any)._rawName === tagName) {
              const openSymbol = stack[idx];
              openSymbol.range.endLineNumber = lineNum;
              stack.length = idx; // Pops this tag and any unclosed children
              break;
            }
          }
          continue;
        }

        // ----- OPENING TAG -----
        const kind = (tagName === 'script' || tagName === 'style')
          ? SymbolKind.Module
          : SymbolKind.Class;

        const sym: DocumentSymbol = {
          name: richName,
          detail: `<${tagName}>`,
          kind,
          range: { startLineNumber: lineNum, startColumn: startPos.col, endLineNumber: lineNum, endColumn: endPos.col },
          children: []
        };
        (sym as any)._rawName = tagName;

        if (stack.length > 0) {
          const parent = stack[stack.length - 1];
          sym.containerName = parent.name;
          parent.children!.push(sym);
        } else {
          rootSymbols.push(sym);
        }

        if (!isSelfClosing && !SELF_CLOSING_TAGS.has(tagName)) {
          stack.push(sym);
        }

        // ----- HANDLE EMBEDDED JS / CSS -----
        if ((tagName === 'script' || tagName === 'style') && !isSelfClosing && !SELF_CLOSING_TAGS.has(tagName)) {
          const closeTag = `</${tagName}>`;
          const closeIndex = text.indexOf(closeTag, i);
          
          if (closeIndex !== -1) {
            const innerText = text.substring(i, closeIndex);
            const innerStartLine = getLineCol(i).line;

            try {
              const childSymbols = tagName === 'script'
                ? await jsSymbolProvider.provideSymbols(innerText, 'javascript')
                : await cssSymbolProvider.provideSymbols(innerText, 'css');

              if (childSymbols && childSymbols.length > 0) {
                shiftLineNumbers(childSymbols, innerStartLine - 1);
                for (const child of childSymbols) {
                  child.containerName = sym.name;
                  sym.children!.push(child);
                }
              }
            } catch (e) {
              console.warn(`[HTML] Embedded ${tagName} parsing failed:`, e);
            }

            const closePos = getLineCol(closeIndex + closeTag.length - 1);
            sym.range.endLineNumber = closePos.line;
            stack.pop(); 

            i = closeIndex + closeTag.length;
            continue;
          }
        }
      }

      function cleanUp(nodes: DocumentSymbol[]) {
        for (const node of nodes) {
          delete (node as any)._rawName;
          if (node.children) cleanUp(node.children);
        }
      }
      cleanUp(rootSymbols);

      return rootSymbols.length > 0 ? rootSymbols : null;
    } catch (e) {
      console.error('[HTML Symbol] Fatal error:', e);
      return null;
    }
  }
};