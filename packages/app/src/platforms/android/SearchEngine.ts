// src/platforms/android/SearchEngine.ts

import { registerPlugin } from '@capacitor/core';
import type { ISearchEngine, SearchOptions } from '@/core/services/searchService';
import type { SearchFileResult } from '@/features/search/store/searchStore';

/**
 * Defines the contract for the native Android search plugin.
 * This interface bridges the TypeScript frontend with the Java/Kotlin 
 * implementation layer that executes high-performance file indexing and pattern matching.
 */
interface NativeSearchPlugin {
  /**
   * Executes a search operation across the filesystem.
   * 
   * @param options Search configuration, including query strings, filters, and depth parameters.
   * @returns A promise resolving to an array of matching file results.
   */
  search(options: SearchOptions): Promise<{ results: SearchFileResult[] }>;
}

/**
 * Android-specific implementation of the search engine service.
 * Utilizes the NativeSearch plugin to leverage hardware-accelerated search 
 * indexing and native file system traversal capabilities.
 */
const CapacitorNativeSearch = registerPlugin<NativeSearchPlugin>('NativeSearch');

export class AndroidSearchEngine implements ISearchEngine {
  /**
   * Performs an asynchronous search across the Android filesystem.
   * 
   * @param options Search criteria and filters.
   * @returns A list of files matching the query criteria.
   */
  async search(options: SearchOptions): Promise<{ results: SearchFileResult[] }> {
    try {
      // Delegates the heavy lifting of filesystem indexing to the Android native engine
      return await CapacitorNativeSearch.search(options);
    } catch (error) {
      console.error("[AndroidSearchEngine] Search execution failed:", error);
      return { results: [] };
    }
  }
}
