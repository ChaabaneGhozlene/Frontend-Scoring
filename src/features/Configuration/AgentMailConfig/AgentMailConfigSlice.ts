import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  AgentMailConfig,
  AgentMailEditDetail,
  AgentMailConfigState,
  UpdateAgentEmailPayload,
} from './AgentMailConfigTypes'

// ─────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────
const initialState: AgentMailConfigState = {
  agents:         [],
  editDetail:     null,
  loading:        false,
  editLoading:    false,
  saving:         false,
  error:          null,
  successMessage: null,
}

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────
const agentMailConfigSlice = createSlice({
  name: 'agentMailConfig',
  initialState,
  reducers: {

    // ── Fetch list ──────────────────────────────
    fetchAgentsRequest(state) {
      state.loading = true
      state.error   = null
    },
    fetchAgentsSuccess(state, action: PayloadAction<AgentMailConfig[]>) {
      state.loading = false
      state.agents  = action.payload
    },
    fetchAgentsFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error   = action.payload
    },

    // ── Fetch edit detail ───────────────────────
    fetchEditDetailRequest(state, _action: PayloadAction<string>) {
      state.editLoading = true
      state.editDetail  = null
      state.error       = null
    },
    fetchEditDetailSuccess(state, action: PayloadAction<AgentMailEditDetail>) {
      state.editLoading = false
      state.editDetail  = action.payload
    },
    fetchEditDetailFailure(state, action: PayloadAction<string>) {
      state.editLoading = false
      state.error       = action.payload
    },

    // ── Upsert email ────────────────────────────
    upsertEmailRequest(state, _action: PayloadAction<UpdateAgentEmailPayload>) {
      state.saving = true
      state.error  = null
    },
    upsertEmailSuccess(state) {
      state.saving         = false
      state.successMessage = 'Email mis à jour avec succès.'
    },
    upsertEmailFailure(state, action: PayloadAction<string>) {
      state.saving = false
      state.error  = action.payload
    },

    // ── Clear ───────────────────────────────────
    clearMessages(state) {
      state.error          = null
      state.successMessage = null
    },
    clearEditDetail(state) {
      state.editDetail  = null
      state.editLoading = false
    },
  },
})

export const {
  fetchAgentsRequest,
  fetchAgentsSuccess,
  fetchAgentsFailure,
  fetchEditDetailRequest,
  fetchEditDetailSuccess,
  fetchEditDetailFailure,
  upsertEmailRequest,
  upsertEmailSuccess,
  upsertEmailFailure,
  clearMessages,
  clearEditDetail,
} = agentMailConfigSlice.actions

export default agentMailConfigSlice.reducer