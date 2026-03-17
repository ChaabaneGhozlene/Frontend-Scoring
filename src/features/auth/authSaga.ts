import { call, put, takeLatest } from 'redux-saga/effects'
import { loginRequest, loginSuccess, loginFailure, logout } from './authSlice'
import { loginApi, logoutApi } from './authService'
import type { AxiosResponse }      from 'axios'                 // ← import type
import type { LoginResponse }      from './authTypes'           // ← import type

function* handleLogin(action: ReturnType<typeof loginRequest>): Generator {
  try {
    const response = (yield call(loginApi, action.payload)) as AxiosResponse<LoginResponse>
    const { token, expiresAt } = response.data

    // Persister dans localStorage
    localStorage.setItem('token',     token)
    localStorage.setItem('expiresAt', expiresAt)

    yield put(loginSuccess({ token, expiresAt }))

  } catch (error: any) {
    // Récupère le message d'erreur du backend .NET
    const message =
      error.response?.data ||
      error.response?.data?.message ||
      'Erreur de connexion'
    yield put(loginFailure(message))
  }
}

function* handleLogout(): Generator {
  try { yield call(logoutApi) } catch { /* ignore */ }
}
/*C'est un mot clé des fonctions générateurs (function*). Il dit à la saga :
"Mets-toi en pause ici et attends qu'il se passe quelque chose"
Sans yield, la saga s'exécuterait une seule fois et s'arrêterait. Avec yield, elle reste en écoute permanente tant que l'app tourne.*/

export function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin)
  //   écoute l'action créée dans authSlice
//   ne la recrée pas
// authSlice.ts crée automatiquement :
//loginRequest.type === "auth/loginRequest"
//                     ↑      ↑
//                 nom slice  nom action
  yield takeLatest(logout.type,       handleLogout)
}