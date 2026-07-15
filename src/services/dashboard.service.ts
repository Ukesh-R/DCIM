import clustersSeed from "@/database/clusters.json"
import assetsSeed from "@/database/customerAssets.json"
import alertsSeed from "@/database/alerts.json"
import requestsSeed from "@/database/requests.json"
import monitoringSeed from "@/database/monitoring.json"
import type { Cluster } from "@/types/cluster.types"
import type { CustomerAsset } from "@/types/asset.types"
import type { Alert } from "@/types/alert.types"
import type { AllocationRequest } from "@/types/request.types"
import type { MonitoringRecord } from "@/types/monitoring.types"
import { simulateRequest } from "./api/httpClient"

const clusters = clustersSeed as Cluster[]
const assets = assetsSeed as CustomerAsset[]
const alerts = alertsSeed as Alert[]
const requests = requestsSeed as AllocationRequest[]
const monitoring = monitoringSeed as MonitoringRecord[]

export interface DashboardKpis {
  totalClusters: number
  activeClusters: number
  totalAssets: number
  activeAlerts: number
  criticalAlerts: number
  pendingRequests: number
  avgCpuUtilization: number
  avgRamUtilization: number
  clusterDeltaPct: number
  assetDeltaPct: number
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  return simulateRequest(() => {
    const activeClusters = clusters.filter((c) => c.status === "active")
    const openAlerts = alerts.filter((a) => a.status !== "resolved")
    const criticalAlerts = alerts.filter((a) => a.level === "critical" && a.status !== "resolved")
    const pendingRequests = requests.filter((r) => r.status === "pending")
    const avgCpu = activeClusters.reduce((s, c) => s + c.utilizationCpu, 0) / (activeClusters.length || 1)
    const avgRam = activeClusters.reduce((s, c) => s + c.utilizationRam, 0) / (activeClusters.length || 1)

    return {
      totalClusters: clusters.length,
      activeClusters: activeClusters.length,
      totalAssets: assets.length,
      activeAlerts: openAlerts.length,
      criticalAlerts: criticalAlerts.length,
      pendingRequests: pendingRequests.length,
      avgCpuUtilization: Math.round(avgCpu),
      avgRamUtilization: Math.round(avgRam),
      clusterDeltaPct: 4.2,
      assetDeltaPct: 2.6,
    }
  }, { minMs: 250, maxMs: 500 })
}

export interface TrendPoint {
  date: string
  cpu: number
  ram: number
  storage: number
}

export async function getUtilizationTrend(): Promise<TrendPoint[]> {
  return simulateRequest(() => {
    const byDay = new Map<string, { cpu: number[]; ram: number[]; storage: number[] }>()
    for (const rec of monitoring) {
      const day = rec.timestamp.slice(0, 10)
      if (!byDay.has(day)) byDay.set(day, { cpu: [], ram: [], storage: [] })
      const bucket = byDay.get(day)!
      bucket.cpu.push(rec.cpuUtilization)
      bucket.ram.push(rec.ramUtilization)
      bucket.storage.push(rec.storageUtilization)
    }
    const avg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0)
    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, cpu: avg(v.cpu), ram: avg(v.ram), storage: avg(v.storage) }))
  }, { minMs: 250, maxMs: 500 })
}

export interface StatusCount {
  name: string
  value: number
}

export async function getClustersByStatus(): Promise<StatusCount[]> {
  return simulateRequest(() => {
    const counts = new Map<string, number>()
    clusters.forEach((c) => counts.set(c.status, (counts.get(c.status) ?? 0) + 1))
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }))
  }, { minMs: 150, maxMs: 300 })
}

export async function getClustersByRegion(): Promise<StatusCount[]> {
  return simulateRequest(() => {
    const counts = new Map<string, number>()
    clusters.forEach((c) => counts.set(c.region, (counts.get(c.region) ?? 0) + 1))
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, { minMs: 150, maxMs: 300 })
}

export async function getAlertsBySeverity(): Promise<StatusCount[]> {
  return simulateRequest(() => {
    const counts = new Map<string, number>()
    alerts.forEach((a) => counts.set(a.level, (counts.get(a.level) ?? 0) + 1))
    return ["critical", "warning", "info"].map((name) => ({ name, value: counts.get(name) ?? 0 }))
  }, { minMs: 150, maxMs: 300 })
}

export interface ActivityItem {
  id: string
  type: "alert" | "request"
  title: string
  subtitle: string
  timestamp: string
  level?: string
}

export async function getRecentActivity(limit = 8): Promise<ActivityItem[]> {
  return simulateRequest(() => {
    const alertItems: ActivityItem[] = alerts.map((a) => ({
      id: a.id,
      type: "alert",
      title: a.title,
      subtitle: `${a.sourceName} · ${a.level.toUpperCase()}`,
      timestamp: a.createdAt,
      level: a.level,
    }))
    const requestItems: ActivityItem[] = requests.map((r) => ({
      id: r.id,
      type: "request",
      title: r.title,
      subtitle: `${r.requestedByName} · ${r.status.toUpperCase()}`,
      timestamp: r.createdAt,
    }))
    return [...alertItems, ...requestItems]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }, { minMs: 200, maxMs: 400 })
}
