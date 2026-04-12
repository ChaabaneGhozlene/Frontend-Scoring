import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  AgentListItem, AgentScoreItem, ChartType, CoachingAnalysisItem,
  CoachingSheetItem, CoachingSummaryItem, ProgramLevelItem, SectionStatItem,
  SortDirection, StatFilter, StatistiqueState, ExportRequest,
  FetchAgentScoresPayload, FetchAgentListPayload, FetchCoachingPayload,
  FetchProgramLevelPayload, FetchSectionStatsPayload, ExportPayload,
} from "./Statistiquetypes";

const today = new Date().toISOString().split('T')[0];

const initialState: StatistiqueState = {
  sectionStats:     [],
  agentScores:      [],
  programLevel:     [],
  coachingSheet:    [],
  coachingAnalysis: [],
  coachingSummary:  [],
  agentList:        [],
  loading:          false,
  exportLoading:    false,
  error:            null,
  filter: {
    dateFrom:       today,
    dateTo:         today,
    allSupervisors: true,          // ✅ ajouté
    sortDirection:  'Descending',  // ✅ ajouté
  },  selectedAgentId:  null,
  allSupervisors:   true,
  sortDirection:    'Descending',
  chartType:        'Bar',
};

const statistiqueSlice = createSlice({
  name: 'statistique',
  initialState,
  reducers: {

    // ─── Filter actions ──────────────────────────────────────────────────
    setFilter(state, action: PayloadAction<StatFilter>) {
      state.filter = action.payload;
    },
    setSelectedAgent(state, action: PayloadAction<number | null>) {
      state.selectedAgentId = action.payload;
    },
    setAllSupervisors(state, action: PayloadAction<boolean>) {
      state.allSupervisors = action.payload;
    },
    setSortDirection(state, action: PayloadAction<SortDirection>) {
      state.sortDirection = action.payload;
    },
    setChartType(state, action: PayloadAction<ChartType>) {
      state.chartType = action.payload;
    },

    // ─── Section Stats ───────────────────────────────────────────────────
    fetchSectionStatsRequest(state, _action: PayloadAction<FetchSectionStatsPayload>) {
      state.loading = true;
      state.error   = null;
    },
    fetchSectionStatsSuccess(state, action: PayloadAction<SectionStatItem[]>) {
      state.loading      = false;
      state.sectionStats = action.payload;
    },
    fetchSectionStatsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error   = action.payload;
    },

    // ─── Agent Scores ────────────────────────────────────────────────────
    fetchAgentScoresRequest(state, _action: PayloadAction<FetchAgentScoresPayload>) {
      state.loading = true;
      state.error   = null;
    },
    fetchAgentScoresSuccess(state, action: PayloadAction<AgentScoreItem[]>) {
      state.loading     = false;
      state.agentScores = action.payload;
    },
    fetchAgentScoresFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error   = action.payload;
    },

    // ─── Program Level ───────────────────────────────────────────────────
    fetchProgramLevelRequest(state, _action: PayloadAction<FetchProgramLevelPayload>) {
      state.loading = true;
      state.error   = null;
    },
    fetchProgramLevelSuccess(state, action: PayloadAction<ProgramLevelItem[]>) {
      state.loading      = false;
      state.programLevel = action.payload;
    },
    fetchProgramLevelFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error   = action.payload;
    },

    // ─── Coaching Sheet ──────────────────────────────────────────────────
    fetchCoachingSheetRequest(state, _action: PayloadAction<FetchCoachingPayload>) {
      state.loading = true;
      state.error   = null;
    },
    fetchCoachingSheetSuccess(state, action: PayloadAction<CoachingSheetItem[]>) {
      state.loading       = false;
      state.coachingSheet = action.payload;
    },
    fetchCoachingSheetFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error   = action.payload;
    },

    // ─── Coaching Analysis ───────────────────────────────────────────────
    fetchCoachingAnalysisRequest(state, _action: PayloadAction<FetchCoachingPayload>) {
      state.loading = true;
      state.error   = null;
    },
    fetchCoachingAnalysisSuccess(state, action: PayloadAction<CoachingAnalysisItem[]>) {
      state.loading          = false;
      state.coachingAnalysis = action.payload;
    },
    fetchCoachingAnalysisFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error   = action.payload;
    },

    // ─── Coaching Summary ────────────────────────────────────────────────
    fetchCoachingSummaryRequest(state, _action: PayloadAction<FetchCoachingPayload>) {
      state.loading = true;
      state.error   = null;
    },
    fetchCoachingSummarySuccess(state, action: PayloadAction<CoachingSummaryItem[]>) {
      state.loading         = false;
      state.coachingSummary = action.payload;
    },
    fetchCoachingSummaryFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error   = action.payload;
    },

    // ─── Agent List ──────────────────────────────────────────────────────
    fetchAgentListRequest(state, _action: PayloadAction<FetchAgentListPayload>) {
      state.loading = true;
      state.error   = null;
    },
    fetchAgentListSuccess(state, action: PayloadAction<AgentListItem[]>) {
      state.loading   = false;
      state.agentList = action.payload;
    },
    fetchAgentListFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error   = action.payload;
    },

    // ─── Export ──────────────────────────────────────────────────────────
    exportRequest(state, _action: PayloadAction<ExportPayload>) {
      state.exportLoading = true;
      state.error         = null;
    },
    exportSuccess(state) {
      state.exportLoading = false;
    },
    exportFailure(state, action: PayloadAction<string>) {
      state.exportLoading = false;
      state.error         = action.payload;
    },

    // ─── Reset ───────────────────────────────────────────────────────────
    resetStatistique() {
      return initialState;
    },
  },
});

export const {
  setFilter, setSelectedAgent, setAllSupervisors, setSortDirection, setChartType,
  fetchSectionStatsRequest, fetchSectionStatsSuccess, fetchSectionStatsFailure,
  fetchAgentScoresRequest,  fetchAgentScoresSuccess,  fetchAgentScoresFailure,
  fetchProgramLevelRequest, fetchProgramLevelSuccess, fetchProgramLevelFailure,
  fetchCoachingSheetRequest,    fetchCoachingSheetSuccess,    fetchCoachingSheetFailure,
  fetchCoachingAnalysisRequest, fetchCoachingAnalysisSuccess, fetchCoachingAnalysisFailure,
  fetchCoachingSummaryRequest,  fetchCoachingSummarySuccess,  fetchCoachingSummaryFailure,
  fetchAgentListRequest,  fetchAgentListSuccess,  fetchAgentListFailure,
  exportRequest, exportSuccess, exportFailure,
  resetStatistique,
} = statistiqueSlice.actions;

export default statistiqueSlice.reducer;