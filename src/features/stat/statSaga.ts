import { takeLatest, call, put } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SectionStatFilter } from './StatiTypes';
import {
  fetchSectionStats,
  exportStatsCsv,
  setLoading,
  setRows,
  setError,
} from './Statistiqueslice';
import { statistiqueService } from './Statistiqueservice';

// ── Saga : charger les données ────────────────────────────────────────────────
function* handleFetchSectionStats(action: PayloadAction<SectionStatFilter>) {
  yield put(setLoading(true));
  try {
    const data: { rows: any[]; total: number } = yield call(
      statistiqueService.search,
      action.payload
    );
    yield put(setRows({ rows: data.rows ?? [], total: data.total ?? 0 }));
  } catch (err: any) {
    yield put(setError(err.message ?? 'Erreur inconnue'));
  }
}

// ── Saga : export CSV ─────────────────────────────────────────────────────────
function* handleExportStatsCsv(action: PayloadAction<SectionStatFilter>) {
  try {
    yield call(statistiqueService.exportCsv, action.payload);
  } catch (err: any) {
    yield put(setError(err.message ?? 'Erreur export CSV'));
  }
}

export function* statSaga() {
  yield takeLatest(fetchSectionStats.type, handleFetchSectionStats);
  yield takeLatest(exportStatsCsv.type,    handleExportStatsCsv);
}