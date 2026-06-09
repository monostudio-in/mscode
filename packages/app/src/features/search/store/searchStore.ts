// src/features/search/store/searchStore.ts

import { create } from 'zustand';
import { useExplorerStore } from '@/features/explorer/store/exploreStore';
import { searchEngine } from '@/core/services/searchService';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
// import { fs } from '@/core/extensionAPI/modules/filesystemModule';
import { fs } from '@/core/fileSystem';


export interface SearchMatch {
  id: string;
  line: number;
  column: number;
  preview: string;
  matchStart: number;
  matchLength: number;
}

export interface SearchFileResult {
  filePath: string;
  fileName: string;
  dirPath: string;
  matches: SearchMatch[];
  expanded: boolean;
}

interface SearchState {
  searchQuery: string;
  replaceQuery: string;
  includeQuery: string;
  excludeQuery: string;
  
  isReplaceOpen: boolean;
  isDetailsOpen: boolean; 
  
  matchCase: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  
  isSearching: boolean;
  results: SearchFileResult[];
  
  setSearchQuery: (query: string) => void;
  setReplaceQuery: (query: string) => void;
  setIncludeQuery: (query: string) => void;
  setExcludeQuery: (query: string) => void;
  
  setIsReplaceOpen: (isOpen: boolean) => void;
  toggleDetailsOpen: () => void;
  toggleOption: (option: 'matchCase' | 'wholeWord' | 'useRegex') => void;
  
  toggleFileExpanded: (filePath: string) => void;
  dismissResult: (filePath: string, matchId?: string) => void;
  
  executeSearch: () => Promise<void>;
  executeReplace: (filePath: string, matchId?: string) => Promise<void>;
  clearResults: () => void;
}

/**
 * State store managing full-text project search operations, match entries cache,
 * replacement sequences, and custom filepath visibility parameter boundaries.
 */
export const useSearchStore = create<SearchState>((set, get) => ({
  searchQuery: '',
  replaceQuery: '',
  includeQuery: '',
  excludeQuery: '',
  
  isReplaceOpen: false,
  isDetailsOpen: false,
  
  matchCase: false,
  wholeWord: false,
  useRegex: false,
  
  isSearching: false,
  results: [],

  setSearchQuery: (query) => set({ searchQuery: query }),
  setReplaceQuery: (query) => set({ replaceQuery: query }),
  setIncludeQuery: (query) => set({ includeQuery: query }),
  setExcludeQuery: (query) => set({ excludeQuery: query }),
  
  setIsReplaceOpen: (isOpen) => set({ isReplaceOpen: isOpen }),
  toggleDetailsOpen: () => set((state) => ({ isDetailsOpen: !state.isDetailsOpen })),
  toggleOption: (opt) => set((state) => ({ [opt]: !state[opt] })),
  
  toggleFileExpanded: (filePath) => set((state) => ({
    results: state.results.map(f => f.filePath === filePath ? { ...f, expanded: !f.expanded } : f)
  })),

  dismissResult: (filePath, matchId) => set((state) => {
    if (!matchId) {
      return { results: state.results.filter(f => f.filePath !== filePath) };
    }
    const newResults = state.results.map(f => {
      if (f.filePath === filePath) {
        return { ...f, matches: f.matches.filter(m => m.id !== matchId) };
      }
      return f;
    }).filter(f => f.matches.length > 0); 
    return { results: newResults };
  }),

  clearResults: () => set({ results: [], isSearching: false }),

  executeSearch: async () => {
    const { searchQuery, matchCase, wholeWord, useRegex, includeQuery, excludeQuery } = get();
    if (!searchQuery.trim()) {
      return set({ results: [] });
    }
    
    set({ isSearching: true, results: [] });
    const workspacePath = useExplorerStore.getState().workspacePath;
    if (!workspacePath) {
      return set({ isSearching: false });
    }

    // Resolve structural file matching parameter exceptions configured in settings sheets
    const settings = useSettingsStore.getState().settings;
    const defaultExcludes: string[] = settings['workbench.search.exclude'] || ['.git', 'node_modules', 'dist', 'build', '.*'];

    const includes = includeQuery.split(',').map(s => s.trim()).filter(Boolean);
    const customExcludes = excludeQuery.split(',').map(s => s.trim()).filter(Boolean);
    
    // Explicit declarations override global setting rules
    const finalExcludes = [...defaultExcludes, ...customExcludes].filter(ex => {
      return !includes.some(inc => inc.includes(ex) || ex.includes(inc));
    });

    try {
      const response = await searchEngine.search({
        basePath: workspacePath,
        query: searchQuery,
        isRegex: useRegex,
        matchCase: matchCase,
        wholeWord: wholeWord,
        includes: includes,
        excludes: finalExcludes
      } as any);

      set({ results: response.results || [], isSearching: false });
    } catch (e) {
      console.error('Search Error:', e);
      set({ isSearching: false });
    }
  },

  executeReplace: async (filePath: string, matchId?: string) => {
    const state = get();
    const fileResult = state.results.find(r => r.filePath === filePath);
    
    if (!fileResult || fileResult.matches.length === 0) return;

    const replacementText = state.replaceQuery || '';
    
    try {
      const fileContent = await fs.readFile(filePath); 
      const lines = fileContent.split('\n');

      let matchesToReplace = matchId 
        ? fileResult.matches.filter(m => m.id === matchId)
        : [...fileResult.matches];

      if (matchesToReplace.length === 0) return;

      // Bottom-up & Right-to-Left sort
      matchesToReplace.sort((a, b) => {
        if (a.line !== b.line) {
          return b.line - a.line; // Line acc descending
        }
        return b.column - a.column; // Column acc descending
      });

      for (const match of matchesToReplace) {
        const lineIndex = match.line - 1; // Array Index is always 0-based
        const colIndex = match.column - 1; 

        if (lineIndex >= 0 && lineIndex < lines.length) {
          const originalLine = lines[lineIndex];
          
          const before = originalLine.substring(0, colIndex);
          const after = originalLine.substring(colIndex + match.matchLength);
          
          lines[lineIndex] = before + replacementText + after;
        }
      }

      const newContent = lines.join('\n');
      await fs.writeFile(filePath, newContent);

      if (matchId) {
        state.dismissResult(filePath, matchId);
      } else {
        matchesToReplace.forEach(m => state.dismissResult(filePath, m.id));
      }

      console.log(`[SearchStore] Successfully replaced ${matchesToReplace.length} occurrences in ${filePath}`);
      
    } catch (error) {
      console.error(`[SearchStore] Failed to execute real replace in ${filePath}:`, error);
    }
  },
}));
