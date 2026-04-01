import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5164/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Injecte le token JWT automatiquement dans chaque requête
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default axiosInstance