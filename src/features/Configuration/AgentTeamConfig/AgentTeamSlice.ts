import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  AgentTeam,
  AgentTeamMember,
  AgentTeamState,
  AvailableAgent,
  AgentSite,
  CreateTeamPayload,
  UpdateTeamPayload,
  DeleteTeamPayload,
  FetchAvailableAgentsPayload,
 
} from './AgentTeamTypes';

const initialState: AgentTeamState = {
  teams:           [],
  members:         [],
  availableAgents: [],
  sites:           [],
  selectedTeamId:  null,
  loading:         false,
  membersLoading:  false,
  agentsLoading:   false,
  error:           null,
  successMessage:  null,
};

const agentTeamSlice = createSlice({
  name: 'agentTeam',
  initialState,
  reducers: {
    // ... tous vos reducers existants ...
    fetchTeamsRequest(state) { state.loading = true; state.error = null; },
    fetchTeamsSuccess(state, action: PayloadAction<AgentTeam[]>) { state.teams = action.payload; state.loading = false; },
    fetchTeamsFailure(state, action: PayloadAction<string>) { state.error = action.payload; state.loading = false; },

    fetchMembersRequest(state, _action: PayloadAction<number>) { state.membersLoading = true; state.error = null; },
    fetchMembersSuccess(state, action: PayloadAction<AgentTeamMember[]>) { state.members = action.payload; state.membersLoading = false; },
    fetchMembersFailure(state, action: PayloadAction<string>) { state.error = action.payload; state.membersLoading = false; },

    fetchSitesRequest(state) { state.loading = true; },
    fetchSitesSuccess(state, action: PayloadAction<AgentSite[]>) { state.sites = action.payload; state.loading = false; },
    fetchSitesFailure(state, action: PayloadAction<string>) { state.error = action.payload; state.loading = false; },

    fetchAvailableAgentsRequest(state, _action: PayloadAction<FetchAvailableAgentsPayload>) { state.agentsLoading = true; state.availableAgents = []; },
    fetchAvailableAgentsSuccess(state, action: PayloadAction<AvailableAgent[]>) { state.availableAgents = action.payload; state.agentsLoading = false; },
    fetchAvailableAgentsFailure(state, action: PayloadAction<string>) { state.error = action.payload; state.agentsLoading = false; },

    createTeamRequest(state, _action: PayloadAction<CreateTeamPayload>) { state.loading = true; state.error = null; state.successMessage = null; },
    createTeamSuccess(state) { state.loading = false; state.successMessage = 'Groupe créé avec succès.'; },
    createTeamFailure(state, action: PayloadAction<string>) { state.error = action.payload; state.loading = false; },

    updateTeamRequest(state, _action: PayloadAction<UpdateTeamPayload>) { state.loading = true; state.error = null; state.successMessage = null; },
    updateTeamSuccess(state) { state.loading = false; state.successMessage = 'Groupe modifié avec succès.'; },
    updateTeamFailure(state, action: PayloadAction<string>) { state.error = action.payload; state.loading = false; },

    deleteTeamRequest(state, _action: PayloadAction<DeleteTeamPayload>) { state.loading = true; state.error = null; state.successMessage = null; },
    deleteTeamSuccess(state) { state.loading = false; state.successMessage = 'Groupe supprimé avec succès.'; },
    deleteTeamFailure(state, action: PayloadAction<string>) { state.error = action.payload; state.loading = false; },

   removeMembersRequest(state, _action: PayloadAction<{ teamId: number; agentOids: string[] }>) {
  state.loading        = true;
  state.error          = null;
  state.successMessage = null;
},
removeMembersSuccess(state) {
  state.loading        = false;
  state.successMessage = 'Agent(s) supprimé(s) avec succès.';
},
removeMembersFailure(state, action: PayloadAction<string>) {
  state.error   = action.payload;
  state.loading = false;
},

    setSelectedTeamId(state, action: PayloadAction<number | null>) { state.selectedTeamId = action.payload; state.members = []; },
    clearMessages(state) { state.error = null; state.successMessage = null; },
    clearAvailableAgents(state) { state.availableAgents = []; },
  },
});

export const {
  fetchTeamsRequest, fetchTeamsSuccess, fetchTeamsFailure,
  fetchMembersRequest, fetchMembersSuccess, fetchMembersFailure,
  fetchSitesRequest, fetchSitesSuccess, fetchSitesFailure,
  fetchAvailableAgentsRequest, fetchAvailableAgentsSuccess, fetchAvailableAgentsFailure,
  createTeamRequest, createTeamSuccess, createTeamFailure,
  updateTeamRequest, updateTeamSuccess, updateTeamFailure,
  deleteTeamRequest, deleteTeamSuccess, deleteTeamFailure,
  // ── NOUVEAU ──
  removeMembersRequest, removeMembersSuccess, removeMembersFailure,
  setSelectedTeamId,
  clearMessages,
  clearAvailableAgents,
} = agentTeamSlice.actions;

export default agentTeamSlice.reducer;