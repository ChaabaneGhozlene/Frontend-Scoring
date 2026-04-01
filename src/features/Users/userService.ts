import axiosInstance from '../../services/axiosInstance'
import type { CreateUserDto, UpdateUserDto, PaginatedUsersDto, UserDto, SiteDto } from './userTypes'

// ═══════════════════════════════════════════════════════════════
// SERVICE — evaluation/users
// Toutes les requêtes HTTP vers /api/users
// ═══════════════════════════════════════════════════════════════

// ── Liste paginée ─────────────────────────────────────────────
export async function fetchUsers(
  page: number,
  pageSize: number
): Promise<PaginatedUsersDto> {
  const { data } = await axiosInstance.get<PaginatedUsersDto>('/users', {
    params: { page, pageSize }
  })
  return data
}

// ── Détail ────────────────────────────────────────────────────
export async function fetchUserById(id: number): Promise<UserDto> {
  const { data } = await axiosInstance.get<UserDto>(`/users/${id}`)
  return data
}

// ── Création ──────────────────────────────────────────────────
export async function createUser(dto: CreateUserDto): Promise<UserDto> {
  const { data } = await axiosInstance.post<UserDto>('/users', dto)
  return data
}

// ── Modification ──────────────────────────────────────────────
export async function updateUser(id: number, dto: UpdateUserDto): Promise<UserDto> {
  const { data } = await axiosInstance.put<UserDto>(`/users/${id}`, dto)
  return data
}

// ── Suppression (bulk) ────────────────────────────────────────
export async function deleteUsers(ids: number[]): Promise<void> {
  await axiosInstance.delete('/users', { data: ids })
}

// ── Sites ─────────────────────────────────────────────────────
export async function fetchSites(): Promise<SiteDto[]> {
  const { data } = await axiosInstance.get<SiteDto[]>('/users/sites')
  return data
}

// ── Check login ───────────────────────────────────────────────
export async function checkLoginExists(
  login: string,
  excludeId?: number
): Promise<boolean> {
  const { data } = await axiosInstance.get<{ exists: boolean }>('/users/check-login', {
    params: { login, excludeId }
  })
  return data.exists
}