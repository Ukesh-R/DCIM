import type { PaginatedResult, QueryParams } from "@/types/common.types"

export function applySearch<T>(
  records: T[],
  search: string | undefined,
  fields: (keyof T)[]
): T[] {
  if (!search || !search.trim()) return records
  const q = search.trim().toLowerCase()
  return records.filter((record) =>
    fields.some((field) => String(record[field] ?? "").toLowerCase().includes(q))
  )
}

export function applySort<T>(
  records: T[],
  sortBy: string | undefined,
  sortDir: "asc" | "desc" | undefined
): T[] {
  if (!sortBy) return records
  const dir = sortDir === "desc" ? -1 : 1
  return [...records].sort((a, b) => {
    const av = (a as Record<string, unknown>)[sortBy]
    const bv = (b as Record<string, unknown>)[sortBy]
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir
    return String(av).localeCompare(String(bv)) * dir
  })
}

export function paginate<T>(records: T[], params?: QueryParams): PaginatedResult<T> {
  const page = params?.page && params.page > 0 ? params.page : 1
  const pageSize = params?.pageSize && params.pageSize > 0 ? params.pageSize : 10
  const total = records.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize
  const data = records.slice(start, start + pageSize)

  return { data, total, page, pageSize, totalPages }
}
