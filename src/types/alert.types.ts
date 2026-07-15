export type AlertLevel = "critical" | "warning" | "info"

export type AlertStatus = "open" | "acknowledged" | "resolved"

export type AlertSourceType = "cluster" | "asset"

export type AlertCategory =
  | "performance"
  | "availability"
  | "security"
  | "capacity"
  | "hardware"
  | "network"

export interface Alert {
  id: string
  title: string
  description: string
  level: AlertLevel
  status: AlertStatus
  category: AlertCategory
  sourceType: AlertSourceType
  sourceId: string
  sourceName: string
  ipAddress: string
  recommendation: string
  metricValue: number
  metricThreshold: number
  metricUnit: string
  createdAt: string
  acknowledgedAt: string | null
  acknowledgedBy: string | null
  resolvedAt: string | null
}
