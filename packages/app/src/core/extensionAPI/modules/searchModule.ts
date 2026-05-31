// src/core/extensionAPI/modules/searchModule.ts
//
// Full-featured Search & Replace API for extension developers.
//
// TWO levels of access:
//
//   1. HIGH-LEVEL  (UI-integrated)
//      findInFiles / replaceInFiles / getResults / clearResults
//      These update the Search Panel state so results appear in the sidebar.
//
//   2. LOW-LEVEL  (silent / background)
//      search()  — calls the native search engine directly.
//      Results are returned to the caller; the Search Panel is NOT updated.
//      Perfect for "Find All References", rename refactoring, etc.

import { useSearchStore }   from '@/features/search/store/searchStore';
import { useExplorerStore } from '@/features/explorer/store/exploreStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { searchEngine }     from '@/core/services/searchService';
import type { SearchFileResult } from '@/features/search/store/searchStore';
import type { SearchOptions }    from '@/core/services/searchService';

// ─── Shared option types ──────────────────────────────────────────────────────

export interface FindOptions {
  query:      string;
  matchCase?: boolean;
  wholeWord?: boolean;
  useRegex?:  boolean;
  /** Glob patterns for files to include, e.g. ['*.ts', 'src/**'] */
  includes?:  string[];
  /** Glob patterns for files to exclude, e.g. ['node_modules', '*.min.js'] */
  excludes?:  string[];
}

export interface ReplaceOptions {
  replacement: string;
  /** If omitted, replaces all matches across all files */
  filePath?:   string;
  /** If omitted, replaces all matches in the given file */
  matchId?:    string;
}

export interface SilentSearchOptions extends FindOptions {
  /** Override the workspace root for this search */
  basePath?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Merge user-supplied excludes with the workspace defaults from settings,
 * but let any explicitly-included patterns win.
 */
const resolveExcludes = (
  includes:       string[],
  customExcludes: string[],
): string[] => {
  const settings       = useSettingsStore.getState().settings;
  const defaultExcludes: string[] = settings['workbench.search.exclude']
    ?? ['.git', 'node_modules', 'dist', 'build', '.*'];

  return [...defaultExcludes, ...customExcludes].filter(
    ex => !includes.some(inc => inc.includes(ex) || ex.includes(inc)),
  );
};

// ─── Module factory ───────────────────────────────────────────────────────────

export const createSearchModule = (_extId: string) => ({

  // ── HIGH-LEVEL: UI-integrated ─────────────────────────────────────────────

  /**
   * Search the workspace and show results in the Search Panel sidebar.
   * Returns the matched results so the caller can also process them.
   *
   * @example
   * const results = await mscode.search.findInFiles({
   *   query:     'TODO',
   *   matchCase: false,
   *   includes:  ['*.ts'],
   * });
   * console.log(`Found ${results.length} files`);
   */
  findInFiles: async (opts: FindOptions): Promise<SearchFileResult[]> => {
    const store    = useSearchStore.getState();
    // const includes = opts.includes ?? [];
    // const excludes = resolveExcludes(includes, opts.excludes ?? []);

    // Sync options into the store so the Search Panel reflects them
    store.setSearchQuery(opts.query);
    if (opts.matchCase  !== undefined) store.toggleOption('matchCase');  // idempotent toggle is avoided below
    if (opts.wholeWord  !== undefined) store.toggleOption('wholeWord');
    if (opts.useRegex   !== undefined) store.toggleOption('useRegex');
    if (opts.includes)  store.setIncludeQuery(opts.includes.join(', '));
    if (opts.excludes)  store.setExcludeQuery(opts.excludes.join(', '));

    // Use the store's engine (respects current workspace path + settings)
    await store.executeSearch();
    return useSearchStore.getState().results;
  },

  /**
   * Replace text in the workspace and refresh the Search Panel.
   *
   * • No filePath → replaces ALL matches across ALL files
   * • filePath only → replaces ALL matches in that file
   * • filePath + matchId → replaces ONE specific match
   *
   * @example
   * // Replace a single match
   * await mscode.search.replaceInFiles({
   *   replacement: 'newName',
   *   filePath:    '/sdcard/project/src/index.ts',
   *   matchId:     'match-42',
   * });
   */
  replaceInFiles: async (opts: ReplaceOptions): Promise<void> => {
    const store = useSearchStore.getState();
    store.setReplaceQuery(opts.replacement);

    if (opts.filePath) {
      await store.executeReplace(opts.filePath, opts.matchId);
    } else {
      // Replace in every file
      const files = [...useSearchStore.getState().results];
      for (const file of files) {
        await store.executeReplace(file.filePath);
      }
    }
  },

  /**
   * Return the current Search Panel results without running a new search.
   */
  getResults: (): SearchFileResult[] => {
    return useSearchStore.getState().results;
  },

  /** Clear all Search Panel results. */
  clearResults: (): void => {
    useSearchStore.getState().clearResults();
  },

  // ── LOW-LEVEL: silent / background ───────────────────────────────────────

  /**
   * Run a search silently using the native engine.
   * The Search Panel state is NOT touched — perfect for background operations
   * like "find all usages", rename-symbol preview, dependency analysis, etc.
   *
   * @example
   * const results = await mscode.search.search({
   *   query:    'useAuthStore',
   *   includes: ['*.ts', '*.tsx'],
   *   excludes: ['*.test.ts'],
   * });
   * const totalHits = results.reduce((n, f) => n + f.matches.length, 0);
   * mscode.window.showInformationMessage(`Found ${totalHits} references`);
   */
  search: async (opts: SilentSearchOptions): Promise<SearchFileResult[]> => {
    const includes = opts.includes ?? [];
    const excludes = resolveExcludes(includes, opts.excludes ?? []);
    const basePath = opts.basePath ?? useExplorerStore.getState().workspacePath;

    if (!basePath) {
      console.warn('[searchModule] search() called with no workspace path');
      return [];
    }

    try {
      const payload: SearchOptions = {
        basePath,
        query:     opts.query,
        isRegex:   opts.useRegex   ?? false,
        matchCase: opts.matchCase  ?? false,
        wholeWord: opts.wholeWord  ?? false,
        includes,
        excludes,
      } as any;

      const response = await searchEngine.search(payload);
      return response.results ?? [];
    } catch (err) {
      console.error('[searchModule] search() error:', err);
      return [];
    }
  },

  // ── UTILITIES ─────────────────────────────────────────────────────────────

  /**
   * Total number of matches across all current results.
   * Useful for badge counters in custom sidebar panels.
   */
  getTotalMatchCount: (): number => {
    return useSearchStore.getState().results
      .reduce((n, f) => n + f.matches.length, 0);
  },

  /**
   * Get all results from a specific file path (if it has matches).
   */
  getResultsForFile: (filePath: string): SearchFileResult | undefined => {
    return useSearchStore.getState().results.find(f => f.filePath === filePath);
  },
});

export type SearchModule = ReturnType<typeof createSearchModule>;