// src/core/extensionAPI/modules/lspModule.ts
//
// Exposes LSP server registration to extension developers.
// Extensions register language servers here; useLspSync picks them up
// automatically via lspProcessManager.dynamicConfigs.

import { lspProcessManager } from '@/features/lsp/LspProcessManager';

export const createLspModule = (_extId: string) => ({
  /**
   * Register a language server for one or more language IDs.
   *
   * @example
   * mscode.lsp.registerServer(['rust'], {
   *   checkCmd:   'rust-analyzer --version',
   *   packages:   ['rust-analyzer'],
   *   serverCmd:  'rust-analyzer',
   * });
   */
  registerServer: (languages: string[], config: unknown): void => {
    languages.forEach(lang => {
      lspProcessManager.registerDynamicConfig(lang, config);
      // console.log(`[mscode:${extId}] LSP server registered for: ${lang}`);
    });
  },

  /**
   * Unregister a previously registered language server.
   * Call this in your extension's deactivate() to clean up.
   */
  unregisterServer: (languages: string[]): void => {
    languages.forEach(lang => {
      lspProcessManager.removeDynamicConfig(lang);
      // console.log(`[mscode:${extId}] LSP server unregistered for: ${lang}`);
    });
  },
});

export type LspModule = ReturnType<typeof createLspModule>;