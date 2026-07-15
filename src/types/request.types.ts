export type RequestTargetType = "cluster" | "asset"

export type RequestStatus = "pending" | "approved" | "rejected" | "cancelled"

export type RequestPriority = "low" | "medium" | "high" | "urgent"

export interface AllocationRequest {
  id: string
  requestNumber: string
  targetType: RequestTargetType
  title: string
  justification: string
  priority: RequestPriority
  status: RequestStatus
  requestedById: string
  requestedByName: string
  department: string
  approverId: string | null
  approverName: string | null
  allocatedResourceId: string | null
  allocatedResourceName: string | null
  requestedSpecs: string
  customerName: string | null
  createdAt: string
  updatedAt: string
  decidedAt: string | null
  decisionNote: string | null
}

export interface RequestFormInput {
  targetType: RequestTargetType
  title: string
  justification: string
  priority: RequestPriority
  requestedSpecs: string
  customerName?: string
}
