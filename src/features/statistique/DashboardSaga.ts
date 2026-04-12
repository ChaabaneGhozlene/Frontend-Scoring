import { call, put, takeLatest, select } from 'redux-saga/effects';
import { DashboardService } from './DashboardService';
import {
  loadConfigRequest, loadConfigSuccess, loadConfigFailure,
  saveConfigRequest, saveConfigSuccess, saveConfigFailure,
} from './DashboardSlice';
import type { RootState } from '../../app/store';
import type { UserDashboardConfig } from './Statistiquetypes';

// Dans DashboardSaga.ts — handleLoad, gérer le cas où l'API n'existe pas encore
function* handleLoad() {
  try {
    const userId: number = yield select((s: RootState) => s.auth.user?.userId ?? 0)
    const config: UserDashboardConfig = yield call(DashboardService.loadConfig, userId)
    yield put(loadConfigSuccess(config))
  } catch {
    // ✅ Si l'API n'existe pas encore, initialiser une config vide au lieu de planter
    yield put(loadConfigSuccess({ userId: 0, widgets: [] }))
  }
}

function* handleSave() {
  try {
    const config: UserDashboardConfig = yield select((s: RootState) => s.dashboardBuilder.config!);
    yield call(DashboardService.saveConfig, config);
    yield put(saveConfigSuccess());
  } catch {
    yield put(saveConfigFailure('Impossible de sauvegarder'));
  }
}

export function* dashboardBuilderSaga() {
  yield takeLatest(loadConfigRequest.type, handleLoad);
  yield takeLatest(saveConfigRequest.type, handleSave);
}