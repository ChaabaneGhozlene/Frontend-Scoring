import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import { ROUTES } from '../../../constants/routes'
import type { RootState } from '../../../app/store'

export default function ProtectedRoute() {

  const { token, expiresAt } = useAppSelector((state: RootState) => state.auth)

  const isAuthenticated =
    !!token &&
    !!expiresAt &&
    new Date(expiresAt).getTime() > Date.now()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <Outlet />
}