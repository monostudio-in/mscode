// src/core/extensionAPI/registry/symbolRegistry.ts
import { symbolManager , SymbolSource} from '@/core/symbols';
import type { SymbolProvider } from '@/core/symbols';

export const extensionSymbolRegistry = {
  /**
   * Extension API: Allows plugins to register their own symbol providers
   */
  registerProvider: (languageId: string, providerId: string, provideFn: SymbolProvider['provideSymbols']) => {
    symbolManager.registerProvider(languageId, {
      id: providerId,
      source: SymbolSource.EXTENSION,
      priority: 50, // Higher than Regex, Lower than Monaco Native
      provideSymbols: provideFn
    });

    // Return a cleanup function
    return () => {
      // Assuming your symbolManager has an unregister method. 
      // If not, you might need to add one in your core symbolManager!
      if (symbolManager.unregisterProvider) {
         symbolManager.unregisterProvider(languageId, providerId);
      }
    };
  }
};