import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'          // ← import type
import { jwtDecode }   from 'jwt-decode'
import type { AuthState, AuthUser, LoginRequest, LoginResponse } from './authTypes'  // ← import type

const storedToken = localStorage.getItem('token')
let storedUser: AuthUser | null = null
if (storedToken) {
  try { storedUser = jwtDecode<AuthUser>(storedToken) }
  catch { storedUser = null }
}

const initialState: AuthState = {
  user:      storedUser,
  token:     storedToken,
  expiresAt: localStorage.getItem('expiresAt'),
  loading:   false,
  error:     null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest(state, _action: PayloadAction<LoginRequest>) {
      state.loading = true
      state.error   = null
    },
    loginSuccess(state, action: PayloadAction<LoginResponse>) {
      const { token, expiresAt } = action.payload
      // Sauvegarde le token JWT et la date d'expiration dans le store Redux
      state.token     = token
      state.expiresAt = expiresAt
      state.loading   = false
      state.error     = null
      try { state.user = jwtDecode<AuthUser>(token) }
      catch { state.user = null }
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.error   = action.payload
      state.loading = false
    },
    logout(state) {
      state.user      = null
      state.token     = null
      state.expiresAt = null
      localStorage.removeItem('token')
      localStorage.removeItem('expiresAt')
    },
  },
})

export const { loginRequest, loginSuccess, loginFailure, logout } = authSlice.actions
export default authSlice.reducer