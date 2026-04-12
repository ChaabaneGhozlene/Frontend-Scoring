import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserDashboardConfig, WidgetInstance, ChartType, StatFilter } from './Statistiquetypes';
import { v4 as uuid } from 'uuid';

interface DashboardBuilderState {
  config:      UserDashboardConfig | null;
  editMode:    boolean;
  loading:     boolean;
  saveLoading: boolean;
  error:       string | null;
}

const initialState: DashboardBuilderState = {
  config:      null,
  editMode:    false,
  loading:     false,
  saveLoading: false,
  error:       null,
};

// ✅ Helper : aujourd'hui en ISO, réutilisé partout
function todayISO() {
  return new Date().toISOString();
}

const dashboardBuilderSlice = createSlice({
  name: 'dashboardBuilder',
  initialState,
  reducers: {
    loadConfigRequest(state) {
      state.loading = true;
      state.error   = null;
    },

    // ✅ FIX : quand la config arrive, injecter les dates du jour
    //    sur tous les widgets qui ont des filtres vides
    loadConfigSuccess(state, action: PayloadAction<UserDashboardConfig>) {
  state.loading = false;
  const today   = todayISO();
  state.config  = {
    ...action.payload,
    widgets: action.payload.widgets.map(w => ({
      ...w,
      filters: {
        dateFrom:       w.filters.dateFrom       || today,
        dateTo:         w.filters.dateTo         || today,
        allSupervisors: w.filters.allSupervisors ?? true,   // ✅ ajouté
        sortDirection:  w.filters.sortDirection  ?? 'Descending', // ✅ ajouté
      },
    })),
  };
},

    loadConfigFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error   = action.payload;
    },

    saveConfigRequest(state) {
      state.saveLoading = true;
    },
    saveConfigSuccess(state) {
      state.saveLoading = false;
      state.editMode    = false;
    },
    saveConfigFailure(state, action: PayloadAction<string>) {
      state.saveLoading = false;
      state.error       = action.payload;
    },

    toggleEditMode(state) {
      state.editMode = !state.editMode;
    },

    // ✅ FIX : les nouveaux widgets ont aussi les dates du jour
    // ✅ FIX : les nouveaux widgets ont aussi les dates du jour
addWidget(state, action: PayloadAction<{ widgetType: WidgetInstance['widgetType'] }>) {
  if (!state.config) return;
  const today = todayISO();
  const newWidget: WidgetInstance = {
    id:         uuid(),
    widgetType: action.payload.widgetType,
    chartType:  'Bar',
    filters: {
      dateFrom:       today,
      dateTo:         today,
      allSupervisors: true,          // ✅ ajouté
      sortDirection:  'Descending',  // ✅ ajouté
    },
    size:     'medium',
    position: { x: 0, y: 0, w: 6, h: 4 },
  };
  state.config.widgets.push(newWidget);
},

    removeWidget(state, action: PayloadAction<string>) {
      if (!state.config) return;
      state.config.widgets = state.config.widgets.filter(w => w.id !== action.payload);
    },

    updateWidget(state, action: PayloadAction<Partial<WidgetInstance> & { id: string }>) {
      if (!state.config) return;
      const idx = state.config.widgets.findIndex(w => w.id === action.payload.id);
      if (idx !== -1) state.config.widgets[idx] = { ...state.config.widgets[idx], ...action.payload };
    },

    updateWidgetFilter(state, action: PayloadAction<{ id: string; filters: StatFilter }>) {
      if (!state.config) return;
      const w = state.config.widgets.find(w => w.id === action.payload.id);
      if (w) w.filters = action.payload.filters;
    },

    updateWidgetChartType(state, action: PayloadAction<{ id: string; chartType: ChartType }>) {
      if (!state.config) return;
      const w = state.config.widgets.find(w => w.id === action.payload.id);
      if (w) w.chartType = action.payload.chartType;
    },

    reorderWidgets(state, action: PayloadAction<WidgetInstance[]>) {
      if (!state.config) return;
      state.config.widgets = action.payload;
    },
  },
});

export const {
  loadConfigRequest, loadConfigSuccess, loadConfigFailure,
  saveConfigRequest, saveConfigSuccess, saveConfigFailure,
  toggleEditMode, addWidget, removeWidget,
  updateWidget, updateWidgetFilter, updateWidgetChartType, reorderWidgets,
} = dashboardBuilderSlice.actions;

export default dashboardBuilderSlice.reducer;