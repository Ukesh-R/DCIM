export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface QueryParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortDir?: "asc" | "desc"
  [key: string]: unknown
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}

export interface SelectOption {
  label: string
  value: string
}

export type ID = string
