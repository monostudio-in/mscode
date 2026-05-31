// src/features/editor/components/BreadCrumb/store/breadcrumbStore.ts
import { create } from 'zustand';

export interface BreadcrumbItem {
  name: string;
  kind: 'file' | 'symbol';
  symbolKind?: number; // From SymbolKind enum 
  range?: any;
}

interface BreadcrumbState {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
}

export const useBreadcrumbStore = create<BreadcrumbState>((set) => ({
  breadcrumbs: [],
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
}));