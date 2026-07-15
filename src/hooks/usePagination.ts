import * as React from "react"

import { DEFAULT_PAGE_SIZE } from "@/lib/constants"

export function usePagination(initialPage = 1, initialPageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = React.useState(initialPage)
  const [pageSize, setPageSizeState] = React.useState(initialPageSize)

  const setPageSize = React.useCallback((size: number) => {
    setPageSizeState(size)
    setPage(1)
  }, [])

  const resetPage = React.useCallback(() => setPage(1), [])

  return { page, pageSize, setPage, setPageSize, resetPage }
}
