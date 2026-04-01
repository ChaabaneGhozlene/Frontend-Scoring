import { call, put, takeLatest, takeEvery, select } from 'redux-saga/effects'
import type { PayloadAction } from '@reduxjs/toolkit'
import * as svc from './Evaluationservice'
import type {
  UpdateSurveyDto, LsSurveyDto, SurveyItemDto, AgentReportDto,
  EvalViewConfig, CreateEvalViewConfigDto, UpdateEvalViewConfigPayload,
  LsFicheDto,
} from './Evaluationtypes'
import {
  fetchFichesRequest,    fetchFichesSuccess,    fetchFichesFailure,
  fetchSurveysRequest,   fetchSurveysSuccess,   fetchSurveysFailure,
  fetchItemsRequest,     fetchItemsSuccess,     fetchItemsFailure,
  updateSurveyRequest,   updateSurveySuccess,   updateSurveyFailure,
  fetchAgentReportRequest, fetchAgentReportSuccess, fetchAgentReportFailure,
  deleteSurveyRequest,   deleteSurveySuccess,   deleteSurveyFailure,
  deleteFicheRequest,    deleteFicheSuccess,    deleteFicheFailure,
  fetchViewConfigsRequest, fetchViewConfigsSuccess, fetchViewConfigsFailure,
  saveViewConfigRequest,   saveViewConfigSuccess,   saveViewConfigFailure,
  updateViewConfigRequest, updateViewConfigSuccess, updateViewConfigFailure,
  deleteViewConfigRequest, deleteViewConfigSuccess, deleteViewConfigFailure,
} from './Evaluationslice'
import type { FetchFichesPayload } from './Evaluationslice'
import type { RootState } from '../../app/store'

const errMsg = (e: unknown) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
  (e as { message?: string })?.message ?? 'Erreur'

// ── Fiches ────────────────────────────────────────────────────────────────────

function* handleFetchFiches(action: PayloadAction<FetchFichesPayload>) {
  try {
    const result: svc.PaginatedFiches = yield call(
      (p: FetchFichesPayload) => svc.searchFiches(p),
      action.payload
    )
    yield put(fetchFichesSuccess({
      items: result.items, totalCount: result.totalCount,
      page:  result.page,  pageSize:   result.pageSize,
    }))
  } catch (e) { yield put(fetchFichesFailure(errMsg(e))) }
}

// ── Surveys ───────────────────────────────────────────────────────────────────

// ── Surveys ───────────────────────────────────────────────────────────────────

function* handleFetchSurveys(action: PayloadAction<{ lsId: number; recordDataId: number }>) {
  try {
    const allSurveys: LsSurveyDto[] = yield call(
      (id: number) => svc.getSurveysByLsId(id),
      action.payload.lsId
    )
    // ✅ Toutes les surveys de cet enregistrement
    const surveys = allSurveys.filter(sv => sv.recordDataId === action.payload.recordDataId)
    yield put(fetchSurveysSuccess(surveys))
  } catch (e) { yield put(fetchSurveysFailure(errMsg(e))) }
}
// ── Items ─────────────────────────────────────────────────────────────────────

function* handleFetchItems(action: PayloadAction<number>) {
  try {
    const items: SurveyItemDto[] = yield call(
      (id: number) => svc.getSurveyItems(id),
      action.payload
    )
    yield put(fetchItemsSuccess(items))
  } catch (e) { yield put(fetchItemsFailure(errMsg(e))) }
}

// ── Update survey ─────────────────────────────────────────────────────────────

function* handleUpdateSurvey(
  action: PayloadAction<{ surveyId: number; dto: UpdateSurveyDto }>
) {
  try {
    const updated: LsSurveyDto = yield call(
      (p: { surveyId: number; dto: UpdateSurveyDto }) =>
        svc.updateSurvey(p.surveyId, p.dto),
      action.payload
    )
    yield put(updateSurveySuccess(updated))
  } catch (e) { yield put(updateSurveyFailure(errMsg(e))) }
}

