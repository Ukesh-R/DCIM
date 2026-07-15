import usersSeed from "@/database/users.json"
import type { User } from "@/types/user.types"
import type { AuthSession, LoginCredentials, LoginResult } from "@/types/auth.types"
import { ApiError, simulateRequest, generateId } from "./api/httpClient"

const users = usersSeed as User[]

// Demo credentials — documented on the login page.
const DEMO_PASSWORDS: Record<string, string> = {
  "admin@dcims.io": "Admin@123",
  "user@dcims.io": "User@123",
}
const DEFAULT_PASSWORD = "Demo@123"

const SESSION_KEY = "dcims_session"

export async function login({ email, password }: LoginCredentials): Promise<LoginResult> {
  return simulateRequest(
    () => {
      const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
      if (!user) {
        throw new ApiError("No account found with that email address.", 401)
      }
      if (user.status !== "active") {
        throw new ApiError("This account is not active. Contact an administrator.", 403)
      }
      const expected = DEMO_PASSWORDS[user.email] ?? DEFAULT_PASSWORD
      if (password !== expected) {
        throw new ApiError("Incorrect password. Please try again.", 401)
      }

      const session: AuthSession = {
        token: generateId("token"),
        user,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      return { session }
    },
    { minMs: 500, maxMs: 900 }
  )
}

export async function logout(): Promise<void> {
  return simulateRequest(() => {
    localStorage.removeItem(SESSION_KEY)
  }, { minMs: 150, maxMs: 300 })
}

export function getStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as AuthSession
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

export function persistSessionUser(user: User) {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return
  const session = JSON.parse(raw) as AuthSession
  session.user = user
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export async function changePassword(_currentPassword: string, _newPassword: string): Promise<void> {
  return simulateRequest(() => {
    // Mock backend: demo credentials are fixed, so this simulates success without persisting.
  }, { minMs: 500, maxMs: 900 })
}

export const demoCredentials = [
  { role: "Admin", email: "admin@dcims.io", password: DEMO_PASSWORDS["admin@dcims.io"] },
  { role: "User", email: "user@dcims.io", password: DEMO_PASSWORDS["user@dcims.io"] },
]
