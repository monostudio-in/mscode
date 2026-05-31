// src/core/services/searchService.ts

import { Capacitor } from '@capacitor/core';
import { AndroidSearchEngine } from '@/platforms/android/SearchEngine';
import { WebSearchEngine } from '@/platforms/web/SearchEngine';
import type { SearchFileResult } from '@/features/search/store/searchStore';

/**
 * Structural settings options passed to control structural text queries 
 * across targeted file hierarchies.
 */
export interface SearchOptions {
  /** Root directory target path constraint containing scope boundary fields */
  basePath: string;
  /** Primary string or pattern literal to search against code blocks */
  query: string;
  /** Evaluates query string inputs as a valid regular expression when enabled */
  isRegex: boolean;
  /** Skips structural lowercase fold assumptions when strict sorting matches are necessary */
  matchCase: boolean;
  /** Enforces isolated keyword matching boundaries to isolate token names from adjacent structures */
  wholeWord: boolean;
  /** Supplemental exclusion filters skipping specific subdirectories (e.g., node_modules) */
  ignoreDirs?: string[]; 
  /** Supplemental extension exclusion sequences skipping media or compressed assets */
  ignoreExtensions?: string[]; 
}

/**
 * Structural interface outlining contract behaviors for underlying file search implementations.
 */
export interface ISearchEngine {
  /**
   * Traverses targeted directory scopes to discover matched text patterns inside workspace assets.
   * 
   * @param options Configured constraints parameter controlling matching logic variables.
   */
  search(options: SearchOptions): Promise<{ results: SearchFileResult[] }>;
}

// ─── PLATFORM RESOLUTION ENGINE FACTORY ───

/**
 * Dispatches matching compilation scanners dynamically tailored to system capabilities.
 * Selects hyper-optimized low-level native workers under true mobile storage layers,
 * falling back gracefully to clean isolated indexing engines inside web browser sandboxes.
 */
const getSearchEngine = (): ISearchEngine => {
  if (Capacitor.isNativePlatform()) {
    return new AndroidSearchEngine();
  } else {
    return new WebSearchEngine();
  }
};

/**
 * Shared central query instance resolving context matching files across execution domains.
 */
export const searchEngine = getSearchEngine();
