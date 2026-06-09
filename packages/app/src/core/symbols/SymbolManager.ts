// src/core/symbols/SymbolManager.ts

import * as monaco from 'monaco-editor';
import { SymbolSource } from './types';
import type { DocumentSymbol, SymbolProvider } from './types';

interface CacheEntry {
  versionId: number;
  symbols: DocumentSymbol[];
}

/**
 * Orchestrates multi-layered document syntax profiling.
 * Aggregates language-specific and global symbol extractors, prioritizes runtime matching,
 * and maintains structural token trees backed by memory cache policies lifecycle-linked to Monaco models.
 */
class SymbolManager {
  private providers: Map<string, SymbolProvider[]> = new Map();
  private cache: Map<string, CacheEntry> = new Map();
  public customPriorities: Record<string, number> = {};

  constructor() {
    // Structural Lifecycle Hook: Evict data nodes instantly upon document disposal to prevent memory leaks
    monaco.editor.onWillDisposeModel((model) => {
      this.cache.delete(model.uri.toString());
    });
  }

  /**
   * Registers or replaces an operational parser provider inside the targeting language sequence tree.
   * 
   * @param languageId Target selector string (or '*' for global fallback scopes).
   * @param provider Functional symbol generator strategy matching client requirements.
   */
  public registerProvider(languageId: string, provider: SymbolProvider) {
    if (!this.providers.has(languageId)) {
      this.providers.set(languageId, []);
    }
    const langProviders = this.providers.get(languageId)!;
    
    const existingIndex = langProviders.findIndex(p => p.id === provider.id);
    if (existingIndex >= 0) {
      langProviders[existingIndex] = provider;
    } else {
      langProviders.push(provider);
    }
  }
  
  /**
   * Safely removes a registered provider from the language tracking array.
   * * @param languageId Target selector string (e.g., 'javascript' or '*').
   * @param providerId Distinct identifier trace key of the provider to remove.
   */
  public unregisterProvider(languageId: string, providerId: string) {
    if (!this.providers.has(languageId)) return;
    
    const langProviders = this.providers.get(languageId)!;
    const updatedProviders = langProviders.filter(p => p.id !== providerId);
    
    if (updatedProviders.length === 0) {
      this.providers.delete(languageId); // মেমরি পুরোপুরি ক্লিন করা
    } else {
      this.providers.set(languageId, updatedProviders);
    }
  }

  /**
   * Evaluates operational weight allocations. 
   * Prioritizes manually injected client config keys before tracking static fallback rankings.
   */
  private getPriority(provider: SymbolProvider): number {
    return this.customPriorities[provider.id] ?? provider.priority;
  }

  /**
   * Queries registered resolution blocks sequentially until syntax mappings successfully materialise.
   * Utilizes dynamic interception parameters to safe-guard internal processes against recursive loop stacks.
   * 
   * @param model Active Monaco code editor data layout frame.
   * @param skipProviderIds Array list containing strategy module tokens to isolate and ignore.
   */
  public async getSymbols(model: monaco.editor.ITextModel, skipProviderIds: string[] = []): Promise<DocumentSymbol[]> {
    const uri = model.uri.toString();
    const versionId = model.getVersionId();

    // Cache HIT optimization: Return identical structural frames directly if the text delta signature matches
    const cached = this.cache.get(uri);
    if (cached && cached.versionId === versionId) {
      return cached.symbols;
    }

    const langId = model.getLanguageId();
    const langProviders = this.providers.get(langId) || [];
    const globalProviders = this.providers.get('*') || [];
    
    // Sort execution workflows descending according to specific operational priorities
    const allProviders = [...langProviders, ...globalProviders]
      .sort((a, b) => this.getPriority(b) - this.getPriority(a));

    for (const provider of allProviders) {
      // Loop Exception Intercept: Skip targeted provider IDs to avoid native loop feedback recursion
      if (skipProviderIds.includes(provider.id)) {
        continue; 
      }

      try {
        // Execute structural text slice query while injecting raw strings, layout contexts, and fallback model pointers
        const symbols = await provider.provideSymbols(model.getValue(), langId, model);
        
        if (symbols && symbols.length > 0) {
          this.tagSource(symbols, provider.source); 
          this.cache.set(uri, { versionId, symbols });
          return symbols;
        }
      } catch (error) {
        console.warn(`[SymbolManager] Core fallback pipeline '${provider.id}' encountered processing errors:`, error);
      }
    }

    return [];
  }

  /**
   * Recursively walks structured data response vectors to brand metadata roots 
   * with tracking flags signifying the resolution provider channel.
   */
  private tagSource(symbols: DocumentSymbol[], source: SymbolSource) {
    for (const sym of symbols) {
      sym.source = source;
      if (sym.children) {
        this.tagSource(sym.children, source);
      }
    }
  }
}

export const symbolManager = new SymbolManager();
