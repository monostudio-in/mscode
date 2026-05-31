// src/core/services/lsp/LspSymbolProvider.ts

import { SymbolSource, SymbolKind } from '../types';
import type { SymbolProvider, DocumentSymbol } from '../types';

// ─── ACTIVE CENTRAL SERVICE SINGLETON REFERENCE ───────────────────────────────
import { activeLspService } from '@/features/editor/hooks/useLspSync';

/**
 * Normalizes absolute resource string addresses into safe canonical system paths.
 * Removes duplicate slash indicators and flattens physical emulated Android storage mounts 
 * into a standardized workspace mount layout.
 * 
 * @param uri Raw unchecked document protocol resource string.
 */
const resolveLspUri = (uri: string): string => {
  let safeUri = uri.replace(/([^:/])\/{2,}/g, '$1/');
  if (safeUri.includes('/storage/emulated/0')) {
    safeUri = safeUri.replace('/storage/emulated/0', '/sdcard');
  }
  return safeUri;
};

/**
 * Symbol provider implementation routing extraction queries directly via the Language Server Protocol.
 * Maps incoming semantic syntax indexes straight into editor document outline structures.
 */
export const lspSymbolProvider: SymbolProvider = {
  id: 'lsp-native',
  source: SymbolSource.LSP,
  priority: 100,
  
  /**
   * Contacts the language server back-end to retrieve hierarchical token symbols.
   * Converts 0-indexed language server character offsets to 1-indexed Monaco lines.
   */
  provideSymbols: async (_text: string, _languageId: string, model?: any): Promise<DocumentSymbol[] | null> => {
    // Structural Guard: Skip processing loops entirely if connection pools are dark or missing model hooks
    if (!model || !activeLspService.isConnected) return null;

    try {
      const uri = resolveLspUri(model.uri.toString());
      
      // Structural Exception Guard: Resolve varying signature naming maps across concrete vs mock environments
      const requestFn = (activeLspService as any).request || (activeLspService as any)._request;
      if (!requestFn) return null;

      const response: any = await requestFn.call(activeLspService, 'textDocument/documentSymbol', {
        textDocument: { uri }
      });

      if (!response) return null;

      /**
       * Recursively transforms wire format RPC elements into localized client definitions.
       */
      const mapLspSymbol = (sym: any): DocumentSymbol => ({
        name: sym.name,
        detail: sym.detail,
        kind: mapLspKindToCustom(sym.kind),
        range: {
          startLineNumber: sym.range.start.line + 1, 
          startColumn: sym.range.start.character + 1,
          endLineNumber: sym.range.end.line + 1, 
          endColumn: sym.range.end.character + 1
        },
        children: sym.children ? sym.children.map(mapLspSymbol) : []
      });

      return response.map(mapLspSymbol);
    } catch (e) {
      // Fail silently and return safe bounds if data translation or frame dispatch failures occur
      return null;
    }
  }
};

/**
 * Aligns protocol standard symbol values directly into internal interface enumerations.
 * Falls back to base File categorization tokens if index flags drift outside expected boundaries.
 * 
 * @param kind Original numeric enumeration flag transmitted by the language server.
 */
const mapLspKindToCustom = (kind: number): SymbolKind => {
  if (kind >= 1 && kind <= 26) {
    return (kind - 1) as SymbolKind;
  }
  return SymbolKind.File;
};
