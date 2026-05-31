// src/core/symbols/index.ts

import * as monaco from 'monaco-editor';
import { symbolManager } from './SymbolManager';

// ─── CENTRAL ROUTING PROVIDER SCHEMES ─────────────────────────────────────────
import { lspSymbolProvider } from './providers/LspSymbolProvider';
import { monacoNativeProvider } from './providers/MonacoNativeProvider';
import { regexFallbackProvider } from './providers/RegexFallbackProvider';

// ─── LANGUAGE SPECIFIC OVERRIDE SUB-PROVIDERS ─────────────────────────────────
import { cSymbolProvider } from './languages/cSymbols';
import { pythonSymbolProvider } from './languages/pythonSymbols';
import { javaSymbolProvider } from './languages/javaSymbols';
import { jsSymbolProvider } from './languages/jsSymbols';
import { cssSymbolProvider } from './languages/cssSymbols';
import { htmlSymbolProvider } from './languages/htmlSymbols';
import { rustSymbolProvider } from './languages/rustSymbols';
import { markdownSymbolProvider } from './languages/markdownSymbols';

/**
 * Initializes, registers, and bridges structural document symbol extractors 
 * with the underlying Monaco editor framework.
 */
export const bootstrapSymbolProviders = () => {
  
  // ─── NATIVE ENGINE SEAMLESS INTERCEPT LAYER ───
  // Bypasses the strict compiler type boundaries via cast overrides to toggle 
  // Monaco's default flat HTML scanner off, preventing duplicated sidebar outline tokens.
  const htmlLang = (monaco.languages as any).html; 
  
  if (htmlLang && htmlLang.htmlDefaults) {
    htmlLang.htmlDefaults.setModeConfiguration({
      documentFormattingEdits: true,
      documentRangeFormattingEdits: true,
      completionItems: true,
      hovers: true,
      documentHighlights: true,
      links: true,
      colors: true,
      rename: true,
      selectionRanges: true,
      diagnostics: true,
      documentSymbols: false // Explicitly intercepts and suppresses native flat listings
    });
  }

  // ─── CUSTOM PRIORITY ARCHITECTURE MAPPINGS ───
  symbolManager.customPriorities = {
    'html-composer': 90,
    'css-regex': 90,
    'rust-lexer': 90,
    'markdown-composer': 90
  };

  // ─── GLOBAL FALLBACK SUBSYSTEM REGISTRATIONS ───
  symbolManager.registerProvider('*', lspSymbolProvider);
  symbolManager.registerProvider('*', monacoNativeProvider);
  symbolManager.registerProvider('*', regexFallbackProvider);

  // ─── EXPLICIT LANGUAGE RESOLUTION MODULES ───
  symbolManager.registerProvider('c', cSymbolProvider);
  symbolManager.registerProvider('cpp', cSymbolProvider);
  symbolManager.registerProvider('python', pythonSymbolProvider);
  symbolManager.registerProvider('java', javaSymbolProvider);
  symbolManager.registerProvider('javascript', jsSymbolProvider);
  symbolManager.registerProvider('typescript', jsSymbolProvider);
  symbolManager.registerProvider('css', cssSymbolProvider);
  symbolManager.registerProvider('html', htmlSymbolProvider);
  symbolManager.registerProvider('rust', rustSymbolProvider);
  symbolManager.registerProvider('markdown', markdownSymbolProvider);

  console.log('Bridge established: Mapping customized SymbolManager loops to Monaco DocumentSymbolProvider hooks.');
  
  const customLanguages = ['html', 'css', 'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'rust', 'markdown'];

  /**
   * Translates application layout symbols directly into canonical Monaco wire protocol formats.
   */
  const mapToMonacoSymbol = (sym: any): any => ({
    name: sym.name,
    detail: sym.detail || '',
    kind: sym.kind,
    tags: [],
    range: sym.range,
    selectionRange: sym.range,
    children: sym.children ? sym.children.map(mapToMonacoSymbol) : []
  });

  // Tracking registry isolating thread invocations to secure loops against cyclic callback leaks
  const fetchingModels = new Set<string>();

  // Mount unified proxy hooks routing document metadata requests through our prioritized registry pipelines
  monaco.languages.registerDocumentSymbolProvider(customLanguages, {
    provideDocumentSymbols: async (model, _token) => {
      const uri = model.uri.toString();
      
      // Structural Guard: Trap recursive loops gracefully if the native provider queries itself
      if (fetchingModels.has(uri)) return []; 
      fetchingModels.add(uri);
      
      try {
        // Evaluate symbols while bypassing standard Monaco routines to prevent lookup recursion loops
        const symbols = await symbolManager.getSymbols(model, [monacoNativeProvider.id]);
        if (symbols && symbols.length > 0) {
          return symbols.map(mapToMonacoSymbol); 
        }
        return [];
      } catch (e) {
        console.error("[Native Bridge] Structural interface crash caught:", e);
        return [];
      } finally {
        fetchingModels.delete(uri);
      }
    }
  });
};

export { symbolManager } from './SymbolManager';
export * from './types';
