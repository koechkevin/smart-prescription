import { create } from 'zustand';
import { drugApi } from '../services/api';
import type { DrugCatalogItem } from '../types';

interface DrugSearchState {
  results: DrugCatalogItem[];
  searching: boolean;
  searchDrugs: (query: string) => Promise<void>;
  clear: () => void;
}

export const useDrugSearchStore = create<DrugSearchState>((set) => ({
  results: [],
  searching: false,

  searchDrugs: async (query: string) => {
    if (query.length < 2) {
      set({ results: [] });
      return;
    }
    set({ searching: true });
    try {
      const res = await drugApi.search(query);
      set({ results: res.data.drugs, searching: false });
    } catch {
      set({ results: [], searching: false });
    }
  },

  clear: () => set({ results: [] }),
}));
