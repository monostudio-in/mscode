// src/core/services/symbols/regexFallbackProvider.ts

import type { SymbolProvider, DocumentSymbol } from '../types';
import { SymbolSource, SymbolKind } from '../types';

/**
 * Universal regular-expression based syntax parsing fallback system.
 * Acts as a last-resort, environment-agnostic processor that extracts basic syntax anchors
 * when heavy language servers (LSP) or tree-sitter modules are entirely unavailable.
 */
export const regexFallbackProvider: SymbolProvider = {
  id: 'universal-regex',
  source: SymbolSource.REGEX,
  priority: 10, // Lowest Priority (Evaluated last if primary strategies yield no results)
  
  /**
   * Scans a raw document text buffer line-by-line to isolate fundamental structure keywords.
   * Leverages the direct string parameter to guarantee reliable execution inside background web workers.
   * 
   * @param text Raw content buffer string extracted directly from the editor instance.
   * @param _languageId Target language identifier context (unused in universal parser regex flags).
   * @param _model Optional backing editor text layout instance (bypassed for thread safety).
   */
  provideSymbols: async (text: string, _languageId: string, _model?: any): Promise<DocumentSymbol[] | null> => {
    const symbols: DocumentSymbol[] = [];
    const lines = text.split('\n');
    
    lines.forEach((line: string, i: number) => {
      // Basic cross-language pattern matching keywords, functions, classes, and variable tokens
      const match = line.match(/(function|class|const|let|var|def|struct)\s+([a-zA-Z0-9_]+)/);
      
      if (match) {
        const keyword = match[1];
        let kind: SymbolKind = SymbolKind.Function;

        // Map discovered declaration structures directly onto explicit internal enum definitions
        if (keyword === 'class') {
          kind = SymbolKind.Class;
        } else if (keyword === 'struct') {
          kind = SymbolKind.Struct;
        } else if (keyword === 'const' || keyword === 'let' || keyword === 'var') {
          kind = SymbolKind.Variable;
        }

        symbols.push({
          name: match[2],
          detail: keyword,
          kind: kind,
          // Since regex scanning maps single lines, set baseline layout coordinates targeting the matching row index
          range: { 
            startLineNumber: i + 1, 
            startColumn: 1, 
            endLineNumber: i + 1, 
            endColumn: 1 
          }
        });
      }
    });
    
    return symbols.length > 0 ? symbols : null;
  }
};
