import alertsSeed from "@/database/alerts.json"
import type { Alert } from "@/types/alert.types"
import type { PaginatedResult, QueryParams } from "@/types/common.types"
import { simulateRequest, ApiError } from "./api/httpClient"
import { EntityStore } from "./api/store"
import { applySearch, applySort, paginate } from "./api/queryUtils"

const store = new EntityStore<Alert>(alertsSeed as Alert[])

export interface AlertQueryParams extends QueryParams {
  level?: string
  status?: string
  category?: string
  sourceType?: string
}

export async function getAlerts(params: AlertQueryParams = {}): Promise<PaginatedResult<Alert>> {
  return simulateRequest(() => {
    let records = store.getAll()
    if (params.level) records = records.filter((a) => a.level === params.level)
    if (params.status) records = records.filter((a) => a.status === params.status)
    if (params.category) records = records.filter((a) => a.category === params.category)
    if (params.sourceType) records = records.filter((a) => a.sourceType === params.sourceType)
    records = applySearch(records, params.search, ["title", "description", "sourceName", "ipAddress"])
    records = applySort(records, params.sortBy ?? "createdAt", params.sortDir ?? "desc")
    return paginate(records, params)
  })
}

export async function getAllAlerts(): Promise<Alert[]> {
  return simulateRequest(() => store.getAll(), { minMs: 150, maxMs: 350 })
}

export async function getAlertById(id: string): Promise<Alert> {
  return simulateRequest(() => {
    const alert = store.getById(id)
    if (!alert) throw new ApiError("Alert not found.", 404)
    return alert
  })
}

export async function acknowledgeAlert(id: string, byName: string): Promise<Alert> {
  return simulateRequest(() => {
    const updated = store.update(id, {
      status: "acknowledged",
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: byName,
    })
    if (!updated) throw new ApiError("Alert not found.", 404)
    return updated
  })
}

export async function resolveAlert(id: string): Promise<Alert> {
  return simulateRequest(() => {
    const updated = store.update(id, {
      status: "resolved",
      resolvedAt: new Date().toISOString(),
    })
    if (!updated) throw new ApiError("Alert not found.", 404)
    return updated
  })
}

export async function deleteAlert(id: string): Promise<void> {
  return simulateRequest(() => {
    const ok = store.remove(id)
    if (!ok) throw new ApiError("Alert not found.", 404)
  })
}

export async function bulkDeleteAlerts(ids: string[]): Promise<number> {
  return simulateRequest(() => store.removeMany(ids))
}
