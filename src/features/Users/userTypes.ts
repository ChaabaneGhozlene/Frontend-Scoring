// ═══════════════════════════════════════════════════════════════
// TYPES — evaluation/users
// ═══════════════════════════════════════════════════════════════

export interface UserDto {
  id:        number
  login:     string
  firstName: string
  lastName:  string
  isActive:  boolean
  siteName:  string
  siteId:    number
}

export interface SiteDto {
  id:   number
  name: string
}

export interface PaginatedUsersDto {
  totalCount: number
  page:       number
  pageSize:   number
  items:      UserDto[]
}

export interface CreateUserDto {
  login:     string
  password:  string
  firstName: string
  lastName:  string
  isActive:  boolean
  siteId:    number
  siteName:  string
}

export interface UpdateUserDto {
  login:     string
  password?: string
  firstName: string
  lastName:  string
  isActive:  boolean
  siteId:    number
  siteName:  string
}

// ── State Redux ──────────────────────────────────────────────────
export interface UsersState {
  items:      UserDto[]
  sites:      SiteDto[]
  totalCount: number
  page:       number
  pageSize:   number
  loading:    boolean
  saving:     boolean
  error:      string | null
}

// ── Saga action payloads ─────────────────────────────────────────
export interface FetchUsersPayload {
  page:     number
  pageSize: number
}

export interface CreateUserPayload { dto: CreateUserDto }
export interface UpdateUserPayload { id: number; dto: UpdateUserDto }
export interface DeleteUsersPayload { ids: number[] }