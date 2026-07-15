import * as React from "react"

import type { AuthUser, LoginCredentials } from "@/types/auth.types"
import * as authService from "@/services/auth.service"

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isInitializing: boolean
  isSubmitting: boolean
  login: (credentials: LoginCredentials) => Promise<AuthUser>
  logout: () => Promise<void>
  updateCurrentUser: (user: AuthUser) => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [isInitializing, setIsInitializing] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    const session = authService.getStoredSession()
    setUser(session?.user ?? null)
    setIsInitializing(false)
  }, [])

  const login = React.useCallback(async (credentials: LoginCredentials) => {
    setIsSubmitting(true)
    try {
      const { session } = await authService.login(credentials)
      setUser(session.user)
      return session.user
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const logout = React.useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const updateCurrentUser = React.useCallback((updated: AuthUser) => {
    setUser(updated)
    authService.persistSessionUser(updated)
  }, [])

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isInitializing,
    isSubmitting,
    login,
    logout,
    updateCurrentUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider")
  return ctx
}
