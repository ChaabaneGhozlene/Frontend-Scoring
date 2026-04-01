import { call, put, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import AgentTeamService from './AgentTeamService';
import {
  fetchTeamsRequest,   fetchTeamsSuccess,   fetchTeamsFailure,
  fetchMembersRequest, fetchMembersSuccess, fetchMembersFailure,
  fetchSitesRequest,   fetchSitesSuccess,   fetchSitesFailure,
  fetchAvailableAgentsRequest, fetchAvailableAgentsSuccess, fetchAvailableAgentsFailure,
  createTeamRequest,   createTeamSuccess,   createTeamFailure,
  updateTeamRequest,   updateTeamSuccess,   updateTeamFailure,
  deleteTeamRequest,   deleteTeamSuccess,   deleteTeamFailure,
 removeMembersRequest,      // ← AJOUTER ICI
  removeMembersSuccess,      // ← AJOUTER ICI
  removeMembersFailure,      // ← AJOUTER ICI
} from './AgentTeamSlice';
import type {
  FetchAvailableAgentsPayload,
  CreateTeamPayload,
  UpdateTeamPayload,
  DeleteTeamPayload,
  
} from './AgentTeamTypes';

// ── Workers ───────────────────────────────────────────────────────────────────

function* fetchTeamsSaga() {
  try {
    const res: Awaited<ReturnType<typeof AgentTeamService.getAllTeams>> =
      yield call(AgentTeamService.getAllTeams);
    yield put(fetchTeamsSuccess(res.data));
  } catch {
    yield put(fetchTeamsFailure('Erreur lors du chargement des groupes.'));
  }
}

function* fetchMembersSaga(action: PayloadAction<number>) {
  try {
    const res: Awaited<ReturnType<typeof AgentTeamService.getMembers>> =
      yield call(AgentTeamService.getMembers, action.payload);
    yield put(fetchMembersSuccess(res.data));
  } catch {
    yield put(fetchMembersFailure('Erreur lors du chargement des membres.'));
  }
}

function* fetchSitesSaga() {
  try {
    const res: Awaited<ReturnType<typeof AgentTeamService.getSites>> =
      yield call(AgentTeamService.getSites);
    yield put(fetchSitesSuccess(res.data));
  } catch {
    yield put(fetchSitesFailure('Erreur lors du chargement des sites.'));
  }
}

function* fetchAvailableAgentsSaga(action: PayloadAction<FetchAvailableAgentsPayload>) {
  try {
    const { customerId, excludeTeamId } = action.payload;
    const res: Awaited<ReturnType<typeof AgentTeamService.getAvailableAgents>> =
      yield call(AgentTeamService.getAvailableAgents, customerId, excludeTeamId);
    yield put(fetchAvailableAgentsSuccess(res.data));
  } catch {
    yield put(fetchAvailableAgentsFailure('Erreur lors du chargement des agents.'));
  }
}

function* createTeamSaga(action: PayloadAction<CreateTeamPayload>) {
  try {
    yield call(AgentTeamService.createTeam, action.payload.dto);
    yield put(createTeamSuccess());
    yield put(fetchTeamsRequest());
    action.payload.onSuccess();
  } catch (err: any) {
    const msg =
      err?.response?.status === 409
        ? 'Un groupe avec ce nom existe déjà.'
        : err?.response?.data?.message || 'Erreur lors de la création du groupe.';
    yield put(createTeamFailure(msg));
  }
}

function* updateTeamSaga(action: PayloadAction<UpdateTeamPayload>) {
  try {
    yield call(AgentTeamService.updateTeam, action.payload.id, action.payload.dto);
    yield put(updateTeamSuccess());
    yield put(fetchTeamsRequest());
    // Recharger les membres du groupe modifié
    yield put(fetchMembersRequest(action.payload.id));
    action.payload.onSuccess();
  } catch (err: any) {
    const msg =
      err?.response?.data?.message || 'Erreur lors de la modification du groupe.';
    yield put(updateTeamFailure(msg));
  }
}

function* deleteTeamSaga(action: PayloadAction<DeleteTeamPayload>) {
  try {
    yield call(AgentTeamService.deleteTeam, action.payload.id);
    yield put(deleteTeamSuccess());
    yield put(fetchTeamsRequest());
    action.payload.onSuccess();
  } catch (err: any) {
    const msg =
      err?.response?.data?.message || 'Erreur lors de la suppression du groupe.';
    yield put(deleteTeamFailure(msg));
  }
}
function* removeMembersSaga(action: PayloadAction<{ teamId: number; agentOids: string[] }>) {
  try {
    yield call(AgentTeamService.removeMembers, action.payload.teamId, action.payload.agentOids);
    yield put(removeMembersSuccess());
    yield put(fetchMembersRequest(action.payload.teamId));
  } catch (err: any) {
    const msg = err?.response?.data?.message || 'Erreur lors de la suppression des agents.';
    yield put(removeMembersFailure(msg));
  }
}

// ── Watcher ───────────────────────────────────────────────────────────────────

export function* agentTeamSaga() {
  yield takeLatest(fetchTeamsRequest.type,            fetchTeamsSaga);
  yield takeLatest(fetchMembersRequest.type,          fetchMembersSaga);
  yield takeLatest(fetchSitesRequest.type,            fetchSitesSaga);
  yield takeLatest(fetchAvailableAgentsRequest.type,  fetchAvailableAgentsSaga);
  yield takeLatest(createTeamRequest.type,            createTeamSaga);
  yield takeLatest(updateTeamRequest.type,            updateTeamSaga);
  yield takeLatest(deleteTeamRequest.type,            deleteTeamSaga);
    yield takeLatest(removeMembersRequest.type,         removeMembersSaga); // ← AJOUTER ICI

}