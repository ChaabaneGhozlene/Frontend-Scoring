import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchSectionStatsRequest,     fetchSectionStatsSuccess,     fetchSectionStatsFailure,
  fetchAgentScoresRequest,      fetchAgentScoresSuccess,      fetchAgentScoresFailure,
  fetchProgramLevelRequest,     fetchProgramLevelSuccess,     fetchProgramLevelFailure,
  fetchCoachingSheetRequest,    fetchCoachingSheetSuccess,    fetchCoachingSheetFailure,
  fetchCoachingAnalysisRequest, fetchCoachingAnalysisSuccess, fetchCoachingAnalysisFailure,
  fetchCoachingSummaryRequest,  fetchCoachingSummarySuccess,  fetchCoachingSummaryFailure,
  fetchAgentListRequest,        fetchAgentListSuccess,        fetchAgentListFailure,
  exportRequest,                exportSuccess,                exportFailure,
} from './Statistiqueslice';
import {
  fetchSectionStatsApi,
  fetchAgentScoresApi,
  fetchProgramLevelApi,
  fetchCoachingSheetApi,
  fetchCoachingAnalysisApi,
  fetchCoachingSummaryApi,
  fetchAgentListApi,
  exportStatistiquesApi,
} from './Statistiqueservice';
import type {
  ExportPayload,
  FetchAgentListPayload,
  FetchAgentScoresPayload,
  FetchCoachingPayload,
  FetchProgramLevelPayload,
  FetchSectionStatsPayload,
} from './Statistiquetypes';
import type { PayloadAction } from '@reduxjs/toolkit';

// ─── Section Stats ────────────────────────────────────────────────────────────
function* fetchSectionStatsSaga(action: PayloadAction<FetchSectionStatsPayload>) {
  try {
    const data: Awaited<ReturnType<typeof fetchSectionStatsApi>> = yield call(
      fetchSectionStatsApi,
      action.payload.filter   // ✅ filter uniquement — allSupervisors est dans filter
    );
    yield put(fetchSectionStatsSuccess(data));
  } catch (error: any) {
    yield put(fetchSectionStatsFailure(error?.response?.data?.message ?? 'Error'));
  }
}

// ─── Agent Scores ─────────────────────────────────────────────────────────────
function* fetchAgentScoresSaga(action: PayloadAction<FetchAgentScoresPayload>) {
  try {
    const data: Awaited<ReturnType<typeof fetchAgentScoresApi>> = yield call(
      fetchAgentScoresApi,
      action.payload.filter,
      action.payload.sortDirection  // ✅ passé en query param via le service
    );
    yield put(fetchAgentScoresSuccess(data));
  } catch (error: any) {
    yield put(fetchAgentScoresFailure(error?.response?.data?.message ?? 'Error'));
  }
}

// ─── Program Level ────────────────────────────────────────────────────────────
function* fetchProgramLevelSaga(action: PayloadAction<FetchProgramLevelPayload>) {
  try {
    const data: Awaited<ReturnType<typeof fetchProgramLevelApi>> = yield call(
      fetchProgramLevelApi,
      action.payload.filter   // ✅ allSupervisors est dans filter, plus besoin de le passer séparément
    );
    yield put(fetchProgramLevelSuccess(data));
  } catch (error: any) {
    yield put(fetchProgramLevelFailure(error?.response?.data?.message ?? 'Error'));
  }
}

// ─── Coaching Sheet ───────────────────────────────────────────────────────────
function* fetchCoachingSheetSaga(action: PayloadAction<FetchCoachingPayload>) {
  try {
    const data: Awaited<ReturnType<typeof fetchCoachingSheetApi>> = yield call(
      fetchCoachingSheetApi,
      action.payload.filter,
      action.payload.agentId  // ✅ agentId en query param, allSupervisors dans filter
    );
    yield put(fetchCoachingSheetSuccess(data));
  } catch (error: any) {
    yield put(fetchCoachingSheetFailure(error?.response?.data?.message ?? 'Error'));
  }
}

// ─── Coaching Analysis ────────────────────────────────────────────────────────
function* fetchCoachingAnalysisSaga(action: PayloadAction<FetchCoachingPayload>) {
  try {
    const data: Awaited<ReturnType<typeof fetchCoachingAnalysisApi>> = yield call(
      fetchCoachingAnalysisApi,
      action.payload.filter,
      action.payload.agentId  // ✅ agentId en query param, allSupervisors dans filter
    );
    yield put(fetchCoachingAnalysisSuccess(data));
  } catch (error: any) {
    yield put(fetchCoachingAnalysisFailure(error?.response?.data?.message ?? 'Error'));
  }
}

// ─── Coaching Summary ─────────────────────────────────────────────────────────
function* fetchCoachingSummarySaga(action: PayloadAction<FetchCoachingPayload>) {
  try {
    const data: Awaited<ReturnType<typeof fetchCoachingSummaryApi>> = yield call(
      fetchCoachingSummaryApi,
      action.payload.filter,
      action.payload.agentId  // ✅ agentId en query param, allSupervisors dans filter
    );
    yield put(fetchCoachingSummarySuccess(data));
  } catch (error: any) {
    yield put(fetchCoachingSummaryFailure(error?.response?.data?.message ?? 'Error'));
  }
}

// ─── Agent List ───────────────────────────────────────────────────────────────
function* fetchAgentListSaga(action: PayloadAction<FetchAgentListPayload>) {
  try {
    const data: Awaited<ReturnType<typeof fetchAgentListApi>> = yield call(
      fetchAgentListApi,
      action.payload.allSupervisors  // ✅ query param GET, pas de body
    );
    yield put(fetchAgentListSuccess(data));
  } catch (error: any) {
    yield put(fetchAgentListFailure(error?.response?.data?.message ?? 'Error'));
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────
function* exportSaga(action: PayloadAction<ExportPayload>) {
  try {
    yield call(exportStatistiquesApi, action.payload.request);
    yield put(exportSuccess());
  } catch (error: any) {
    yield put(exportFailure(error?.response?.data?.message ?? 'Export failed'));
  }
}

// ─── Root Saga ────────────────────────────────────────────────────────────────
export function* statistiqueSaga() {
  yield takeLatest(fetchSectionStatsRequest.type,     fetchSectionStatsSaga);
  yield takeLatest(fetchAgentScoresRequest.type,      fetchAgentScoresSaga);
  yield takeLatest(fetchProgramLevelRequest.type,     fetchProgramLevelSaga);
  yield takeLatest(fetchCoachingSheetRequest.type,    fetchCoachingSheetSaga);
  yield takeLatest(fetchCoachingAnalysisRequest.type, fetchCoachingAnalysisSaga);
  yield takeLatest(fetchCoachingSummaryRequest.type,  fetchCoachingSummarySaga);
  yield takeLatest(fetchAgentListRequest.type,        fetchAgentListSaga);
  yield takeLatest(exportRequest.type,                exportSaga);
}