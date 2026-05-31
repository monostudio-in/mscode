import { create } from 'zustand';
import * as monaco from 'monaco-editor';
import { msEvents } from '@/core/extensionAPI/events/EventManager';

interface ProblemsState {
  markers: monaco.editor.IMarker[];
  setMarkers: (markers: monaco.editor.IMarker[]) => void;
  clearMarkers: () => void;

  showErrors: boolean;
  showWarnings: boolean;
  showInfos: boolean;
  toggleErrors: () => void;
  toggleWarnings: () => void;
  toggleInfos: () => void;

  filterText: string;
  setFilterText: (t: string) => void;

  showExcludeInput: boolean;
  showIncludeInput: boolean;
  excludeFilter: string;
  includeFilter: string;
  toggleExcludeInput: () => void;
  toggleIncludeInput: () => void;
  setExcludeFilter: (v: string) => void;
  setIncludeFilter: (v: string) => void;

  getFilteredMarkers: () => monaco.editor.IMarker[];
}

export const useProblemsStore = create<ProblemsState>((set, get) => ({
  markers: [],
  showErrors: true,
  showWarnings: true,
  showInfos: true,
  filterText: '',
  showExcludeInput: false,
  showIncludeInput: false,
  excludeFilter: '',
  includeFilter: '',

  setMarkers: (markers) => {
    set({ markers });
    msEvents.emit('onDidChangeDiagnostics', markers);
  },
  
  clearMarkers: () => {
    set({ markers: [] });
    msEvents.emit('onDidChangeDiagnostics', []);
  },

  toggleErrors: () => set((s) => ({ showErrors: !s.showErrors })),
  toggleWarnings: () => set((s) => ({ showWarnings: !s.showWarnings })),
  toggleInfos: () => set((s) => ({ showInfos: !s.showInfos })),

  setFilterText: (filterText) => set({ filterText }),
  toggleExcludeInput: () => set((s) => ({ showExcludeInput: !s.showExcludeInput })),
  toggleIncludeInput: () => set((s) => ({ showIncludeInput: !s.showIncludeInput })),
  setExcludeFilter: (excludeFilter) => set({ excludeFilter }),
  setIncludeFilter: (includeFilter) => set({ includeFilter }),

  getFilteredMarkers: () => {
    const { markers, showErrors, showWarnings, showInfos, filterText, excludeFilter, includeFilter } = get();

    return markers.filter((m) => {
      if (m.severity === monaco.MarkerSeverity.Error && !showErrors) return false;
      if (m.severity === monaco.MarkerSeverity.Warning && !showWarnings) return false;
      if (m.severity === monaco.MarkerSeverity.Info && !showInfos) return false;

      const path = m.resource.path.toLowerCase();

      if (includeFilter.trim()) {
        const patterns = includeFilter.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
        if (!patterns.some((p) => path.includes(p) || matchGlob(path, p))) return false;
      }
      if (excludeFilter.trim()) {
        const patterns = excludeFilter.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
        if (patterns.some((p) => path.includes(p) || matchGlob(path, p))) return false;
      }
      if (filterText.trim()) {
        const q = filterText.toLowerCase();
        return m.message.toLowerCase().includes(q) || path.includes(q);
      }
      return true;
    });
  },
}));

function matchGlob(str: string, pattern: string): boolean {
  const re = new RegExp('^' + pattern.replace(/\*\*/g, '§').replace(/\*/g, '[^/]*').replace(/§/g, '.*') + '$');
  return re.test(str);
}