// ── Agent report ──────────────────────────────────────────────────────────────

function* handleFetchAgentReport(action: PayloadAction<number>) {
  try {
    // ✅ récupérer selectedRow depuis le state
    const selectedRow: LsFicheDto | null = yield select(
      (s: RootState) => s.evaluation.selectedRow
    )
    const report: AgentReportDto = yield call(
      (id: number) => svc.getAgentReport(id, selectedRow?.recordDataId),
      action.payload
    )
    yield put(fetchAgentReportSuccess(report))
  } catch (e) { yield put(fetchAgentReportFailure(errMsg(e))) }
}
// ── Delete survey ─────────────────────────────────────────────────────────────

function* handleDeleteSurvey(action: PayloadAction<number>) {
  try {
    yield call((id: number) => svc.deleteSurvey(id), action.payload)
    yield put(deleteSurveySuccess(action.payload))
  } catch (e) { yield put(deleteSurveyFailure(errMsg(e))) }
}

// ── Delete fiche ──────────────────────────────────────────────────────────────

function* handleDeleteFiche(action: PayloadAction<number>) {
  try {
    yield call((id: number) => svc.deleteLsFiche(id), action.payload)
    yield put(deleteFicheSuccess(action.payload))
  } catch (e) { yield put(deleteFicheFailure(errMsg(e))) }
}

// ── View Configs ──────────────────────────────────────────────────────────────

function* handleFetchViewConfigs() {
  try {
    const data: EvalViewConfig[] = yield call(() => svc.fetchViewConfigs())
    yield put(fetchViewConfigsSuccess(data))
  } catch (e) { yield put(fetchViewConfigsFailure(errMsg(e))) }
}

function* handleSaveViewConfig(action: PayloadAction<CreateEvalViewConfigDto>) {
  try {
    const data: EvalViewConfig = yield call(
      (dto: CreateEvalViewConfigDto) => svc.createViewConfig(dto),
      action.payload
    )
    yield put(saveViewConfigSuccess(data))
  } catch (e) { yield put(saveViewConfigFailure(errMsg(e))) }
}

function* handleUpdateViewConfig(action: PayloadAction<UpdateEvalViewConfigPayload>) {
  try {
    const data: EvalViewConfig = yield call(
      (p: UpdateEvalViewConfigPayload) => svc.updateViewConfig(p.id, p.layoutJson),
      action.payload
    )
    yield put(updateViewConfigSuccess(data))
  } catch (e) { yield put(updateViewConfigFailure(errMsg(e))) }
}

function* handleDeleteViewConfig(action: PayloadAction<number>) {
  try {
    yield call((id: number) => svc.deleteViewConfig(id), action.payload)
    yield put(deleteViewConfigSuccess(action.payload))
  } catch (e) { yield put(deleteViewConfigFailure(errMsg(e))) }
}

// ── Root saga ─────────────────────────────────────────────────────────────────

export default function* evaluationSaga() {
  yield takeLatest(fetchFichesRequest.type,        handleFetchFiches)
  yield takeLatest(fetchSurveysRequest.type,       handleFetchSurveys)
  yield takeLatest(fetchItemsRequest.type,         handleFetchItems)
  yield takeEvery (updateSurveyRequest.type,       handleUpdateSurvey)
  yield takeLatest(fetchAgentReportRequest.type,   handleFetchAgentReport)
  yield takeEvery (deleteSurveyRequest.type,       handleDeleteSurvey)
  yield takeEvery (deleteFicheRequest.type,        handleDeleteFiche)
  yield takeLatest(fetchViewConfigsRequest.type,   handleFetchViewConfigs)
  yield takeLatest(saveViewConfigRequest.type,     handleSaveViewConfig)
  yield takeLatest(updateViewConfigRequest.type,   handleUpdateViewConfig)
  yield takeLatest(deleteViewConfigRequest.type,   handleDeleteViewConfig)
}