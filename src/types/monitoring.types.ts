export interface MonitoringRecord {
  id: string
  clusterId: string
  clusterName: string
  ipAddress: string
  timestamp: string
  cpuUtilization: number
  ramUtilization: number
  storageUtilization: number
  networkInMbps: number
  networkOutMbps: number
  systemLoad: number
  temperatureC: number
  uptimeSeconds: number
}

export type TimeRange = "1h" | "6h" | "24h" | "7d"
