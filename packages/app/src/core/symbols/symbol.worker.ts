// src/core/symbols/symbol.worker.ts

// ─── WORKER-SAFE LEXICAL ANALYSIS PROVIDERS ─────────────────────────────────
import { jsSymbolProvider } from './languages/jsSymbols';
import { cssSymbolProvider } from './languages/cssSymbols';
import { htmlSymbolProvider } from './languages/htmlSymbols';
import { rustSymbolProvider } from './languages/rustSymbols';
import { markdownSymbolProvider } from './languages/markdownSymbols';

/**
 * Isolated static routing index map.
 * Connects incoming language identifiers to thread-isolated syntax extraction strategies.
 */
const providers: Record<string, any> = {
  javascript: jsSymbolProvider,
  typescript: jsSymbolProvider,
  css: cssSymbolProvider,
  html: htmlSymbolProvider,
  rust: rustSymbolProvider,
  markdown: markdownSymbolProvider,
};

// ─── BACKGROUND THREAD INTERFACE SUBSYSTEM ────────────────────────────────────

/**
 * Listens for structural content frames posted down from the client's main editor thread.
 * Runs compute-heavy AST (Abstract Syntax Tree) splits off the UI layout viewport loops.
 */
self.onmessage = async (e: MessageEvent) => {
  const { id, text, languageId } = e.data;

  try {
    const provider = providers[languageId];
    
    if (provider) {
      // Execute the structural parse utilizing raw text buffers directly to protect background worker memory isolation
      const symbols = await provider.provideSymbols(text, languageId);
      
      // Dispatch structured syntax maps back to coordinate listeners on the primary script layout window
      self.postMessage({ id, symbols });
    } else {
      self.postMessage({ id, symbols: null });
    }
  } catch (error) {
    console.error(`[Worker Error] Structural extraction loop failed during '${languageId}' compilation:`, error);
    self.postMessage({ id, symbols: null });
  }
};
