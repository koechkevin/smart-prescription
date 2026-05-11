import { create } from 'zustand';
import { templateApi } from '../services/api';
import type { PrescriptionTemplate } from '../types';

interface TemplateState {
  templates: PrescriptionTemplate[];
  total: number;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  filters: {
    search?: string;
    icd_code?: string;
    visibility?: string;
  };
  setFilters: (filters: Partial<TemplateState['filters']>) => void;
  setPage: (page: number) => void;
  fetchTemplates: () => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: [],
  total: 0,
  loading: false,
  error: null,
  page: 1,
  limit: 20,
  filters: {},

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters }, page: 1 });
    get().fetchTemplates();
  },

  setPage: (page) => {
    set({ page });
    get().fetchTemplates();
  },

  fetchTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const { page, limit, filters } = get();
      const res = await templateApi.list({ page, limit, ...filters });
      set({ templates: res.data, total: res.pagination?.total || 0, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch templates', loading: false });
    }
  },

  deleteTemplate: async (id: string) => {
    await templateApi.delete(id);
    get().fetchTemplates();
  },
}));
