import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'          
import { jwtDecode }   from 'jwt-decode'
import type { AuthState, AuthUser, LoginRequest, LoginResponse } from './authTypes'  

const storedToken = localStorage.getItem('token')
const storedExpiresAt = localStorage.getItem('expiresAt')

let storedUser: AuthUser | null = null
let validToken: string | null = null
let validExpiresAt: string | null = null

//  Vérifier si le token est encore valide
if (storedToken && storedExpiresAt && new Date(storedExpiresAt).getTime() > Date.now()) {
  try {
    storedUser = jwtDecode<AuthUser>(storedToken)
    validToken = storedToken
    validExpiresAt = storedExpiresAt
  } catch {
    // token invalide → supprimer
    storedUser = null
    validToken = null
    validExpiresAt = null
    localStorage.removeItem('token')
    localStorage.removeItem('expiresAt')
  }
}

const initialState: AuthState = {
  user: storedUser,
  token: validToken,
  expiresAt: validExpiresAt,
  loading: false,
  error: null,
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