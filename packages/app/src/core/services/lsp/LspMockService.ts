// src/core/services/lspMockService.ts

import * as monaco from 'monaco-editor';
import type { ILspService } from '../ILspService';

/**
 * LspMockService Subsystem Engine
 * Provides a lightweight, no-op mock implementation of the ILspService interface 
 * for non-native web development environments.
 * 
 * Injects deterministic placeholder intelligence completion sets to simplify 
 * user interface testing loops without standing up full background native sockets.
 */
export class LspMockService implements ILspService {
  public isConnected = false;
  public initialized = false;
  public isInitializing = false;
  /** Tracks allocated web context resource listeners for clean memory teardowns */
  public disposables: monaco.IDisposable[] = [];

  /**
   * Resolves immediately under web simulation frameworks since background 
   * platform compilation engines are skipped.
   */
  public waitUntilReady(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Simulates an environment connection handshake. Mounts standard dummy intellisense 
   * completion items into the local Monaco runtime instance under the targeted language type.
   * 
   * @param languageId Context identifier matching target editor configurations (e.g., 'typescript').
   * @param _url Simulated network endpoint destination path.
   * @param _options Supplemental configuration parameters.
   */
  public connect(languageId: string, _url: string, _options?: Record<string, any>): void {
    console.log(`[LspMock] connect() called for ${languageId} — activating web simulation providers`);
    
    this.isConnected = true;
    this.initialized = true;

    // Register synthetic auto-completion overrides to streamline interface testing
    const mockProvider = monaco.languages.registerCompletionItemProvider(languageId, {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const fakeSuggestions: monaco.languages.CompletionItem[] = [
          {
            label: 'mock_function',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'mock_function(${1:arg})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '[Web Mock] This is a fake function from Web Mock Service.',
            detail: 'void mock_function()',
            range: range,
            sortText: '10_mock_func'
          },
          {
            label: 'mock_variable',
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: 'mock_variable',
            documentation: '[Web Mock] This is a fake variable from Web Mock Service.',
            detail: 'string mock_variable',
            range: range,
            sortText: '11_mock_var'
          },
          {
            label: 'ms_code_test',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'MSCodeTest',
            documentation: '[Web Mock] A fake class for UI testing.',
            detail: 'class MSCodeTest',
            range: range,
            sortText: '12_ms_code'
          }
        ];

        return {
          suggestions: fakeSuggestions,
          incomplete: false
        };
      }
    });

    this.disposables.push(mockProvider);
  }

  /**
   * Tears down outstanding language suggestion overrides and resets connection state variables.
   */
  public disconnect(): void {
    console.log('[LspMock] disconnect() called');
    this.isConnected = false;
    this.initialized = false;
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
  }

  public registerModelUri(_model: monaco.editor.ITextModel, _realFileUri: string): void {
    // Virtual web sandbox maps skip absolute filesystem translations
  }

  public unregisterModelUri(_model: monaco.editor.ITextModel): void {
    // Virtual web sandbox maps skip document destruction signaling loops
  }

  public notifyDocumentOpen(_model: monaco.editor.ITextModel): void {
    // Virtual web sandbox maps skip text synchronization streams
  }

  public _notify(_method: string, _params: unknown): void {
    // No-op across mock implementations
  }
}

/**
 * Shared central mock singleton processing mock web completion vectors.
 */
export const lspMockService = new LspMockService();
