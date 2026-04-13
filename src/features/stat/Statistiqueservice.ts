import axiosInstance from '../../services/axiosInstance';
import type { SectionStatFilter, SectionStatResponse } from './StatiTypes';

const BASE = '/statistique/sectionstat'; // ✅ sans /api — déjà dans baseURL de axiosInstance

export const statistiqueService = {
  search: async (filter: SectionStatFilter): Promise<SectionStatResponse> => {
    const { data } = await axiosInstance.post<SectionStatResponse>(`${BASE}/search`, filter);
    return data;
  },

  exportCsv: async (filter: SectionStatFilter): Promise<void> => {
    const response = await axiosInstance.post(`${BASE}/export`, filter, {
      responseType: 'blob',
      params: { format: 'csv' },
    });
    const url  = window.URL.createObjectURL(new Blob([response.data]));
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'SectionStats.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  },
};