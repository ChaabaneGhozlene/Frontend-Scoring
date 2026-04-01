// Correspond au LoginDto du backend
export interface LoginRequest {
  Login: string       
  Password: string    
}

// Correspond à la réponse de POST /api/auth/login
export interface LoginResponse {
  token:     string
  expiresAt: string
}

// Claims extraits du token JWT (userId, userLogin, userRole)
export interface AuthUser {
  userId:    string
  userLogin: string
  userRole:  string
}

// State Redux auth
export interface AuthState {
  user:      AuthUser | null
  token:     string | null
  expiresAt: string | null
  loading:   boolean
  error:     string | null
}