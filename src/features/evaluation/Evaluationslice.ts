// ============================================================
// Evaluation Slice — Redux
// ============================================================
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  EvaluationState, LsFicheDto, LsSurveyDto,
  SurveyItemDto, AgentReportDto,
  UpdateSurveyDto,
  EvaluationFilterDto,
  CreateEvalFilterAndApplyPayload,
  EvalViewConfig,
  UpdateEvalViewConfigPayload,
  CreateEvalViewConfigDto,
  ColumnFilter,
} from './Evaluationtypes'

const today = new Date()
const toStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

const initialState: EvaluationState = {
  fiches:          [],
  totalCount:      0,
  loading:         false,
  error:           null,
  page:            1,
  pageSize:        10,
  dateDebut:       toStr(today),
  dateFin:         toStr(today),
  selectedFilterId: null,

columnFilters: [] as ColumnFilter[],
  // FIX: flag pour signaler au toolbar qu'un fetch doit être déclenché après création
  pendingApplyFilter: false,

  // ── Selected row (for header buttons) ──
  selectedRow:      null,
  openDeleteModal:  false,
  openReportModal:  false,

  selectedFicheId: null,
  surveys:         [],
  surveysLoading:  false,
  surveysError:    null,

  selectedSurveyId: null,
  surveyItems:      [],
  itemsLoading:     false,
  itemsError:       null,
  updateLoading:    false,
  updateError:      null,

  agentReport:        null,
  agentReportLoading: false,
  agentReportError:   null,

  deleteLoading: false,
  deleteError:   null,

  // Filtres
  filters:          [],
  filtersLoading:   false,
  filtersError:     null,

   // ── Vues ──
  viewConfigs:          [],
  viewConfigsLoading:   false,
  selectedViewConfigId: null,
}

// ── Payload shapes ────────────────────────────────────────
export interface FetchFichesPayload {
  dateDebut?:     string | null
  dateFin?:       string | null
  filterId?:      number | null
  page:           number
  pageSize:       number
columnFilters?: ColumnFilter[]
}

export interface FetchFichesSuccessPayload {
  items:      LsFicheDto[]
  totalCount: number
  page:       number
  pageSize:   number
}

// FIX: payload enrichi pour createEvalFilterSuccess
export interface CreateEvalFilterSuccessPayload {
  filter:     EvaluationFilterDto
  applyAfter: boolean
}

