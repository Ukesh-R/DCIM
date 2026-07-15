export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status = 500, code?: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
  }
}

export function delay(minMs = 280, maxMs = 700): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs)) + minMs
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface SimulateOptions {
  minMs?: number
  maxMs?: number
  /** 0..1 chance of throwing a simulated network/server error */
  errorRate?: number
  errorMessage?: string
}

/**
 * Wraps a synchronous data-access function to feel like a real network call:
 * randomized latency and an optional simulated failure rate.
 */
export async function simulateRequest<T>(
  fn: () => T,
  options: SimulateOptions = {}
): Promise<T> {
  const { minMs = 280, maxMs = 700, errorRate = 0, errorMessage } = options
  await delay(minMs, maxMs)

  if (errorRate > 0 && Math.random() < errorRate) {
    throw new ApiError(errorMessage ?? "Simulated network error. Please try again.", 500)
  }

  return fn()
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}
