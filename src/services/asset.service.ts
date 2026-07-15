import assetsSeed from "@/database/customerAssets.json"
import type { CustomerAsset, AssetFormInput } from "@/types/asset.types"
import type { PaginatedResult, QueryParams, SelectOption } from "@/types/common.types"
import { simulateRequest, generateId, ApiError } from "./api/httpClient"
import { EntityStore } from "./api/store"
import { applySearch, applySort, paginate } from "./api/queryUtils"

const store = new EntityStore<CustomerAsset>(assetsSeed as CustomerAsset[])

export interface AssetQueryParams extends QueryParams {
  status?: string
  type?: string
  allocationStatus?: string
  customerName?: string
}

function toAsset(input: AssetFormInput, existing?: CustomerAsset): Omit<CustomerAsset, "id" | "createdAt"> {
  return {
    assetTag: input.assetTag,
    name: input.name,
    type: input.type,
    status: input.status,
    customerName: input.customerName,
    customerId: input.customerId,
    serialNumber: input.serialNumber,
    manufacturer: input.manufacturer,
    model: input.model,
    ipAddress: input.ipAddress,
    location: input.location,
    datacenter: input.datacenter,
    allocationStatus: input.allocationStatus,
    purchaseDate: input.purchaseDate,
    warrantyExpiry: input.warrantyExpiry,
    specs: {
      cpu: input.cpu,
      ramGb: Number(input.ramGb),
      storageGb: Number(input.storageGb),
    },
    ownerId: input.ownerId,
    ownerName: existing?.ownerName ?? "",
    notes: input.notes,
    updatedAt: new Date().toISOString(),
  }
}

export async function getAssets(params: AssetQueryParams = {}): Promise<PaginatedResult<CustomerAsset>> {
  return simulateRequest(() => {
    let records = store.getAll()
    if (params.status) records = records.filter((a) => a.status === params.status)
    if (params.type) records = records.filter((a) => a.type === params.type)
    if (params.allocationStatus) records = records.filter((a) => a.allocationStatus === params.allocationStatus)
    if (params.customerName) records = records.filter((a) => a.customerName === params.customerName)
    records = applySearch(records, params.search, ["name", "assetTag", "customerName", "serialNumber", "ipAddress"])
    records = applySort(records, params.sortBy, params.sortDir)
    return paginate(records, params)
  })
}

export async function getAllAssets(): Promise<CustomerAsset[]> {
  return simulateRequest(() => store.getAll(), { minMs: 150, maxMs: 350 })
}

export async function getAssetOptions(): Promise<SelectOption[]> {
  return simulateRequest(
    () => store.getAll().map((a) => ({ label: `${a.name} (${a.assetTag})`, value: a.id })),
    { minMs: 100, maxMs: 250 }
  )
}

export async function getAssetById(id: string): Promise<CustomerAsset> {
  return simulateRequest(() => {
    const asset = store.getById(id)
    if (!asset) throw new ApiError("Asset not found.", 404)
    return asset
  })
}

export async function createAsset(input: AssetFormInput, ownerName: string): Promise<CustomerAsset> {
  return simulateRequest(() => {
    const now = new Date().toISOString()
    const asset: CustomerAsset = {
      id: generateId("ast"),
      createdAt: now,
      ...toAsset(input),
      ownerName,
    }
    return store.insert(asset)
  })
}

export async function updateAsset(id: string, input: AssetFormInput, ownerName?: string): Promise<CustomerAsset> {
  return simulateRequest(() => {
    const existing = store.getById(id)
    if (!existing) throw new ApiError("Asset not found.", 404)
    const patch = toAsset(input, existing)
    const updated = store.update(id, { ...patch, ownerName: ownerName ?? existing.ownerName })
    if (!updated) throw new ApiError("Asset not found.", 404)
    return updated
  })
}

export async function deleteAsset(id: string): Promise<void> {
  return simulateRequest(() => {
    const ok = store.remove(id)
    if (!ok) throw new ApiError("Asset not found.", 404)
  })
}

export async function bulkDeleteAssets(ids: string[]): Promise<number> {
  return simulateRequest(() => store.removeMany(ids))
}

export async function setAssetAllocation(id: string, allocationStatus: CustomerAsset["allocationStatus"]): Promise<CustomerAsset> {
  return simulateRequest(() => {
    const updated = store.update(id, { allocationStatus, updatedAt: new Date().toISOString() })
    if (!updated) throw new ApiError("Asset not found.", 404)
    return updated
  }, { minMs: 150, maxMs: 300 })
}

export async function getAvailableAsset(): Promise<CustomerAsset | undefined> {
  return simulateRequest(
    () => store.getAll().find((a) => a.allocationStatus === "unallocated" && a.status !== "retired"),
    { minMs: 100, maxMs: 250 }
  )
}

export async function bulkCreateAssets(inputs: Array<AssetFormInput & { ownerName?: string }>): Promise<number> {
  return simulateRequest(() => {
    const now = new Date().toISOString()
    inputs.forEach((input) => {
      const asset: CustomerAsset = {
        id: generateId("ast"),
        createdAt: now,
        ...toAsset(input),
        ownerName: input.ownerName ?? "Unassigned",
      }
      store.insert(asset)
    })
    return inputs.length
  }, { minMs: 400, maxMs: 900 })
}