const evaluationSlice = createSlice({
  name: 'evaluation',
  initialState,
  reducers: {
    // ── List ──
    setStartDate:  (s, a: PayloadAction<string>) => { s.dateDebut = a.payload },
    setEndDate:    (s, a: PayloadAction<string>) => { s.dateFin   = a.payload },
    setPageSize:   (s, a: PayloadAction<number>) => { s.pageSize  = a.payload },
    setSelectedFilterId: (s, a: PayloadAction<number | null>) => {
      s.selectedFilterId  = a.payload
      s.page               = 1    
      s.pendingApplyFilter = false  // reset à chaque sélection manuelle
    },

    // FIX: permet au toolbar de réinitialiser le flag après avoir déclenché le fetch
    clearPendingApplyFilter: (s) => { s.pendingApplyFilter = false },

    fetchFichesRequest: (s, _a: PayloadAction<FetchFichesPayload>) => {
      s.loading = true; s.error = null
    },
    fetchFichesSuccess: (s, a: PayloadAction<FetchFichesSuccessPayload>) => {
      s.loading    = false
      s.fiches     = a.payload.items
      s.totalCount = a.payload.totalCount
      s.page       = a.payload.page
      s.pageSize   = a.payload.pageSize
    },
    fetchFichesFailure: (s, a: PayloadAction<string>) => {
      s.loading = false; s.error = a.payload
    },

    // ── Selected row (header action buttons) ──
    setSelectedRow: (s, a: PayloadAction<LsFicheDto | null>) => {
      s.selectedRow = a.payload
    },
    triggerDeleteModal: (s) => { s.openDeleteModal = true },
    resetDeleteModal:   (s) => { s.openDeleteModal = false },
    triggerReportModal: (s) => { s.openReportModal = true },
    resetReportModal:   (s) => { s.openReportModal = false },

    // ── Surveys panel ──
    selectFiche: (s, a: PayloadAction<number | null>) => {
      s.selectedFicheId = a.payload
      s.surveys = []; 
      s.surveysError = null
      s.selectedSurveyId = null;
      s.agentReport = null
    },
fetchSurveysRequest: (s, _a: PayloadAction<{ lsId: number; recordDataId: number }>) => {
  s.surveysLoading = true; s.surveysError = null
},
    fetchSurveysSuccess: (s, a: PayloadAction<LsSurveyDto[]>) => {
  s.surveysLoading = false
  s.surveys = a.payload  // ✅ doit écraser, pas append
},
    fetchSurveysFailure: (s, a: PayloadAction<string>) => {
      s.surveysLoading = false; s.surveysError = a.payload
    },

    // ── Items edit ──
    selectSurvey: (s, a: PayloadAction<number | null>) => {
      s.selectedSurveyId = a.payload
      s.surveyItems = []; s.itemsError = null
    },
    fetchItemsRequest: (s, _a: PayloadAction<number>) => {
      s.itemsLoading = true; s.itemsError = null
    },
    fetchItemsSuccess: (s, a: PayloadAction<SurveyItemDto[]>) => {
      s.itemsLoading = false; s.surveyItems = a.payload
    },
    fetchItemsFailure: (s, a: PayloadAction<string>) => {
      s.itemsLoading = false; s.itemsError = a.payload
    },

    updateSurveyRequest: (s, _a: PayloadAction<{ surveyId: number; dto: UpdateSurveyDto }>) => {
      s.updateLoading = true; s.updateError = null
    },
    updateSurveySuccess: (s, a: PayloadAction<LsSurveyDto>) => {
      s.updateLoading = false
      const idx = s.surveys.findIndex(sv => sv.id === a.payload.id)
      if (idx !== -1) s.surveys[idx] = a.payload
    },
    updateSurveyFailure: (s, a: PayloadAction<string>) => {
      s.updateLoading = false; s.updateError = a.payload
    },

    // ── Agent report ──
    fetchAgentReportRequest: (s, _a: PayloadAction<number>) => {
      s.agentReportLoading = true; s.agentReportError = null ;  s.openReportModal    = true   

    },
    fetchAgentReportSuccess: (s, a: PayloadAction<AgentReportDto>) => {
      s.agentReportLoading = false; s.agentReport = a.payload
    },
    fetchAgentReportFailure: (s, a: PayloadAction<string>) => {
      s.agentReportLoading = false; s.agentReportError = a.payload
    },
    clearAgentReport: (s) => { s.agentReport = null },

    // ── Delete survey ──
    deleteSurveyRequest: (s, _a: PayloadAction<number>) => {
      s.deleteLoading = true; s.deleteError = null
    },
    deleteSurveySuccess: (s, a: PayloadAction<number>) => {
      s.deleteLoading = false
      s.surveys = s.surveys.filter(sv => sv.id !== a.payload)
      if (s.selectedSurveyId === a.payload) {
        s.selectedSurveyId = null; s.surveyItems = []
      }
    },
    deleteSurveyFailure: (s, a: PayloadAction<string>) => {
      s.deleteLoading = false; s.deleteError = a.payload
    },

    // ── Delete fiche ──
    deleteFicheRequest: (s, _a: PayloadAction<number>) => {
      s.deleteLoading = true; s.deleteError = null
    },
    deleteFicheSuccess: (s, a: PayloadAction<number>) => {
      s.deleteLoading = false
      s.fiches = s.fiches.filter(f => f.id !== a.payload)
      if (s.selectedFicheId === a.payload) {
        s.selectedFicheId = null; s.surveys = []; s.agentReport = null
      }
      if (s.selectedRow?.id === a.payload) s.selectedRow = null
    },
    deleteFicheFailure: (s, a: PayloadAction<string>) => {
      s.deleteLoading = false; s.deleteError = a.payload
    },

    // ── Filtres évaluation ────────────────────────────────────────────────────
    fetchEvalFiltersRequest: (s) => {
      s.filtersLoading = true; s.filtersError = null
    },
    fetchEvalFiltersSuccess: (s, a: PayloadAction<EvaluationFilterDto[]>) => {
      s.filtersLoading = false; s.filters = a.payload
    },
    fetchEvalFiltersFailure: (s, a: PayloadAction<string>) => {
      s.filtersLoading = false; s.filtersError = a.payload
    },

    createEvalFilterRequest: (s, _a: PayloadAction<CreateEvalFilterAndApplyPayload>) => {
      s.filtersLoading = true; s.filtersError = null
    },

    // FIX: payload enrichi — on stocke applyAfter dans le state pour que
    // le useEffect du toolbar puisse décider de déclencher ou non le fetch
    createEvalFilterSuccess: (s, a: PayloadAction<CreateEvalFilterSuccessPayload>) => {
      s.filtersLoading     = false
      s.filters.push(a.payload.filter)
      s.selectedFilterId   = a.payload.filter.id
      s.pendingApplyFilter = a.payload.applyAfter  // ← clé du fix
    },

    createEvalFilterFailure: (s, a: PayloadAction<string>) => {
      s.filtersLoading = false; s.filtersError = a.payload
    },

    deleteEvalFilterRequest: (s, _a: PayloadAction<number>) => {
      s.filtersLoading = true; s.filtersError = null
    },
    deleteEvalFilterSuccess: (s, a: PayloadAction<number>) => {
      s.filtersLoading = false
      s.filters = s.filters.filter((f) => f.id !== a.payload)
      if (s.selectedFilterId === a.payload) s.selectedFilterId = null
    },
    deleteEvalFilterFailure: (s, a: PayloadAction<string>) => {
      s.filtersLoading = false; s.filtersError = a.payload
    },
    // ── View Configs ──────────────────────────────────────────────────────────
    setSelectedViewConfigId: (s, a: PayloadAction<number | null>) => {
      s.selectedViewConfigId = a.payload
    },

    fetchViewConfigsRequest: (s) => {
      s.viewConfigsLoading = true
    },
    fetchViewConfigsSuccess: (s, a: PayloadAction<EvalViewConfig[]>) => {
      s.viewConfigsLoading = false
      s.viewConfigs        = a.payload
    },
    fetchViewConfigsFailure: (s, a: PayloadAction<string>) => {
      s.viewConfigsLoading = false
      s.error              = a.payload
    },

    saveViewConfigRequest: (s, _a: PayloadAction<CreateEvalViewConfigDto>) => {
      s.viewConfigsLoading = true
    },
    saveViewConfigSuccess: (s, a: PayloadAction<EvalViewConfig>) => {
      s.viewConfigsLoading = false
      s.viewConfigs.push(a.payload)
    },
    saveViewConfigFailure: (s, a: PayloadAction<string>) => {
      s.viewConfigsLoading = false
      s.error              = a.payload
    },

    updateViewConfigRequest: (s, _a: PayloadAction<UpdateEvalViewConfigPayload>) => {
      s.viewConfigsLoading = true
    },
    updateViewConfigSuccess: (s, a: PayloadAction<EvalViewConfig>) => {
      s.viewConfigsLoading = false
      const idx = s.viewConfigs.findIndex(v => v.id === a.payload.id)
      if (idx !== -1) s.viewConfigs[idx] = a.payload
    },
    updateViewConfigFailure: (s, a: PayloadAction<string>) => {
      s.viewConfigsLoading = false
      s.error              = a.payload
    },

    deleteViewConfigRequest: (s, _a: PayloadAction<number>) => {
      s.viewConfigsLoading = true
    },
    deleteViewConfigSuccess: (s, a: PayloadAction<number>) => {
      s.viewConfigsLoading    = false
      s.viewConfigs           = s.viewConfigs.filter(v => v.id !== a.payload)
      if (s.selectedViewConfigId === a.payload) s.selectedViewConfigId = null
    },
    deleteViewConfigFailure: (s, a: PayloadAction<string>) => {
      s.viewConfigsLoading = false
      s.error              = a.payload
    },
    setColumnFilters: (s, a: PayloadAction<ColumnFilter[]>) => {
  s.columnFilters = a.payload
},
  },
})

