// src/core/extensionAPI/modules/languages/symbolsAPI.ts

import { extensionSymbolRegistry } from '../../registry/symbolRegistry';
import type { SymbolProvider } from '@/core/symbols';

export const createSymbolsAPI = (extId: string) => ({
  /**
   * Registers a symbol provider for a specific language.
   * Symbols are used for features like "Outline" view and "Go to Symbol".
   * * @param languageId The language identifier (e.g., 'javascript', 'python')
   * @param provideFn The function that returns the symbols for a given document
   * @returns A disposable to unregister the provider.
   */
  registerSymbolProvider: (
    languageId: string, 
    provideFn: SymbolProvider['provideSymbols']
  ) => {
    // Generate a unique provider ID so extensions don't override each other
    const providerId = `${extId}-symbol-provider-${Math.random().toString(36).substring(2, 9)}`;
    
    // Calls the registry and gets the cleanup function back
    const unregister = extensionSymbolRegistry.registerProvider(languageId, providerId, provideFn);

    return {
      dispose: () => {
        if (unregister) unregister();
      }
    };
  }
});