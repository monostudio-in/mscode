// src/store/paletteStore.ts

import { create } from 'zustand';

export interface QuickPickItem {
  id: string;
  label: string;
  description?: string;
  inlineDetail?: string; 
  suffix?: string;        
  indent?: boolean;      
  type?: 'item' | 'separator';
  iconClass?: string;
  leftIcon?: string;
  rightIcon?: string;
  shortcut?: string;
  focusStyle?: 'highlight' | 'normal';
  keepOpen?: boolean;
  readonly?: boolean;
  onSelect?: () => void;
  onFocus?: () => void;
  onRightIconClick?: (e: any) => void;
  data?: any;
}

export interface PaletteProvider {
  prefix: string;
  name: string;
  placeholder?: string;
  provideItems: (searchQuery: string) => QuickPickItem[] | Promise<QuickPickItem[]>;
}

interface PaletteStore {
  isOpen: boolean;
  query: string;
  providers: Record<string, PaletteProvider>;
  
  isQuickPick: boolean;
  quickPickItems: QuickPickItem[];
  
  // Dynamic items generator function
  quickPickItemsGenerator: ((query: string) => QuickPickItem[]) | null;

  quickPickPlaceholder: string;
  onQuickPickSelect: ((item: QuickPickItem) => void) | null;

  isInputBox: boolean;
  inputBoxPlaceholder: string;
  onInputBoxSubmit: ((value: string) => void) | null;

  openPalette: (initialQuery?: string) => void;

  // Accepts either a static array OR a dynamic function
  openQuickPick: (placeholder: string, items: QuickPickItem[] | ((query: string) => QuickPickItem[]), onSelect: (item: QuickPickItem) => void) => void;
  
  openInputBox: (placeholder: string, onSubmit: (value: string) => void) => void;
  closePalette: () => void;
  setQuery: (query: string) => void;
  registerProvider: (provider: PaletteProvider) => void;
  unregisterProvider: (prefix: string) => void;
}

export const usePaletteStore = create<PaletteStore>((set) => ({
  isOpen: false,
  query: '>',
  providers: {},

  isQuickPick: false,
  quickPickItems: [],
  quickPickItemsGenerator: null,
  quickPickPlaceholder: '',
  onQuickPickSelect: null,

  isInputBox: false,
  inputBoxPlaceholder: '',
  onInputBoxSubmit: null,

  openPalette: (initialQuery = '>') => set({ 
    isOpen: true, 
    query: initialQuery, 
    isQuickPick: false,
    isInputBox: false
  }),

  openQuickPick: (placeholder, items, onSelect) => set({
    isOpen: true, 
    query: '', 
    isQuickPick: true, 
    isInputBox: false,

    quickPickItems: Array.isArray(items) ? items : [], 
    quickPickItemsGenerator: typeof items === 'function' ? items : null,
    quickPickPlaceholder: placeholder, 
    onQuickPickSelect: onSelect
  }),

  openInputBox: (placeholder, onSubmit) => set({
    isOpen: true,
    query: '',
    isQuickPick: false,
    isInputBox: true,
    inputBoxPlaceholder: placeholder,
    onInputBoxSubmit: onSubmit
  }),

  closePalette: () => set({ 
    isOpen: false, 
    isQuickPick: false, 
    isInputBox: false,
    onQuickPickSelect: null,
    onInputBoxSubmit: null,
    quickPickItemsGenerator: null 
  }),

  setQuery: (query) => set({ query }),

  registerProvider: (provider) => set((state) => ({
    providers: { ...state.providers, [provider.prefix]: provider }
  })),

  unregisterProvider: (prefix) => set((state) => {
    const newProviders = { ...state.providers };
    delete newProviders[prefix];
    return { providers: newProviders };
  })
}));