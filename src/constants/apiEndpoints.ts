export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',

  // Recordings
  RECORDS_SEARCH: '/records/search',
  RECORDS_EXPORT: '/records/export',
  RECORD_BY_ID: (id: number) => `/records/${id}`,
  RECORD_REQUALIFY: '/records/requalify',

  // Filters
  FILTERS: '/filters',
  FILTER_BY_ID: (id: number) => `/filters/${id}`,

  // View Configs
  VIEW_CONFIGS: '/viewconfigs',
  VIEW_CONFIG_BY_ID: (id: number) => `/viewconfigs/${id}`,

  // Evaluation
  EVALUATION_INIT: '/evaluation/init',
  EVALUATION_SAVE: '/evaluation/save',

  // Files
  FILE_AUDIO: (recordId: number) => `/files/audio/${recordId}`,
  FILE_SCREEN: (recordId: number) => `/files/screen/${recordId}`,
} as const;