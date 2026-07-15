import usersSeed from "@/database/users.json"
import type { User, UserFormInput } from "@/types/user.types"
import type { PaginatedResult, QueryParams } from "@/types/common.types"
import { simulateRequest, generateId, ApiError } from "./api/httpClient"
import { EntityStore } from "./api/store"
import { applySearch, applySort, paginate } from "./api/queryUtils"

const store = new EntityStore<User>(usersSeed as User[])

export interface UserQueryParams extends QueryParams {
  role?: string
  status?: string
  department?: string
}

export async function getUsers(params: UserQueryParams = {}): Promise<PaginatedResult<User>> {
  return simulateRequest(() => {
    let records = store.getAll()
    if (params.role) records = records.filter((u) => u.role === params.role)
    if (params.status) records = records.filter((u) => u.status === params.status)
    if (params.department) records = records.filter((u) => u.department === params.department)
    records = applySearch(records, params.search, ["fullName", "email", "department", "jobTitle"])
    records = applySort(records, params.sortBy, params.sortDir)
    return paginate(records, params)
  })
}

export async function getAllUsers(): Promise<User[]> {
  return simulateRequest(() => store.getAll(), { minMs: 150, maxMs: 350 })
}

export async function getUserById(id: string): Promise<User> {
  return simulateRequest(() => {
    const user = store.getById(id)
    if (!user) throw new ApiError("User not found.", 404)
    return user
  })
}

export async function createUser(input: UserFormInput): Promise<User> {
  return simulateRequest(() => {
    const now = new Date().toISOString()
    const user: User = {
      id: generateId("usr"),
      ...input,
      fullName: `${input.firstName} ${input.lastName}`,
      avatarColor: ["blue", "purple", "green", "amber", "rose", "cyan"][Math.floor(Math.random() * 6)],
      createdAt: now,
      lastLoginAt: null,
    }
    return store.insert(user)
  })
}

export async function updateUser(id: string, input: Partial<UserFormInput>): Promise<User> {
  return simulateRequest(() => {
    const patch: Partial<User> = { ...input }
    if (input.firstName || input.lastName) {
      const existing = store.getById(id)
      const first = input.firstName ?? existing?.firstName ?? ""
      const last = input.lastName ?? existing?.lastName ?? ""
      patch.fullName = `${first} ${last}`
    }
    const updated = store.update(id, patch)
    if (!updated) throw new ApiError("User not found.", 404)
    return updated
  })
}

export async function deleteUser(id: string): Promise<void> {
  return simulateRequest(() => {
    const ok = store.remove(id)
    if (!ok) throw new ApiError("User not found.", 404)
  })
}

export async function bulkDeleteUsers(ids: string[]): Promise<number> {
  return simulateRequest(() => store.removeMany(ids))
}
