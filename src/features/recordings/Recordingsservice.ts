import axiosInstance from '../../services/axiosInstance';

import type {
  RecordingsSearchRequest,
  RecordingsSearchResponse,

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




// ─── View Configs ─────────────────────────────────────────────────────────────

const RECORDING_VIEW_GROUPE = 1   // ← ajouter cette constante

export const fetchViewConfigs = async (): Promise<ViewConfig[]> => {
  const { data } = await axiosInstance.get('/viewconfigs', {
    params: { groupe: RECORDING_VIEW_GROUPE }   // ← filtre groupe=1
  });
  return data;
};

export const createViewConfig = async (
  dto: CreateViewConfigDto
): Promise<ViewConfig> => {
  const { data } = await axiosInstance.post('/viewconfigs', {
    ...dto,
    groupe: RECORDING_VIEW_GROUPE,   // ← stamp groupe=1 à la création
  });
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