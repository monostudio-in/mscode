// src/store/languageStore.ts

import { create } from 'zustand';
import * as monaco from 'monaco-editor';
import { msEvents } from '@/core/extensionAPI/events/EventManager';

/**
 * List of language identifiers/aliases to filter out from the UI selection menu,
 * typically used to hide legacy, obscure, or non-functional languages.
 */
const EXCLUDED_LANGUAGES = [
  'freemarker', 'cameligo', 'aes', 'apex', 'csp', 'cypher',
  'ecl', 'lexon', 'mips', 'm3', 'pascaligo', 'pla', 'redis',
  'redshift', 'sparql', 'typespec', 'wgsl', 'sb', 'systemverilog'
];

interface LanguageStore {
  /** The full collection of languages registered in the Monaco environment. */
  languages: monaco.languages.ILanguageExtensionPoint[];
  
  /** Refreshes the internal language cache from the Monaco registry. */
  refreshLanguages: () => void;
  
  /** Retrieves a sorted, filtered list of languages suitable for the UI. */
  getAvailableLanguages: () => monaco.languages.ILanguageExtensionPoint[];
}

/**
 * Store managing language metadata, providing synchronization between the
 * Monaco editor's language registry and the application's UI components.
 */
export const useLanguageStore = create<LanguageStore>((set, get) => ({
  languages: [],

  refreshLanguages: () => {
    const allLangs = monaco.languages.getLanguages();
    set({ languages: allLangs });
    msEvents.emit('onDidChangeLanguages', allLangs);
  },

  getAvailableLanguages: () => {
    // Ensure the cache is populated if empty
    let currentLangs = get().languages;
    if (currentLangs.length === 0) {
      get().refreshLanguages();
      currentLangs = get().languages;
    }

    return currentLangs
      // Sort alphabetically by primary alias or ID
      .sort((a, b) => (a.aliases?.[0] || a.id).localeCompare(b.aliases?.[0] || b.id))
      // Filter out unwanted languages defined in EXCLUDED_LANGUAGES
      .filter(lang => {
        const langName = (lang.aliases?.[0] || lang.id).toLowerCase();
        const langId = lang.id.toLowerCase();
        
        return !EXCLUDED_LANGUAGES.some(ex => 
          langName.includes(ex) || langId.includes(ex)
        );
      });
  }
}));
