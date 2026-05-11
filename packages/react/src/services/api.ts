import axios, { AxiosInstance } from 'axios';
import type { PrescriptionTemplate, DrugCatalogItem, ICD11Result, PrescriptionData } from '../types';

let apiInstance: AxiosInstance | null = null;

export function initApi(baseUrl: string, token: string) {
  apiInstance = axios.create({
    baseURL: baseUrl,
    headers: { Authorization: `Bearer ${token}` },
  });
  apiInstance.interceptors.response.use(
    (res) => res.data,
    (err) => Promise.reject(err.response?.data || err)
  );
}

function getApi(): AxiosInstance {
  if (!apiInstance) throw new Error('API not initialized. Call initApi first.');
  return apiInstance;
}

export const templateApi = {
  list: (params?: Record<string, any>) =>
    getApi().get<any, { success: boolean; data: PrescriptionTemplate[]; pagination: any }>('/api/templates', { params }),

  get: (id: string) =>
    getApi().get<any, { success: boolean; data: PrescriptionTemplate }>(`/api/templates/${id}`),

  create: (data: any) =>
    getApi().post<any, { success: boolean; data: PrescriptionTemplate }>('/api/templates', data),

  update: (id: string, data: any) =>
    getApi().put<any, { success: boolean; data: PrescriptionTemplate }>(`/api/templates/${id}`, data),

  delete: (id: string) =>
    getApi().delete<any, { success: boolean }>(`/api/templates/${id}`),

  use: (id: string) =>
    getApi().get<any, { success: boolean; data: PrescriptionData }>(`/api/templates/${id}/use`),
};

export const drugApi = {
  search: (q: string, limit = 20) =>
    getApi().get<any, { success: boolean; data: { drugs: DrugCatalogItem[] } }>('/api/drugs/search', { params: { q, limit } }),

  sync: () =>
    getApi().post<any, { success: boolean; data: { added: number; updated: number; pages: number }; message: string }>('/api/drugs/sync'),
};

export const icdApi = {
  search: (q: string) =>
    getApi().get<any, { success: boolean; data: { results: ICD11Result[] } }>('/api/icd/search', { params: { q } }),
};
