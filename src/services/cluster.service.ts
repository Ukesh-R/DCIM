import clustersSeed from "@/database/clusters.json"
import type { Cluster, ClusterFormInput } from "@/types/cluster.types"
import type { PaginatedResult, QueryParams, SelectOption } from "@/types/common.types"
import { simulateRequest, generateId, ApiError } from "./api/httpClient"
import { EntityStore } from "./api/store"
import { applySearch, applySort, paginate } from "./api/queryUtils"

const store = new EntityStore<Cluster>(clustersSeed as Cluster[])

export interface ClusterQueryParams extends QueryParams {
  status?: string
  environment?: string
  region?: string
  allocationStatus?: string
}

function toCluster(input: ClusterFormInput, existing?: Cluster): Omit<Cluster, "id" | "createdAt"> {
  return {
    name: input.name,
    hostname: input.hostname,
    ipAddress: input.ipAddress,
    status: input.status,
    environment: input.environment,
    region: input.region,
    datacenter: input.datacenter,
    rack: input.rack,
    specs: {
      cpuCores: Number(input.cpuCores),
      cpuModel: input.cpuModel,
      ramGb: Number(input.ramGb),
      storageTb: Number(input.storageTb),
      storageType: input.storageType,
      nodeCount: Number(input.nodeCount),
    },
    utilizationCpu: existing?.utilizationCpu ?? 0,
    utilizationRam: existing?.utilizationRam ?? 0,
    utilizationStorage: existing?.utilizationStorage ?? 0,
    allocationStatus: input.allocationStatus,
    ownerId: input.ownerId,
    ownerName: existing?.ownerName ?? "",
    department: input.department,
    tags: input.tags.split(",").map((t) => t.trim()).filter(Boolean),
    updatedAt: new Date().toISOString(),
    lastHealthCheckAt: existing?.lastHealthCheckAt ?? new Date().toISOString(),
  }
}

export async function getClusters(params: ClusterQueryParams = {}): Promise<PaginatedResult<Cluster>> {
  return simulateRequest(() => {
    let records = store.getAll()
    if (params.status) records = records.filter((c) => c.status === params.status)
    if (params.environment) records = records.filter((c) => c.environment === params.environment)
    if (params.region) records = records.filter((c) => c.region === params.region)
    if (params.allocationStatus) records = records.filter((c) => c.allocationStatus === params.allocationStatus)
    records = applySearch(records, params.search, ["name", "hostname", "ipAddress", "ownerName", "region"])
    records = applySort(records, params.sortBy, params.sortDir)
    return paginate(records, params)
  })
}

export async function getAllClusters(): Promise<Cluster[]> {
  return simulateRequest(() => store.getAll(), { minMs: 150, maxMs: 350 })
}

export async function getClusterOptions(): Promise<SelectOption[]> {
  return simulateRequest(
    () => store.getAll().map((c) => ({ label: `${c.name} (${c.ipAddress})`, value: c.id })),
    { minMs: 100, maxMs: 250 }
  )
}

export async function getClusterById(id: string): Promise<Cluster> {
  return simulateRequest(() => {
    const cluster = store.getById(id)
    if (!cluster) throw new ApiError("Cluster not found.", 404)
    return cluster
  })
}

export async function createCluster(input: ClusterFormInput, ownerName: string): Promise<Cluster> {
  return simulateRequest(() => {
    const now = new Date().toISOString()
    const cluster: Cluster = {
      id: generateId("cl"),
      createdAt: now,
      ...toCluster(input),
      ownerName,
    }
    return store.insert(cluster)
  })
}

export async function updateCluster(id: string, input: ClusterFormInput, ownerName?: string): Promise<Cluster> {
  return simulateRequest(() => {
    const existing = store.getById(id)
    if (!existing) throw new ApiError("Cluster not found.", 404)
    const patch = toCluster(input, existing)
    const updated = store.update(id, { ...patch, ownerName: ownerName ?? existing.ownerName })
    if (!updated) throw new ApiError("Cluster not found.", 404)
    return updated
  })
}

export async function deleteCluster(id: string): Promise<void> {
  return simulateRequest(() => {
    const ok = store.remove(id)
    if (!ok) throw new ApiError("Cluster not found.", 404)
  })
}

export async function bulkDeleteClusters(ids: string[]): Promise<number> {
  return simulateRequest(() => store.removeMany(ids))
}

export async function setClusterAllocation(id: string, allocationStatus: Cluster["allocationStatus"]): Promise<Cluster> {
  return simulateRequest(() => {
    const updated = store.update(id, { allocationStatus, updatedAt: new Date().toISOString() })
    if (!updated) throw new ApiError("Cluster not found.", 404)
    return updated
  }, { minMs: 150, maxMs: 300 })
}

export async function getAvailableCluster(): Promise<Cluster | undefined> {
  return simulateRequest(
    () => store.getAll().find((c) => c.allocationStatus === "unallocated" && c.status === "active"),
    { minMs: 100, maxMs: 250 }
  )
}

export async function bulkCreateClusters(inputs: Array<ClusterFormInput & { ownerName?: string }>): Promise<number> {
  return simulateRequest(() => {
    const now = new Date().toISOString()
    inputs.forEach((input) => {
      const cluster: Cluster = {
        id: generateId("cl"),
        createdAt: now,
        ...toCluster(input),
        ownerName: input.ownerName ?? "Unassigned",
      }
      store.insert(cluster)
    })
    return inputs.length
  }, { minMs: 400, maxMs: 900 })
}
