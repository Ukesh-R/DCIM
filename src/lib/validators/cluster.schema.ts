import { z } from "zod"

const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/

export const clusterFormSchema = z.object({
  name: z.string().min(2, "Cluster name is required."),
  hostname: z.string().min(2, "Hostname is required."),
  ipAddress: z.string().regex(ipRegex, "Enter a valid IPv4 address."),
  status: z.enum(["active", "inactive", "maintenance", "decommissioned"]),
  environment: z.enum(["production", "staging", "development", "dr"]),
  region: z.string().min(1, "Region is required."),
  datacenter: z.string().min(1, "Datacenter is required."),
  rack: z.string().min(1, "Rack location is required."),
  cpuCores: z.number().int().min(1, "Must be at least 1 core."),
  cpuModel: z.string().min(1, "CPU model is required."),
  ramGb: z.number().int().min(1, "RAM must be greater than 0."),
  storageTb: z.number().min(0.1, "Storage must be greater than 0."),
  storageType: z.enum(["SSD", "NVMe", "HDD"]),
  nodeCount: z.number().int().min(1, "At least 1 node is required."),
  allocationStatus: z.enum(["allocated", "unallocated", "reserved"]),
  ownerId: z.string().min(1, "Owner is required."),
  department: z.string().min(1, "Department is required."),
  tags: z.string(),
})

export type ClusterFormValues = z.infer<typeof clusterFormSchema>
