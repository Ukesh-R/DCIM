import requestsSeed from "@/database/requests.json"
import type { AllocationRequest, RequestFormInput } from "@/types/request.types"
import type { PaginatedResult, QueryParams } from "@/types/common.types"
import type { User } from "@/types/user.types"
import { simulateRequest, generateId, ApiError } from "./api/httpClient"
import { EntityStore } from "./api/store"
import { applySearch, applySort, paginate } from "./api/queryUtils"
import {
  getAvailableCluster,
  setClusterAllocation,
} from "./cluster.service"
import {
  getAvailableAsset,
  setAssetAllocation,
} from "./asset.service"

const store = new EntityStore<AllocationRequest>(requestsSeed as AllocationRequest[])

export interface RequestQueryParams extends QueryParams {
  targetType?: string
  status?: string
  priority?: string
  requestedById?: string
}

export async function getRequests(params: RequestQueryParams = {}): Promise<PaginatedResult<AllocationRequest>> {
  return simulateRequest(() => {
    let records = store.getAll()
    if (params.targetType) records = records.filter((r) => r.targetType === params.targetType)
    if (params.status) records = records.filter((r) => r.status === params.status)
    if (params.priority) records = records.filter((r) => r.priority === params.priority)
    if (params.requestedById) records = records.filter((r) => r.requestedById === params.requestedById)
    records = applySearch(records, params.search, ["title", "requestNumber", "requestedByName", "customerName"])
    records = applySort(records, params.sortBy ?? "createdAt", params.sortDir ?? "desc")
    return paginate(records, params)
  })
}

export interface RequestCounts {
  total: number
  pending: number
  approved: number
  rejected: number
  cancelled: number
}

export async function getRequestCounts(targetType?: string): Promise<RequestCounts> {
  return simulateRequest(() => {
    const records = store.getAll().filter((r) => !targetType || r.targetType === targetType)
    return {
      total: records.length,
      pending: records.filter((r) => r.status === "pending").length,
      approved: records.filter((r) => r.status === "approved").length,
      rejected: records.filter((r) => r.status === "rejected").length,
      cancelled: records.filter((r) => r.status === "cancelled").length,
    }
  }, { minMs: 150, maxMs: 300 })
}

export async function getRequestById(id: string): Promise<AllocationRequest> {
  return simulateRequest(() => {
    const req = store.getById(id)
    if (!req) throw new ApiError("Request not found.", 404)
    return req
  })
}

export async function createRequest(input: RequestFormInput, requester: User): Promise<AllocationRequest> {
  return simulateRequest(() => {
    const now = new Date().toISOString()
    const count = store.getAll().length + 1
    const request: AllocationRequest = {
      id: generateId("req"),
      requestNumber: `REQ-${new Date().getFullYear()}-${String(count).padStart(5, "0")}`,
      targetType: input.targetType,
      title: input.title,
      justification: input.justification,
      priority: input.priority,
      status: "pending",
      requestedById: requester.id,
      requestedByName: requester.fullName,
      department: requester.department,
      approverId: null,
      approverName: null,
      allocatedResourceId: null,
      allocatedResourceName: null,
      requestedSpecs: input.requestedSpecs,
      customerName: input.customerName ?? null,
      createdAt: now,
      updatedAt: now,
      decidedAt: null,
      decisionNote: null,
    }
    return store.insert(request)
  })
}

/**
 * Approves a request and runs the machine-allocation workflow: finds the
 * next available unallocated cluster/asset and marks it allocated.
 */
export async function approveRequest(
  id: string,
  approver: User,
  decisionNote?: string
): Promise<AllocationRequest> {
  const existing = store.getById(id)
  if (!existing) throw new ApiError("Request not found.", 404)
  if (existing.status !== "pending") throw new ApiError("Only pending requests can be approved.", 400)

  const resource =
    existing.targetType === "cluster" ? await getAvailableCluster() : await getAvailableAsset()

  if (resource) {
    if (existing.targetType === "cluster") {
      await setClusterAllocation(resource.id, "allocated")
    } else {
      await setAssetAllocation(resource.id, "allocated")
    }
  }

  return simulateRequest(() => {
    const now = new Date().toISOString()
    const updated = store.update(id, {
      status: "approved",
      approverId: approver.id,
      approverName: approver.fullName,
      allocatedResourceId: resource?.id ?? null,
      allocatedResourceName: resource?.name ?? "Pending manual allocation",
      decidedAt: now,
      updatedAt: now,
      decisionNote: decisionNote?.trim() || "Approved — resource allocated per current capacity plan.",
    })
    if (!updated) throw new ApiError("Request not found.", 404)
    return updated
  }, { minMs: 200, maxMs: 400 })
}

export async function rejectRequest(id: string, approver: User, decisionNote: string): Promise<AllocationRequest> {
  return simulateRequest(() => {
    const existing = store.getById(id)
    if (!existing) throw new ApiError("Request not found.", 404)
    if (existing.status !== "pending") throw new ApiError("Only pending requests can be rejected.", 400)
    const now = new Date().toISOString()
    const updated = store.update(id, {
      status: "rejected",
      approverId: approver.id,
      approverName: approver.fullName,
      decidedAt: now,
      updatedAt: now,
      decisionNote: decisionNote.trim() || "Rejected by approver.",
    })
    if (!updated) throw new ApiError("Request not found.", 404)
    return updated
  })
}

export async function cancelRequest(id: string): Promise<AllocationRequest> {
  return simulateRequest(() => {
    const existing = store.getById(id)
    if (!existing) throw new ApiError("Request not found.", 404)
    if (existing.status !== "pending") throw new ApiError("Only pending requests can be cancelled.", 400)
    const now = new Date().toISOString()
    const updated = store.update(id, {
      status: "cancelled",
      updatedAt: now,
      decidedAt: now,
    })
    if (!updated) throw new ApiError("Request not found.", 404)
    return updated
  })
}

export async function deleteRequest(id: string): Promise<void> {
  return simulateRequest(() => {
    const ok = store.remove(id)
    if (!ok) throw new ApiError("Request not found.", 404)
  })
}

export async function bulkDeleteRequests(ids: string[]): Promise<number> {
  return simulateRequest(() => store.removeMany(ids))
}
