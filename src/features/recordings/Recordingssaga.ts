import { call, put, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  searchRecordings,
  fetchFilters,
  createFilter,
  deleteFilter,
  fetchViewConfigs,
  createViewConfig,
  updateViewConfig,
  deleteViewConfig,
} from './Recordingsservice';
import {
  fetchRecordingsRequest,
  fetchRecordingsSuccess,
  fetchRecordingsFailure,
  fetchFiltersRequest,
  fetchFiltersSuccess,
  fetchFiltersFailure,
  createFilterRequest,
  createFilterSuccess,
  createFilterFailure,
  deleteFilterRequest,
  deleteFilterSuccess,
  deleteFilterFailure,
  fetchViewConfigsRequest,
  fetchViewConfigsSuccess,
  fetchViewConfigsFailure,
  saveViewConfigRequest,
  saveViewConfigSuccess,
  saveViewConfigFailure,
  updateViewConfigRequest,
  updateViewConfigSuccess,
  updateViewConfigFailure,
  deleteViewConfigRequest,
  deleteViewConfigSuccess,
  deleteViewConfigFailure,
} from './Recordingslice';
import type {
  FetchRecordingsPayload,
  CreateFilterPayload,
  SaveViewConfigPayload,
  UpdateViewConfigPayload,
  UserFilter,
  ViewConfig,
} from './Recordingstypes';

// ─── Records ──────────────────────────────────────────────────────────────────

function* handleFetchRecordings(
  action: PayloadAction<FetchRecordingsPayload>
): Generator {
  try {
    const raw = (yield call(searchRecordings, action.payload)) as unknown;
    console.log('[Saga] raw API response:', raw);

    // Handle multiple possible response shapes from backend
    let data: unknown[] = [];
    let totalCount = 0;
    let page = 1;
    let pageSize = 15;

    if (Array.isArray(raw)) {
      // Backend returned a plain array
      data = raw;
      totalCount = raw.length;
    } else if (raw && typeof raw === 'object') {
      const r = raw as Record<string, unknown>;
      // Shape: { data: [...], totalCount, page, pageSize }
      if (Array.isArray(r['data'])) {
        data = r['data'] as unknown[];
        totalCount = (r['totalCount'] as number) ?? data.length;
        page = (r['page'] as number) ?? 1;
        pageSize = (r['pageSize'] as number) ?? 15;
      }
      // Shape: { items: [...], total, ... }
      else if (Array.isArray(r['items'])) {
        data = r['items'] as unknown[];
        totalCount = (r['total'] as number) ?? data.length;
        page = (r['page'] as number) ?? 1;
        pageSize = (r['pageSize'] as number) ?? 15;
      }
      // Shape: { records: [...], ... }
      else if (Array.isArray(r['records'])) {
        data = r['records'] as unknown[];
        totalCount = (r['totalCount'] as number) ?? data.length;
        page = (r['page'] as number) ?? 1;
        pageSize = (r['pageSize'] as number) ?? 15;
      }
    }

    console.log('[Saga] mapped data length:', data.length, '| totalCount:', totalCount);

    yield put(
      fetchRecordingsSuccess({
        data: data as never,
        totalCount,
        page,
        pageSize,
      })
    );
  } catch (err: unknown) {
    console.error('[Saga] fetchRecordings error:', err);
    const message = err instanceof Error ? err.message : 'Erreur lors du chargement';
    yield put(fetchRecordingsFailure(message));
  }
}

// ─── Filters ──────────────────────────────────────────────────────────────────

function* handleFetchFilters(): Generator {
  try {
    const filters = (yield call(fetchFilters)) as UserFilter[];
    yield put(fetchFiltersSuccess(filters));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur filtres';
    yield put(fetchFiltersFailure(message));
  }
}

function* handleCreateFilter(action: PayloadAction<CreateFilterPayload>): Generator {
  try {
    const filter = (yield call(createFilter, action.payload)) as UserFilter;
    yield put(createFilterSuccess(filter));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur création filtre';
    yield put(createFilterFailure(message));
  }
}

function* handleDeleteFilter(action: PayloadAction<number>): Generator {
  try {
    yield call(deleteFilter, action.payload);
    yield put(deleteFilterSuccess(action.payload));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur suppression filtre';
    yield put(deleteFilterFailure(message));
  }
}

// ─── View Configs ─────────────────────────────────────────────────────────────

function* handleFetchViewConfigs(): Generator {
  try {
    const configs = (yield call(fetchViewConfigs)) as ViewConfig[];
    yield put(fetchViewConfigsSuccess(configs));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur vues';
    yield put(fetchViewConfigsFailure(message));
  }
}

function* handleSaveViewConfig(action: PayloadAction<SaveViewConfigPayload>): Generator {
  try {
    const config = (yield call(createViewConfig, action.payload)) as ViewConfig;
    yield put(saveViewConfigSuccess(config));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur sauvegarde vue';
    yield put(saveViewConfigFailure(message));
  }
}

function* handleUpdateViewConfig(action: PayloadAction<UpdateViewConfigPayload>): Generator {
  try {
    const config = (yield call(
      updateViewConfig,
      action.payload.id,
      action.payload.layoutJson
    )) as ViewConfig;
    yield put(updateViewConfigSuccess(config));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur mise à jour vue';
    yield put(updateViewConfigFailure(message));
  }
}

function* handleDeleteViewConfig(action: PayloadAction<number>): Generator {
  try {
    yield call(deleteViewConfig, action.payload);
    yield put(deleteViewConfigSuccess(action.payload));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur suppression vue';
    yield put(deleteViewConfigFailure(message));
  }
}

// ─── Root Watcher ─────────────────────────────────────────────────────────────

export function* recordingsSaga() {
  yield takeLatest(fetchRecordingsRequest.type, handleFetchRecordings);
  yield takeLatest(fetchFiltersRequest.type, handleFetchFilters);
  yield takeLatest(createFilterRequest.type, handleCreateFilter);
  yield takeLatest(deleteFilterRequest.type, handleDeleteFilter);
  yield takeLatest(fetchViewConfigsRequest.type, handleFetchViewConfigs);
  yield takeLatest(saveViewConfigRequest.type, handleSaveViewConfig);
  yield takeLatest(updateViewConfigRequest.type, handleUpdateViewConfig);
  yield takeLatest(deleteViewConfigRequest.type, handleDeleteViewConfig);
}