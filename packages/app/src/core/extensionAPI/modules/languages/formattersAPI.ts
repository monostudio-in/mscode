// src/core/extensionAPI/modules/languages/formattersAPI.ts

import * as monaco from 'monaco-editor';

/**
 * Interface representing a provider that supplies formatting edits for a document.
 */
export interface DocumentFormattingEditProvider {
  /**
   * Triggered when the user executes the "Format Document" command.
   * 
   * @param model - The Monaco TextModel of the current file.
   * @param options - Formatting configuration (e.g., tabSize, insertSpaces).
   * @param token - A cancellation token to handle aborted formatting requests.
   * @returns An array of TextEdits or a promise that resolves to them.
   */
  provideDocumentFormattingEdits(
    model: monaco.editor.ITextModel,
    options: monaco.languages.FormattingOptions,
    token: monaco.CancellationToken
  ): monaco.languages.TextEdit[] | Promise<monaco.languages.TextEdit[]>;
}

/**
 * Factory function to create the Formatters API.
 * Allows extensions to register language-specific code formatters.
 */
export const createFormattersAPI = () => ({
  /**
   * Registers a formatting provider for a specific language.
   * 
   * @param languageId - The target language identifier (e.g., 'javascript', 'cpp', 'css').
   * @param provider - The implementation of the formatting logic.
   * @returns A disposable object to unregister the provider.
   */
  registerDocumentFormattingEditProvider: (languageId: string, provider: DocumentFormattingEditProvider) => {
    
    // Registering the provider into the Monaco Editor core system
    const disposable = monaco.languages.registerDocumentFormattingEditProvider(languageId, {
      provideDocumentFormattingEdits: async (model, options, token) => {
        try {
          return await provider.provideDocumentFormattingEdits(model, options, token);
        } catch (error) {
          console.error(`[Formatter Error] for ${languageId}:`, error);
          // Return an empty array on error to prevent corrupting the file content
          return []; 
        }
      }
    });

    return {
      /** Unregisters the formatting provider and cleans up resources. */
      dispose: () => disposable.dispose()
    };
  }
});

// ────────────────────────────────────────────────────────
// USAGE EXAMPLE
// ────────────────────────────────────────────────────────

/*
```javascript
// Extension Code: C/C++ Formatter (Example using a WASM-based formatter)
import initClangFormat, { format } from 'clang-format-wasm';

async function activate() {
  // 1. Initialize the formatting engine or load WebAssembly modules
  await initClangFormat();

  // 2. Register the provider for C++ using the Matrix Studio API
  mscode.languages.registerDocumentFormattingEditProvider('cpp', {
    provideDocumentFormattingEdits: async (model, options, token) => {
      
      const rawCode = model.getValue();
      
      // 3. Process the code through the formatter (Clang-Format)
      // This could also be done via a local CLI execution in Termux
      const formattedCode = await format(rawCode, 'LLVM'); 

      // 4. Return the edits to Monaco
      // In this case, we replace the entire document range with the formatted text
      return [
        {
          range: model.getFullModelRange(),
          text: formattedCode
        }
      ];
    }
  });
}
```
*/
