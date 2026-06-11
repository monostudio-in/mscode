// src/core/extensionAPI/modules/lspModule.ts

import { lspProcessManager } from '@/features/lsp/LspProcessManager';

export interface LspServerConfig {
  /** Array of package names to install via the system package manager (e.g., 'apk add'). */
  packages: string[];
  /** Optional shell commands to run after packages are installed (e.g., 'pip install'). */
  postInstall?: string[];
  /** Shell command to check if the server is already installed. Must return exit code 0. */
  checkCmd: string;
  /** The shell command that boots the LSP server process using standard I/O. */
  serverCmd: string;
}

export const createLspModule = (_extId: string) => ({
  
    /**
     * Registers a language server for one or more language IDs.
     */
    registerServer: (languages: string[], config: LspServerConfig) => {
      languages.forEach(lang => {
        lspProcessManager.registerDynamicConfig(lang, config);
      });

      //  Standard Disposable pattern for automatic cleanup!
      return {
        dispose: () => {
          languages.forEach(lang => {
            lspProcessManager.removeDynamicConfig(lang);
          });
        }
      };
    },

    /**
     * Explicitly unregisters a previously registered language server.
     */
    unregisterServer: (languages: string[]): void => {
      languages.forEach(lang => {
        lspProcessManager.removeDynamicConfig(lang);
      });
    },
  
});

export type LspModule = ReturnType<typeof createLspModule>;