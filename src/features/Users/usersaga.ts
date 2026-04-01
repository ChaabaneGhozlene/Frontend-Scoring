import { call, put, takeLatest, takeEvery } from 'redux-saga/effects'
import type { PayloadAction } from '@reduxjs/toolkit'
import * as svc from './userService'
import {
  fetchUsersRequest,   fetchUsersSuccess,   fetchUsersFailure,
  fetchSitesRequest,   fetchSitesSuccess,   fetchSitesFailure,
  createUserRequest,   createUserSuccess,   createUserFailure,
  updateUserRequest,   updateUserSuccess,   updateUserFailure,
  deleteUsersRequest,  deleteUsersSuccess,  deleteUsersFailure,
} from './userSlice'
import type {
  FetchUsersPayload,
  CreateUserPayload,
  UpdateUserPayload,
  DeleteUsersPayload,
  PaginatedUsersDto,
  UserDto,
  SiteDto,
} from './userTypes'

// ═══════════════════════════════════════════════════════════════
// SAGA — evaluation/users
// ═══════════════════════════════════════════════════════════════

function* handleFetchUsers(action: PayloadAction<FetchUsersPayload>) {
  try {
    const data: PaginatedUsersDto = yield call(
      svc.fetchUsers,
      action.payload.page,
      action.payload.pageSize
    )
    yield put(fetchUsersSuccess(data))
  } catch (err: unknown) {
    yield put(fetchUsersFailure((err as Error).message))
  }
}

function* handleFetchSites() {
  try {
    const sites: SiteDto[] = yield call(svc.fetchSites)
    yield put(fetchSitesSuccess(sites))
  } catch (err: unknown) {
    yield put(fetchSitesFailure((err as Error).message))
  }
}

function* handleCreateUser(action: PayloadAction<CreateUserPayload>) {
  try {
    const user: UserDto = yield call(svc.createUser, action.payload.dto)
    yield put(createUserSuccess(user))
  } catch (err: unknown) {
    yield put(createUserFailure((err as Error).message))
  }
}

function* handleUpdateUser(action: PayloadAction<UpdateUserPayload>) {
  try {
    const user: UserDto = yield call(
      svc.updateUser,
      action.payload.id,
      action.payload.dto
    )
    yield put(updateUserSuccess(user))
  } catch (err: unknown) {
    yield put(updateUserFailure((err as Error).message))
  }
}

function* handleDeleteUsers(action: PayloadAction<DeleteUsersPayload>) {
  try {
    yield call(svc.deleteUsers, action.payload.ids)
    yield put(deleteUsersSuccess(action.payload.ids))
  } catch (err: unknown) {
    yield put(deleteUsersFailure((err as Error).message))
  }
}

// ── Root watcher ──────────────────────────────────────────────
export function* usersSaga() {
  yield takeLatest(fetchUsersRequest.type,  handleFetchUsers)
  yield takeLatest(fetchSitesRequest.type,  handleFetchSites)
  yield takeEvery(createUserRequest.type,   handleCreateUser)
  yield takeEvery(updateUserRequest.type,   handleUpdateUser)
  yield takeEvery(deleteUsersRequest.type,  handleDeleteUsers)
}