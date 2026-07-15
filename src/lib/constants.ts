import type { SelectOption } from "@/types/common.types"

export const APP_NAME = "DCIMS"
export const APP_FULL_NAME = "Data Center & Inventory Management System"

export const DEPARTMENTS = [
  "Infrastructure",
  "Network Operations",
  "Site Reliability",
  "Security",
  "IT Support",
  "Cloud Platform",
  "Database Administration",
  "Customer Success",
  "Procurement",
  "Executive",
] as const

export const departmentOptions: SelectOption[] = DEPARTMENTS.map((d) => ({ label: d, value: d }))

export const roleOptions: SelectOption[] = [
  { label: "Admin", value: "admin" },
  { label: "User", value: "user" },
]

export const userStatusOptions: SelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
]

export const clusterStatusOptions: SelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Decommissioned", value: "decommissioned" },
]

export const clusterEnvironmentOptions: SelectOption[] = [
  { label: "Production", value: "production" },
  { label: "Staging", value: "staging" },
  { label: "Development", value: "development" },
  { label: "DR", value: "dr" },
]

export const allocationStatusOptions: SelectOption[] = [
  { label: "Allocated", value: "allocated" },
  { label: "Unallocated", value: "unallocated" },
  { label: "Reserved", value: "reserved" },
]

export const storageTypeOptions: SelectOption[] = [
  { label: "NVMe", value: "NVMe" },
  { label: "SSD", value: "SSD" },
  { label: "HDD", value: "HDD" },
]

export const assetTypeOptions: SelectOption[] = [
  { label: "Server", value: "server" },
  { label: "Storage", value: "storage" },
  { label: "Network", value: "network" },
  { label: "Workstation", value: "workstation" },
  { label: "Peripheral", value: "peripheral" },
]

export const assetStatusOptions: SelectOption[] = [
  { label: "In Service", value: "in-service" },
  { label: "In Storage", value: "in-storage" },
  { label: "Under Repair", value: "under-repair" },
  { label: "Retired", value: "retired" },
]

export const alertLevelOptions: SelectOption[] = [
  { label: "Critical", value: "critical" },
  { label: "Warning", value: "warning" },
  { label: "Info", value: "info" },
]

export const alertStatusOptions: SelectOption[] = [
  { label: "Open", value: "open" },
  { label: "Acknowledged", value: "acknowledged" },
  { label: "Resolved", value: "resolved" },
]

export const requestStatusOptions: SelectOption[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
]

export const requestPriorityOptions: SelectOption[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
]

export const timeRangeOptions: SelectOption[] = [
  { label: "Last 1 hour", value: "1h" },
  { label: "Last 6 hours", value: "6h" },
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
]

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]
export const DEFAULT_PAGE_SIZE = 10
