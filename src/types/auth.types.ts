import type { Role, User } from "./user.types"

export interface AuthUser extends User {}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthSession {
  token: string
  user: AuthUser
  expiresAt: string
}

export interface LoginResult {
  session: AuthSession
}

export type { Role }
