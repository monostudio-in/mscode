// src/core/services/symbols/monacoNativeProvider.ts

import { SymbolSource } from '../types';
import type { SymbolProvider, DocumentSymbol } from '../types';

// @ts-ignore
// Internal Monaco Editor subsystem imports extracted directly from build layers.
// Used to access built-in language feature registers without manual hook overrides.
import { StandaloneServices } from 'monaco-editor/esm/vs/editor/standalone/browser/standaloneServices.js';
// @ts-ignore
import { ILanguageFeaturesService } from 'monaco-editor/esm/vs/editor/common/services/languageFeatures.js';
// @ts-ignore
import { CancellationToken } from 'monaco-editor/esm/vs/base/common/cancellation.js';

/**
 * Native Monaco Engine structural provider proxy.
 * Queries Monaco's internal registries to find active background compilers or registered 
 * worker modules that can return reliable workspace document symbols.
 */
export const monacoNativeProvider: SymbolProvider = {
  id: 'monaco-builtin',
  source: SymbolSource.MONACO,
  priority: 80, // Medium-High priority (Favored right behind direct workspace LSP modules)
  
  /**
   * Safe-wrapped lookup routing symbol extraction directly into inner editor feature components.
   * Leverages Monaco's priority-ordered system engines with a non-expiring tracking token.
   * 
   * @param model Active Monaco target configuration document instance buffer.
   */
  provideSymbols: async (model: any): Promise<DocumentSymbol[] | null> => {
    try {
      // Pull down core operational registries out of the editor bundle's runtime service state container
      const langFeatures = StandaloneServices.get(ILanguageFeaturesService);
      const providers = langFeatures.documentSymbolProvider.ordered(model);
      
      // Select the highest priority built-in provider matched by the active language layout
      if (providers && providers.length > 0) {
        const symbols = await providers[0].provideDocumentSymbols(model, CancellationToken.None);
        return (symbols as DocumentSymbol[]) || null;
      }
      
      return null;
    } catch (e) {
      // Fail silently and return baseline blocks if internal editor classes change structure across version releases
      return null;
    }
  }
};
