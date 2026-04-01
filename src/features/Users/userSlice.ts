import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  UsersState,
  UserDto,
  SiteDto,
  PaginatedUsersDto,
  FetchUsersPayload,
  CreateUserPayload,
  UpdateUserPayload,
  DeleteUsersPayload,
} from './userTypes'

// ═══════════════════════════════════════════════════════════════
// SLICE — evaluation/users
// ═══════════════════════════════════════════════════════════════

const initialState: UsersState = {
  items:      [],
  sites:      [],
  totalCount: 0,
  page:       1,
  pageSize:   15,
  loading:    false,
  saving:     false,
  error:      null,
}

const usersSlice = createSlice({
  name: 'Users',
  initialState,
  reducers: {
    // ── Fetch list ───────────────────────────────────────────────
    fetchUsersRequest(state, _action: PayloadAction<FetchUsersPayload>) {
      state.loading = true
      state.error   = null
    },
    fetchUsersSuccess(state, action: PayloadAction<PaginatedUsersDto>) {
      state.loading    = false
      state.items      = action.payload.items
      state.totalCount = action.payload.totalCount
      state.page       = action.payload.page
      state.pageSize   = action.payload.pageSize
    },
    fetchUsersFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error   = action.payload
    },

    // ── Fetch sites ──────────────────────────────────────────────
    fetchSitesRequest(state) {
      state.error = null
    },
    fetchSitesSuccess(state, action: PayloadAction<SiteDto[]>) {
      state.sites = action.payload
    },
    fetchSitesFailure(state, action: PayloadAction<string>) {
      state.error = action.payload
    },

    // ── Create ───────────────────────────────────────────────────
    createUserRequest(state, _action: PayloadAction<CreateUserPayload>) {
      state.saving = true
      state.error  = null
    },
    createUserSuccess(state, action: PayloadAction<UserDto>) {
      state.saving     = false
      state.items      = [action.payload, ...state.items]
      state.totalCount += 1
    },
    createUserFailure(state, action: PayloadAction<string>) {
      state.saving = false
      state.error  = action.payload
    },

    // ── Update ───────────────────────────────────────────────────
    updateUserRequest(state, _action: PayloadAction<UpdateUserPayload>) {
      state.saving = true
      state.error  = null
    },
    updateUserSuccess(state, action: PayloadAction<UserDto>) {
      state.saving = false
      state.items  = state.items.map(u =>
        u.id === action.payload.id ? action.payload : u
      )
    },
    updateUserFailure(state, action: PayloadAction<string>) {
      state.saving = false
      state.error  = action.payload
    },

    // ── Delete ───────────────────────────────────────────────────
    deleteUsersRequest(state, _action: PayloadAction<DeleteUsersPayload>) {
      state.saving = true
      state.error  = null
    },
    deleteUsersSuccess(state, action: PayloadAction<number[]>) {
      state.saving     = false
      state.items      = state.items.filter(u => !action.payload.includes(u.id))
      state.totalCount -= action.payload.length
    },
    deleteUsersFailure(state, action: PayloadAction<string>) {
      state.saving = false
      state.error  = action.payload
    },
  },
})

export const {
  fetchUsersRequest, fetchUsersSuccess, fetchUsersFailure,
  fetchSitesRequest, fetchSitesSuccess, fetchSitesFailure,
  createUserRequest, createUserSuccess, createUserFailure,
  updateUserRequest, updateUserSuccess, updateUserFailure,
  deleteUsersRequest, deleteUsersSuccess, deleteUsersFailure,
} = usersSlice.actions

export default usersSlice.reducer