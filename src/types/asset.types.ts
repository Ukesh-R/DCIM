export type AssetType = "server" | "storage" | "network" | "workstation" | "peripheral"

export type AssetStatus = "in-service" | "in-storage" | "under-repair" | "retired"

export type AllocationStatus = "allocated" | "unallocated" | "reserved"

export interface CustomerAsset {
  id: string
  assetTag: string
  name: string
  type: AssetType
  status: AssetStatus
  customerName: string
  customerId: string
  serialNumber: string
  manufacturer: string
  model: string
  ipAddress: string
  location: string
  datacenter: string
  allocationStatus: AllocationStatus
  purchaseDate: string
  warrantyExpiry: string
  specs: {
    cpu: string
    ramGb: number
    storageGb: number
  }
  ownerId: string
  ownerName: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface AssetFormInput {
  assetTag: string
  name: string
  type: AssetType
  status: AssetStatus
  customerName: string
  customerId: string
  serialNumber: string
  manufacturer: string
  model: string
  ipAddress: string
  location: string
  datacenter: string
  allocationStatus: AllocationStatus
  purchaseDate: string
  warrantyExpiry: string
  cpu: string
  ramGb: number
  storageGb: number
  ownerId: string
  notes: string
}
