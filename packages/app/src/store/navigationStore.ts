// src/store/navigationStore.ts
import { create } from 'zustand';

interface NavigationState {
  pendingNavigation: { path: string; line: number; column: number; timestamp: number } | null;
  setNavigation: (path: string, line: number, column: number) => void;
  clearNavigation: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  pendingNavigation: null,
  setNavigation: (path, line, column) => set({ 
    pendingNavigation: { path, line, column, timestamp: Date.now() } 
  }),
  clearNavigation: () => set({ pendingNavigation: null }),
}));