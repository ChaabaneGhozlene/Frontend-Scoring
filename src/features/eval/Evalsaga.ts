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
  setSelectedRecordId,
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
function* fetchRecordsSaga(action: any) {
  yield put(fetchRecordsStart())
  try {
    const state: RootState = yield select()
    const ev = state.eval

    // ✅ Utiliser payload si présent, sinon fallback sur le store
    const page     = action?.payload?.page     ?? ev.page
    const pageSize = action?.payload?.pageSize ?? ev.pageSize
    const columnFilters = action?.payload?.columnFilters ?? []  // ← ajoute

    const res = (yield call(fetchRecords, {
      agentOids: ev.selectedAgentOid.length > 0 ? ev.selectedAgentOid : undefined,
      dateDebut: ev.startDate ?? undefined,
      dateFin:   ev.endDate   ?? undefined,
      page,       
      pageSize,  
            columnFilters, 

    })) as Awaited<ReturnType<typeof fetchRecords>>

    console.log('📦 Premier record brut:', res.data.records[0])

    const records = res.data.records.map((r: any) => ({
      id:                  r.id,
      agentId:             r.agentId             ?? null,
      agentOid:            r.agentOid            ?? null,
      nomAgent:            r.nomAgent            ?? null,
      prenomAgent:         r.prenomAgent         ?? null,
      campaignDescription: r.campaignDescription ?? null,
      callLocalTime:       r.callLocalTime       ?? null,
      callLocalTimeString: r.callLocalTimeString ?? null,
      heureAppel:          r.heureAppel          ?? null,
      recordDate:          r.recordDate          ?? null,
      statut:              r.statut              ?? null,
      detailStatut:        r.detailStatut        ?? null,
      statusRequal:        r.statusRequal        ?? null,
      statusDescription:   r.statusDescription   ?? null,
      callTypeDescription: r.callTypeDescription ?? null,
      numeroTel:           r.numeroTel           ?? null,
      duration:            r.duration            ?? null,
      hasEvaluation:       r.hasEvaluation       ?? false,
      hasHistory:          r.hasHistory          ?? false,
      hasHistoryScreen:    r.hasHistoryScreen    ?? false,
      lsId:                r.lsId               ?? null,
      typeRequalif:        r.typeRequalif        ?? null,
      recIdLink:           r.recIdLink           ?? null,
      campaignId:          r.campaignId          ?? null,
      campaignName:        r.campaignName        ?? null,
      isSaved:             r.isSaved             ?? undefined,
    }))

    yield put(fetchRecordsSuccess({
      records,
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
  // ✅ Stocker le recordId sélectionné
  yield put(setSelectedRecordId(action.payload))
  yield put(openEvalStart())

  try {
    // ✅ Récupérer le record depuis le store AVANT l'appel API
    const state: RootState = yield select()
    const record = state.eval.records.find(r => r.id === action.payload)

    const res: Awaited<ReturnType<typeof openEvaluation>> = yield call(
      openEvaluation,
      action.payload
    )

    // ✅ Fusionner : données API + données du record en store
    const enrichedData = {
      ...res.data,
      // Si le back ne renvoie pas ces champs, on les prend depuis le RecordRow
      recordDate: res.data.recordDate ?? record?.recordDate ?? null,
      callIndex:  res.data.callIndex  ?? record?.recIdLink?.toString() ?? null,
      auditor:    res.data.auditor    ?? null,
    }

    console.log('✅ openEval enriched:', enrichedData)
    yield put(openEvalSuccess(enrichedData))

  } catch (err: any) {
    const message = err?.response?.data?.message ?? "Impossible d'ouvrir l'évaluation."
    yield put(openEvalFailure(message))
  }
}

// ── Saga: save evaluation ──────────────────────────────────────────────────
// ── Saga: save evaluation ──────────────────────────────────────────────────
function* saveEvalSaga(action: PayloadAction<SaveEvaluationDto>) {
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
    // ✅ Dispatcher l'action au lieu d'appeler directement la saga
    yield put({ type: FETCH_RECORDS_REQUEST })
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