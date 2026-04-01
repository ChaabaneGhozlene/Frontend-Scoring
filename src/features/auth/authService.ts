import axiosInstance from '../../services/axiosInstance'
import { API_ENDPOINTS } from '../../constants/apiEndpoints'
import type { LoginRequest, LoginResponse } from './authTypes'  // ← import type

export const loginApi = (credentials: LoginRequest) =>
  axiosInstance.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials)

export const logoutApi = () => {
  localStorage.removeItem("token")
  return axiosInstance.post(API_ENDPOINTS.LOGOUT)
}