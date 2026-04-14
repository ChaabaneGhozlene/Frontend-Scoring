import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  AgentDto, CampaignDto, ExportPayload, FetchAgentsPayload,
  FetchCampaignsPayload, FetchStatistiquePayload, MeasureKey,
  PivotZones, StatistiqueFilterDto, StatistiqueRowViewModel,
  SectionStatState, // ✅ renommé
} from "./StatiTypes";

const ALL_DIM_KEYS = [
  "agent","auditor","campaign","monthYear","year","weekYear","section","question",
];

const initialFilter: StatistiqueFilterDto = {
  dateDebut: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10),
  dateFin: new Date().toISOString().slice(0, 10),
  agentId: null,
  campaignId: null,
  auditorId: null,
  allSupervisors: true,
  userId: 0,
  siteId: 0,
  userRole: 1,
};

const initialState: SectionStatState = { // ✅ renommé
  data: [],
  agents: [],
  campaigns: [],
  filters: initialFilter,
  zones: {
    rows: ["agent"],
    cols: ["monthYear"],
    available: ALL_DIM_KEYS.filter((k) => k !== "agent" && k !== "monthYear"),
  },
  measure: "score",
  loading: false,
  loadingAgents: false,
  loadingCampaigns: false,
  error: null,
  exportLoading: false,
};

const sectionStatSlice = createSlice({
  name: "sectionStat", // ✅ renommé
  initialState,
  reducers: {
    fetchDataRequest(state, _action: PayloadAction<FetchStatistiquePayload>) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<StatistiqueRowViewModel[]>) {
      state.loading = false;
      state.data = action.payload;
    },
    fetchDataFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchAgentsRequest(state, _action: PayloadAction<FetchAgentsPayload>) {
      state.loadingAgents = true;
    },
    fetchAgentsSuccess(state, action: PayloadAction<AgentDto[]>) {
      state.loadingAgents = false;
      state.agents = action.payload;
    },
    fetchAgentsFailure(state, action: PayloadAction<string>) {
      state.loadingAgents = false;
      state.error = action.payload;
    },
    fetchCampaignsRequest(state, _action: PayloadAction<FetchCampaignsPayload>) {
      state.loadingCampaigns = true;
    },
    fetchCampaignsSuccess(state, action: PayloadAction<CampaignDto[]>) {
      state.loadingCampaigns = false;
      state.campaigns = action.payload;
    },
    fetchCampaignsFailure(state, action: PayloadAction<string>) {
      state.loadingCampaigns = false;
      state.error = action.payload;
    },
    exportRequest(state, _action: PayloadAction<ExportPayload>) {
      state.exportLoading = true;
    },
    exportSuccess(state) {
      state.exportLoading = false;
    },
    exportFailure(state, action: PayloadAction<string>) {
      state.exportLoading = false;
      state.error = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<StatistiqueFilterDto>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setMeasure(state, action: PayloadAction<MeasureKey>) {
      state.measure = action.payload;
    },
    setZones(state, action: PayloadAction<PivotZones>) {
      state.zones = action.payload;
    },
    moveField(
      state,
      action: PayloadAction<{ field: string; fromZone: keyof PivotZones; toZone: keyof PivotZones }>
    ) {
      const { field, fromZone, toZone } = action.payload;
      if (fromZone === toZone) return;
      state.zones[fromZone] = state.zones[fromZone].filter((f) => f !== field);
      if (!state.zones[toZone].includes(field)) {
        state.zones[toZone] = [...state.zones[toZone], field];
      }
    },
    removeFieldFromZone(
      state,
      action: PayloadAction<{ field: string; zone: "rows" | "cols" }>
    ) {
      const { field, zone } = action.payload;
      state.zones[zone] = state.zones[zone].filter((f) => f !== field);
      if (!state.zones.available.includes(field)) {
        state.zones.available = [...state.zones.available, field];
      }
    },
    resetError(state) {
      state.error = null;
    },
  },
});

export const {
  fetchDataRequest,
  fetchDataSuccess,
  fetchDataFailure,
  fetchAgentsRequest,
  fetchAgentsSuccess,
  fetchAgentsFailure,
  fetchCampaignsRequest,
  fetchCampaignsSuccess,
  fetchCampaignsFailure,
  exportRequest,
  exportSuccess,
  exportFailure,
  setFilters,
  setMeasure,
  setZones,
  moveField,
  removeFieldFromZone,
  resetError,
} = sectionStatSlice.actions;

export default sectionStatSlice.reducer;