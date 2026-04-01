// features/evaluation/Evaluationslice.ts

import { createSlice, type PayloadAction} from '@reduxjs/toolkit'

export interface AgentOption {
  oid:   string
  label: string
}

export interface CampaignQualityOption {
  id:          number
  description: string
}

export interface CategoryOption {
  id:      number
  libelle: string
}

export interface CallReasonOption {
  id:      number
  libelle: string
}

export interface EvalGridRow {
  id:             number
  surveyId:       number
  templateItemId: number
  groupId:        number
  groupName:      string
  groupOrder:     number
  question:       string
  definition:     string
  value:          number
  memo:           string
  scaleMax:       number
  scaleMin:       number
  isNA:           boolean
  itemOrder:      number
}

export interface RecordRow {
  id:               number
  recordDate:       string | null
  campaignId:       number | null
  campaignName:     string | null
  agentId:          number | null
  agentOid:         string | null
  nomAgent:         string | null
  prenomAgent:      string | null
  heureAppel:       string | null
  statut:           string | null
  detailStatut:     string | null
  recIdLink:        number | null
  isSaved?:         number
}

export interface OpenEvaluationResponse {
  surveyId:    number
  recordDate:  string
  evalDate:    string
  callIndex:   string
  gridRows:    EvalGridRow[]
  categories:  CategoryOption[]
  callReasons: CallReasonOption[]
  errorMessage?: string
  alreadyDone?:  boolean
}

export interface EvaluationState {
  // Toolbar filters
  startDate:          string | null
  endDate:            string | null
  selectedAgentOid:   string[]
  nbEnregistrements:  number
  filtreUtilisateur:  string | null

  // Reference data
  agents:           AgentOption[]
  campaigns:        CampaignQualityOption[]
  categories:       CategoryOption[]
  callReasons:      CallReasonOption[]

  // Records table
  records:          RecordRow[]
  totalCount:       number
  page:             number
  pageSize:         number

  // Currently open evaluation
  openEval:         OpenEvaluationResponse | null
  isSurveyOpen:     boolean

  // UI state
  loadingRecords:   boolean
  loadingEval:      boolean
  savingEval:       boolean
  errorRecords:     string | null
  errorEval:        string | null
  successMessage:   string | null

  // Selected record for actions
  selectedRecordId: number | null
}

const today = new Date()
const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

const fmt = (d: Date) => d.toISOString().split('T')[0]

const initialState: EvaluationState = {
  startDate:         fmt(firstOfMonth),
  endDate:           fmt(today),
  selectedAgentOid:  [],
  nbEnregistrements: 10,
  filtreUtilisateur: null,

  agents:      [],
  campaigns:   [],
  categories:  [],
  callReasons: [],

  records:    [],
  totalCount: 0,
  page:       1,
  pageSize:   10,

  openEval:     null,
  isSurveyOpen: false,

  loadingRecords: false,
  loadingEval:    false,
  savingEval:     false,
  errorRecords:   null,
  errorEval:      null,
  successMessage: null,

  selectedRecordId: null,
}

const evalSlice = createSlice({
  name: 'eval',
  initialState,
  reducers: {
    // ── Toolbar ────────────────────────────────────────────
    setStartDate(state, action: PayloadAction<string | null>) {
      state.startDate = action.payload
      state.page = 1
    },
    setEndDate(state, action: PayloadAction<string | null>) {
      state.endDate = action.payload
      state.page = 1
    },
    setSelectedAgentOid(state, action: PayloadAction<string[]>) {
      state.selectedAgentOid = action.payload
      state.page = 1
    },
    setNbEnregistrements(state, action: PayloadAction<number>) {
      state.nbEnregistrements = action.payload
      state.pageSize = action.payload
      state.page = 1
    },
    setFiltreUtilisateur(state, action: PayloadAction<string | null>) {
      state.filtreUtilisateur = action.payload
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload
      state.page = 1
    },

    // ── Reference data ─────────────────────────────────────
    setAgents(state, action: PayloadAction<AgentOption[]>) {
      state.agents = action.payload
    },
    setCampaigns(state, action: PayloadAction<CampaignQualityOption[]>) {
      state.campaigns = action.payload
    },
    setCategories(state, action: PayloadAction<CategoryOption[]>) {
      state.categories = action.payload
    },
    setCallReasons(state, action: PayloadAction<CallReasonOption[]>) {
      state.callReasons = action.payload
    },

    // ── Records ────────────────────────────────────────────
    fetchRecordsStart(state) {
      state.loadingRecords = true
      state.errorRecords   = null
    },
    fetchRecordsSuccess(state, action: PayloadAction<{ records: RecordRow[]; totalCount: number }>) {
      state.loadingRecords = false
      state.records        = action.payload.records
      state.totalCount     = action.payload.totalCount
    },
    fetchRecordsFailure(state, action: PayloadAction<string>) {
      state.loadingRecords = false
      state.errorRecords   = action.payload
    },

    // ── Open Evaluation ────────────────────────────────────
    setSelectedRecordId(state, action: PayloadAction<number | null>) {
      state.selectedRecordId = action.payload
    },
    openEvalStart(state) {
      state.loadingEval = true
      state.errorEval   = null
    },
    openEvalSuccess(state, action: PayloadAction<OpenEvaluationResponse>) {
      state.loadingEval  = false
      state.openEval     = action.payload
      state.isSurveyOpen = true
    },
    openEvalFailure(state, action: PayloadAction<string>) {
      state.loadingEval = false
      state.errorEval   = action.payload
    },
    closeEval(state) {
      state.isSurveyOpen = false
      state.openEval     = null
      state.errorEval    = null
    },

    // ── Update grid row value ──────────────────────────────
    updateGridRowValue(state, action: PayloadAction<{ id: number; value: number }>) {
      if (!state.openEval) return
      const row = state.openEval.gridRows.find(r => r.id === action.payload.id)
      if (row) row.value = action.payload.value
    },
    updateGridRowMemo(state, action: PayloadAction<{ id: number; memo: string }>) {
      if (!state.openEval) return
      const row = state.openEval.gridRows.find(r => r.id === action.payload.id)
      if (row) row.memo = action.payload.memo
    },

    // ── Save Evaluation ────────────────────────────────────
    saveEvalStart(state) {
      state.savingEval      = true
      state.errorEval       = null
      state.successMessage  = null
    },
    saveEvalSuccess(state, action: PayloadAction<{ score: number; message: string }>) {
      state.savingEval     = false
      state.isSurveyOpen   = false
      state.openEval       = null
      state.successMessage = action.payload.message
    },
    saveEvalFailure(state, action: PayloadAction<string>) {
      state.savingEval = false
      state.errorEval  = action.payload
    },

    // ── Clear messages ─────────────────────────────────────
    clearMessages(state) {
      state.errorRecords   = null
      state.errorEval      = null
      state.successMessage = null
    },
    
  },
})

export const {
  setStartDate, setEndDate, setSelectedAgentOid,
  setNbEnregistrements, setFiltreUtilisateur,
  setPage, setPageSize,
  setAgents, setCampaigns, setCategories, setCallReasons,
  fetchRecordsStart, fetchRecordsSuccess, fetchRecordsFailure,
  setSelectedRecordId,
  openEvalStart, openEvalSuccess, openEvalFailure, closeEval,
  updateGridRowValue, updateGridRowMemo,
  saveEvalStart, saveEvalSuccess, saveEvalFailure,
  clearMessages,
} = evalSlice.actions

export default evalSlice.reducer