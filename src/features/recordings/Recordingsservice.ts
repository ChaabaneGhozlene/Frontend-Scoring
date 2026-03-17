import axiosInstance from '../../services/axiosInstance';

import type {
  RecordingsSearchRequest,
  RecordingsSearchResponse,
  UserFilter,
  CreateFilterDto,
  ViewConfig,
  CreateViewConfigDto,
} from './Recordingstypes';

// ─── Records ──────────────────────────────────────────────────────────────────

export const searchRecordings = async (
  params: RecordingsSearchRequest
): Promise<RecordingsSearchResponse> => {
  const { data } = await axiosInstance.post('/records/search', params);
  return data;
};

export const exportRecordings = async (
  params: RecordingsSearchRequest
): Promise<Blob> => {
  const { data } = await axiosInstance.post('/records/export', params, {
    responseType: 'blob',
  });
  return data;
};


export const deleteRecording = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/records/${id}`);
};



// ─── Filters ──────────────────────────────────────────────────────────────────

export const fetchFilters = async (): Promise<UserFilter[]> => {
  const { data } = await axiosInstance.get('/filters');
  return data;
};

export const createFilter = async (
  dto: CreateFilterDto
): Promise<UserFilter> => {
  const { data } = await axiosInstance.post('/filters', dto);
  return data;
};

export const deleteFilter = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/filters/${id}`);
};

// ─── View Configs ─────────────────────────────────────────────────────────────

export const fetchViewConfigs = async (): Promise<ViewConfig[]> => {
  const { data } = await axiosInstance.get('/viewconfigs');
  return data;
};

export const createViewConfig = async (
  dto: CreateViewConfigDto
): Promise<ViewConfig> => {
  const { data } = await axiosInstance.post('/viewconfigs', dto);
  return data;
};

export const updateViewConfig = async (
  id: number,
  layoutJson: string
): Promise<ViewConfig> => {
  const { data } = await axiosInstance.put(`/viewconfigs/${id}`, { layoutJson });
  return data;
};

export const deleteViewConfig = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/viewconfigs/${id}`);
};
