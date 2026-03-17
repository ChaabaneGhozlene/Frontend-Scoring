import { call, put, takeLatest } from 'redux-saga/effects'
import type { PayloadAction } from '@reduxjs/toolkit'
import {
  fetchAgentsRequest,
  fetchAgentsSuccess,
  fetchAgentsFailure,
  fetchEditDetailRequest,
  fetchEditDetailSuccess,
  fetchEditDetailFailure,
  upsertEmailRequest,
  upsertEmailSuccess,
  upsertEmailFailure,
  fetchAgentsRequest as refetch,
} from './AgentMailConfigSlice'
import {
  getAgentsWithEmail,
  getAgentEditDetail,
  upsertAgentEmail,
} from './AgentMailConfigService'
import type {
  AgentMailConfig,
  AgentMailEditDetail,
  UpdateAgentEmailPayload,
} from './AgentMailConfigTypes'

// ── Fetch agents ─────────────────────────────────────────────────────────────
function* handleFetchAgents(): Generator<any, void, AgentMailConfig[]> {
  try {
    const data: AgentMailConfig[] = yield call(getAgentsWithEmail)
    yield put(fetchAgentsSuccess(data))
  } catch (err: any) {
    yield put(fetchAgentsFailure(err?.response?.data?.message ?? 'Erreur lors du chargement.'))
  }
}

// ── Fetch edit detail ─────────────────────────────────────────────────────────
function* handleFetchEditDetail(
  action: PayloadAction<string>
): Generator<any, void, AgentMailEditDetail> {
  try {
    const data: AgentMailEditDetail = yield call(getAgentEditDetail, action.payload)
    yield put(fetchEditDetailSuccess(data))
  } catch (err: any) {
    yield put(fetchEditDetailFailure(err?.response?.data?.message ?? 'Agent introuvable.'))
  }
}

// ── Upsert email ──────────────────────────────────────────────────────────────
function* handleUpsertEmail(
  action: PayloadAction<UpdateAgentEmailPayload>
): Generator<any, void, void> {
  try {
    yield call(upsertAgentEmail, action.payload)
    yield put(upsertEmailSuccess())
    // Rafraîchir la liste après sauvegarde
    yield put(refetch())
  } catch (err: any) {
    yield put(upsertEmailFailure(err?.response?.data?.message ?? 'Erreur lors de la sauvegarde.'))
  }
}

// ── Root saga ─────────────────────────────────────────────────────────────────
export function* agentMailConfigSaga() {
  yield takeLatest(fetchAgentsRequest.type,      handleFetchAgents)
  yield takeLatest(fetchEditDetailRequest.type,  handleFetchEditDetail)
  yield takeLatest(upsertEmailRequest.type,      handleUpsertEmail)
}