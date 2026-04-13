import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { StatistiqueState, SectionStatFilter, ChartType, SectionStatRow } from './StatiTypes';

const initialState: StatistiqueState = {
  rows:    [],
  total:   0,
  loading: false,
  error:   null,
  filter: {
    dateDebut: new Date().toISOString().slice(0, 10),
    dateFin:   new Date().toISOString().slice(0, 10),
  },
  chartType: 'bar',
};

const statSlice = createSlice({
  name: 'stat',
  initialState,
  reducers: {
    // ── Actions déclenchées par les composants (interceptées par Saga) ──
    fetchSectionStats(_state, _action: PayloadAction<SectionStatFilter>) {},
    exportStatsCsv(_state, _action: PayloadAction<SectionStatFilter>) {},

    // ── Actions appelées par Saga pour mettre à jour le state ──
    setFilter(state, action: PayloadAction<Partial<SectionStatFilter>>) {
      state.filter = { ...state.filter, ...action.payload };
    },
    setChartType(state, action: PayloadAction<ChartType>) {
      state.chartType = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setRows(state, action: PayloadAction<{ rows: SectionStatRow[]; total: number }>) {
      state.rows    = action.payload.rows;
      state.total   = action.payload.total;
      state.loading = false;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error   = action.payload;
      state.loading = false;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  fetchSectionStats,
  exportStatsCsv,
  setFilter,
  setChartType,
  setLoading,
  setRows,
  setError,
  clearError,
} = statSlice.actions;

export default statSlice.reducer;