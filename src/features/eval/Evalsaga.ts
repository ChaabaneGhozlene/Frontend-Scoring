// features/eval/Evalsaga.ts
import { call, put, select, takeLatest, takeEvery } from 'redux-saga/effects'
import type { PayloadAction } from '@reduxjs/toolkit'

import {
  fetchRecordsStart,
  fetchRecordsSuccess,
  fetchRecordsFailure,
  openEvalStart,
  openEvalSuccess,
  openEvalFailure,
  saveEvalStart,
  saveEvalSuccess,
  saveEvalFailure,
  setAgents,
  setCategories,
  setCallReasons,
  setCampaigns,
} from './Evalslice'

import type { RootState } from '../../app/store'
import {
  fetchAgents,
  fetchCallReasons,
  fetchCampaignQualities,
  fetchCategories,
  fetchRecords,
  openEvaluation,
  saveEvaluation,
  type SaveEvaluationDto,
} from './Evalservice'

// ── Action type constants ──────────────────────────────────────────────────
export const FETCH_RECORDS_REQUEST = 'eval/fetchRecordsRequest'
export const OPEN_EVAL_REQUEST     = 'eval/openEvalRequest'
export const SAVE_EVAL_REQUEST     = 'eval/saveEvalRequest'
export const LOAD_REFERENCE_DATA   = 'eval/loadReferenceData'

// ── Saga: load reference data ──────────────────────────────────────────────
function* loadReferenceDataSaga() {
  try {
    const [agentsRes, categoriesRes, callReasonsRes, campaignsRes]: Awaited<ReturnType<typeof fetchAgents>>[] =
      yield call(() =>
        Promise.all([
          fetchAgents(),
          fetchCategories(),
          fetchCallReasons(),
          fetchCampaignQualities(),
        ])
      )

    yield put(setAgents(
      (agentsRes as any).data.map((a: any) => ({ oid: a.oid, label: a.label }))
    ))
    yield put(setCategories(
      (categoriesRes as any).data.map((c: any) => ({ id: c.id, libelle: c.libelle }))
    ))
    yield put(setCallReasons(
      (callReasonsRes as any).data.map((c: any) => ({ id: c.id, libelle: c.libelle }))
    ))
    yield put(setCampaigns(
      (campaignsRes as any).data.map((c: any) => ({ id: c.id, description: c.description }))
    ))
  } catch (err) {
    console.error('Failed to load reference data', err)
  }
}

// ── Saga: fetch records ────────────────────────────────────────────────────
function* fetchRecordsSaga() {
  yield put(fetchRecordsStart())
  try {
    const state: RootState = yield select()
    const ev = state.eval

    const res = (yield call(fetchRecords, {
      agentOids: ev.selectedAgentOid.length > 0 ? ev.selectedAgentOid : undefined,
      dateDebut: ev.startDate ?? undefined,
      dateFin:   ev.endDate   ?? undefined,
      page:      ev.page,
      pageSize:  ev.pageSize,
    })) as Awaited<ReturnType<typeof fetchRecords>>

    yield put(fetchRecordsSuccess({
      records:    res.data.records,
      totalCount: res.data.totalCount ?? res.data.length ?? 0,
    }))
  } catch (err: any) {
    console.error('❌ ERREUR fetchRecords:', err)
    yield put(fetchRecordsFailure(
      err?.response?.data?.message ?? 'Erreur lors du chargement des enregistrements.'
    ))
  }
}

// ── Saga: open evaluation ──────────────────────────────────────────────────
function* openEvalSaga(action: PayloadAction<number>) {
  yield put(openEvalStart())
  try {
    const res: Awaited<ReturnType<typeof openEvaluation>> = yield call(
      openEvaluation,
      action.payload
    )
    yield put(openEvalSuccess(res.data))
  } catch (err: any) {
    const message = err?.response?.data?.message ?? "Impossible d'ouvrir l'évaluation."
    yield put(openEvalFailure(message))
  }
}

// ── Saga: save evaluation ──────────────────────────────────────────────────
function* saveEvalSaga(action: PayloadAction<SaveEvaluationDto>) {
  // ✅ FIX : log pour vérifier que itemId est bien présent (pas undefined)
  console.log('💾 saveEval payload:', JSON.stringify(action.payload, null, 2))

  yield put(saveEvalStart())
  try {
    const res: Awaited<ReturnType<typeof saveEvaluation>> = yield call(
      saveEvaluation,
      action.payload
    )
    yield put(saveEvalSuccess({
      score:   res.data.score,
      message: res.data.message,
    }))
    // Recharger la liste après sauvegarde
    yield call(fetchRecordsSaga)
  } catch (err: any) {
    yield put(saveEvalFailure(
      err?.response?.data?.message ?? 'Erreur lors de la sauvegarde.'
    ))
  }
}

// ── Root evaluation saga ───────────────────────────────────────────────────
export function* evalSaga() {
  yield takeLatest(LOAD_REFERENCE_DATA,   loadReferenceDataSaga)
  yield takeLatest(FETCH_RECORDS_REQUEST, fetchRecordsSaga)
  yield takeEvery(OPEN_EVAL_REQUEST,      openEvalSaga)
  yield takeLatest(SAVE_EVAL_REQUEST,     saveEvalSaga)
}