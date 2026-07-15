import * as React from "react"

interface UseAsyncState<T> {
  data: T | undefined
  error: Error | undefined
  isLoading: boolean
}

/**
 * Runs an async factory whenever `deps` change, exposing loading/error/data
 * state. Used to drive page-level fetches against the mock service layer.
 */
export function useAsync<T>(factory: () => Promise<T>, deps: React.DependencyList) {
  const [state, setState] = React.useState<UseAsyncState<T>>({
    data: undefined,
    error: undefined,
    isLoading: true,
  })
  const [reloadKey, setReloadKey] = React.useState(0)

  React.useEffect(() => {
    let cancelled = false
    setState((prev) => ({ ...prev, isLoading: true, error: undefined }))

    factory()
      .then((data) => {
        if (!cancelled) setState({ data, error: undefined, isLoading: false })
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ data: undefined, error, isLoading: false })
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey])

  const reload = React.useCallback(() => setReloadKey((k) => k + 1), [])

  return { ...state, reload }
}