export const {
  setStartDate, setEndDate, setPageSize, setSelectedFilterId,
  clearPendingApplyFilter,
  fetchFichesRequest, fetchFichesSuccess, fetchFichesFailure,
  setSelectedRow, triggerDeleteModal, resetDeleteModal, triggerReportModal, resetReportModal,
  selectFiche,
  fetchSurveysRequest, fetchSurveysSuccess, fetchSurveysFailure,
  selectSurvey,
  fetchItemsRequest, fetchItemsSuccess, fetchItemsFailure,
  updateSurveyRequest, updateSurveySuccess, updateSurveyFailure,
  fetchAgentReportRequest, fetchAgentReportSuccess, fetchAgentReportFailure, clearAgentReport,
  deleteSurveyRequest, deleteSurveySuccess, deleteSurveyFailure,
  deleteFicheRequest, deleteFicheSuccess, deleteFicheFailure,
  fetchEvalFiltersRequest, fetchEvalFiltersSuccess, fetchEvalFiltersFailure,
  createEvalFilterRequest, createEvalFilterSuccess, createEvalFilterFailure,
  deleteEvalFilterRequest, deleteEvalFilterSuccess, deleteEvalFilterFailure,setSelectedViewConfigId,
  fetchViewConfigsRequest, fetchViewConfigsSuccess, fetchViewConfigsFailure,
  saveViewConfigRequest,   saveViewConfigSuccess,   saveViewConfigFailure,
  updateViewConfigRequest, updateViewConfigSuccess, updateViewConfigFailure,
  deleteViewConfigRequest, deleteViewConfigSuccess, deleteViewConfigFailure, setColumnFilters,
} = evaluationSlice.actions

export default evaluationSlice.reducer