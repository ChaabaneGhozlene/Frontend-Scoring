import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  RecordingsState,
  Recording,
  UserFilter,
  ViewConfig,
  ColumnFilter,
  FetchRecordingsPayload,
  CreateFilterPayload,
  SaveViewConfigPayload,
  UpdateViewConfigPayload,
} from './Recordingstypes';

const today = new Date().toISOString().split('T')[0];

const initialState: RecordingsState = {
  records:              [],
  totalCount:           0,
  page:                 1,
  pageSize:             15,
  loading:              false,
  error:                null,

  columnFilters:        [],   // ← AJOUT

  filters:              [],
  filtersLoading:       false,
  selectedFilterId:     null,

  viewConfigs:          [],
  viewConfigsLoading:   false,
  selectedViewConfigId: null,

  dateDebut:            today,
  dateFin:              today,
};

const recordingsSlice = createSlice({
  name: 'recordings',
  initialState,
  reducers: {

    fetchRecordingsRequest(state, _action: PayloadAction<FetchRecordingsPayload>) {
      state.loading = true;
      state.error   = null;
    },
    fetchRecordingsSuccess(
      state,
      action: PayloadAction<{ data: Recording[]; totalCount: number; page: number; pageSize: number }>
    ) {
      state.loading    = false;
      state.records    = action.payload.data;
      state.totalCount = action.payload.totalCount;
      state.page       = action.payload.page;
      state.pageSize   = action.payload.pageSize;
    },
    fetchRecordingsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error   = action.payload;
    },

    // ── AJOUT : persistance des filtres colonnes ──────────────────────────
    setColumnFilters(state, action: PayloadAction<ColumnFilter[]>) {
      state.columnFilters = action.payload;
    },

    setStartDate(state, action: PayloadAction<string>) {
      state.dateDebut = action.payload;
    },
    setEndDate(state, action: PayloadAction<string>) {
      state.dateFin = action.payload;
    },
    resetDates(state) {
      const todayStr  = new Date().toISOString().split('T')[0];
      state.dateDebut = todayStr;
      state.dateFin   = todayStr;
    },
    setSelectedFilterId(state, action: PayloadAction<number | null>) {
      state.selectedFilterId = action.payload;
    },
    setSelectedViewConfigId(state, action: PayloadAction<number | null>) {
      state.selectedViewConfigId = action.payload;
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload;
    },

    fetchFiltersRequest(state) { state.filtersLoading = true; },
    fetchFiltersSuccess(state, action: PayloadAction<UserFilter[]>) {
      state.filtersLoading = false;
      state.filters        = action.payload;
    },
    fetchFiltersFailure(state, action: PayloadAction<string>) {
      state.filtersLoading = false;
      state.error          = action.payload;
    },
    createFilterRequest(state, _action: PayloadAction<CreateFilterPayload>) {
      state.filtersLoading = true;
    },
    createFilterSuccess(state, action: PayloadAction<UserFilter>) {
      state.filtersLoading = false;
      state.filters.push(action.payload);
    },
    createFilterFailure(state, action: PayloadAction<string>) {
      state.filtersLoading = false;
      state.error          = action.payload;
    },
    deleteFilterRequest(state, _action: PayloadAction<number>) {
      state.filtersLoading = true;
    },
    deleteFilterSuccess(state, action: PayloadAction<number>) {
      state.filtersLoading   = false;
      state.filters          = state.filters.filter((f) => f.id !== action.payload);
      if (state.selectedFilterId === action.payload) state.selectedFilterId = null;
    },
    deleteFilterFailure(state, action: PayloadAction<string>) {
      state.filtersLoading = false;
      state.error          = action.payload;
    },

    fetchViewConfigsRequest(state) { state.viewConfigsLoading = true; },
    fetchViewConfigsSuccess(state, action: PayloadAction<ViewConfig[]>) {
      state.viewConfigsLoading = false;
      state.viewConfigs        = action.payload;
    },
    fetchViewConfigsFailure(state, action: PayloadAction<string>) {
      state.viewConfigsLoading = false;
      state.error              = action.payload;
    },
    saveViewConfigRequest(state, _action: PayloadAction<SaveViewConfigPayload>) {
      state.viewConfigsLoading = true;
    },
    saveViewConfigSuccess(state, action: PayloadAction<ViewConfig>) {
      state.viewConfigsLoading = false;
      state.viewConfigs.push(action.payload);
    },
    saveViewConfigFailure(state, action: PayloadAction<string>) {
      state.viewConfigsLoading = false;
      state.error              = action.payload;
    },
    updateViewConfigRequest(state, _action: PayloadAction<UpdateViewConfigPayload>) {
      state.viewConfigsLoading = true;
    },
    updateViewConfigSuccess(state, action: PayloadAction<ViewConfig>) {
      state.viewConfigsLoading = false;
      const idx = state.viewConfigs.findIndex((v) => v.id === action.payload.id);
      if (idx !== -1) state.viewConfigs[idx] = action.payload;
    },
    updateViewConfigFailure(state, action: PayloadAction<string>) {
      state.viewConfigsLoading = false;
      state.error              = action.payload;
    },
    deleteViewConfigRequest(state, _action: PayloadAction<number>) {
      state.viewConfigsLoading = true;
    },
    deleteViewConfigSuccess(state, action: PayloadAction<number>) {
      state.viewConfigsLoading = false;
      state.viewConfigs        = state.viewConfigs.filter((v) => v.id !== action.payload);
      if (state.selectedViewConfigId === action.payload) state.selectedViewConfigId = null;
    },
    deleteViewConfigFailure(state, action: PayloadAction<string>) {
      state.viewConfigsLoading = false;
      state.error              = action.payload;
    },
    
  },
});

export const {
  fetchRecordingsRequest,
  fetchRecordingsSuccess,
  fetchRecordingsFailure,
  setColumnFilters,       // ← AJOUT export
  setStartDate,
  setEndDate,
  resetDates,
  setSelectedFilterId,
  setSelectedViewConfigId,
  setPageSize,
  fetchFiltersRequest,
  fetchFiltersSuccess,
  fetchFiltersFailure,
  createFilterRequest,
  createFilterSuccess,
  createFilterFailure,
  deleteFilterRequest,
  deleteFilterSuccess,
  deleteFilterFailure,
  fetchViewConfigsRequest,
  fetchViewConfigsSuccess,
  fetchViewConfigsFailure,
  saveViewConfigRequest,
  saveViewConfigSuccess,
  saveViewConfigFailure,
  updateViewConfigRequest,
  updateViewConfigSuccess,
  updateViewConfigFailure,
  deleteViewConfigRequest,
  deleteViewConfigSuccess,
  deleteViewConfigFailure,
} = recordingsSlice.actions;

export default recordingsSlice.reducer;