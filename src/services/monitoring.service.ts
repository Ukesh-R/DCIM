import monitoringSeed from "@/database/monitoring.json"
import type { MonitoringRecord, TimeRange } from "@/types/monitoring.types"
import type { SelectOption } from "@/types/common.types"
import { simulateRequest, generateId } from "./api/httpClient"

let records: MonitoringRecord[] = structuredClone(monitoringSeed as MonitoringRecord[])

const RANGE_HOURS: Record<TimeRange, number> = {
  "1h": 1,
  "6h": 6,
  "24h": 24,
  "7d": 24 * 7,
}

export async function getServerOptions(): Promise<SelectOption[]> {
  return simulateRequest(() => {
    const seen = new Map<string, string>()
    for (const r of records) {
      if (!seen.has(r.clusterId)) seen.set(r.clusterId, `${r.clusterName} — ${r.ipAddress}`)
    }
    return Array.from(seen.entries()).map(([value, label]) => ({ value, label }))
  }, { minMs: 150, maxMs: 300 })
}

export async function getMonitoringSeries(clusterId: string, range: TimeRange): Promise<MonitoringRecord[]> {
  return simulateRequest(() => {
    const cutoff = Date.now() - RANGE_HOURS[range] * 3600000
    return records
      .filter((r) => r.clusterId === clusterId && new Date(r.timestamp).getTime() >= cutoff)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }, { minMs: 250, maxMs: 550 })
}

export async function getLatestSnapshot(clusterId: string): Promise<MonitoringRecord | undefined> {
  return simulateRequest(() => {
    const filtered = records.filter((r) => r.clusterId === clusterId)
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
  }, { minMs: 100, maxMs: 250 })
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/** Appends a fresh sample derived from the last known state, simulating a live metrics feed. */
export async function pushLiveTick(clusterId: string): Promise<MonitoringRecord> {
  return simulateRequest(() => {
    const last = [...records]
      .filter((r) => r.clusterId === clusterId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

    const base = last ?? records[0]
    const drift = () => Math.floor((Math.random() - 0.5) * 10)

    const next: MonitoringRecord = {
      id: generateId("mon"),
      clusterId,
      clusterName: base.clusterName,
      ipAddress: base.ipAddress,
      timestamp: new Date().toISOString(),
      cpuUtilization: clamp(base.cpuUtilization + drift(), 1, 99),
      ramUtilization: clamp(base.ramUtilization + drift(), 1, 99),
      storageUtilization: clamp(base.storageUtilization + Math.floor(drift() / 3), 1, 99),
      networkInMbps: clamp(base.networkInMbps + drift() * 4, 1, 1000),
      networkOutMbps: clamp(base.networkOutMbps + drift() * 4, 1, 1000),
      systemLoad: Number(clamp(base.systemLoad + (Math.random() - 0.5), 0.1, 12).toFixed(2)),
      temperatureC: clamp(base.temperatureC + Math.floor((Math.random() - 0.5) * 2), 25, 90),
      uptimeSeconds: base.uptimeSeconds + 30,
    }
    records = [...records, next]
    return next
  }, { minMs: 200, maxMs: 400 })
}
