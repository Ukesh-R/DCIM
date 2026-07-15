export type ClusterStatus = "active" | "inactive" | "maintenance" | "decommissioned"

export type ClusterEnvironment = "production" | "staging" | "development" | "dr"

export type AllocationStatus = "allocated" | "unallocated" | "reserved"

export interface ClusterSpecs {
  cpuCores: number
  cpuModel: string
  ramGb: number
  storageTb: number
  storageType: "SSD" | "NVMe" | "HDD"
  nodeCount: number
}

export interface Cluster {
  id: string
  name: string
  hostname: string
  ipAddress: string
  status: ClusterStatus
  environment: ClusterEnvironment
  region: string
  datacenter: string
  rack: string
  specs: ClusterSpecs
  utilizationCpu: number
  utilizationRam: number
  utilizationStorage: number
  allocationStatus: AllocationStatus
  ownerId: string
  ownerName: string
  department: string
  tags: string[]
  createdAt: string
  updatedAt: string
  lastHealthCheckAt: string
}

export interface ClusterFormInput {
  name: string
  hostname: string
  ipAddress: string
  status: ClusterStatus
  environment: ClusterEnvironment
  region: string
  datacenter: string
  rack: string
  cpuCores: number
  cpuModel: string
  ramGb: number
  storageTb: number
  storageType: "SSD" | "NVMe" | "HDD"
  nodeCount: number
  allocationStatus: AllocationStatus
  ownerId: string
  department: string
  tags: string
}
