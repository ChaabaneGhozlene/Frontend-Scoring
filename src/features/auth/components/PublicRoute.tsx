import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import { ROUTES } from '../../../constants/routes'
import type { RootState } from '../../../app/store'

export default function PublicRoute() {
  const { token, expiresAt } = useAppSelector((state: RootState) => state.auth)
  const isAuthenticated =
    !!token &&
    !!expiresAt &&
    new Date(expiresAt).getTime() > Date.now()

  // si l'utilisateur est connecté, redirige vers dashboard
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  // sinon, affiche la page publique (login)
  return <Outlet />
}