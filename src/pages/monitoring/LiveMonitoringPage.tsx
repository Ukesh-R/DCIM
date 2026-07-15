import * as React from "react"
import { Activity, RadioTower, Thermometer } from "lucide-react"

import { PageHeader } from "@/components/common/PageHeader"
import { ErrorState } from "@/components/common/ErrorState"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart"
import { GaugeChart } from "@/components/charts/GaugeChart"
import { useTheme } from "@/hooks/useTheme"
import { categoricalPalette, statusPalette } from "@/lib/chartPalette"
import { timeRangeOptions } from "@/lib/constants"
import type { MonitoringRecord, TimeRange } from "@/types/monitoring.types"
import type { SelectOption } from "@/types/common.types"
import {
  getServerOptions,
  getMonitoringSeries,
  getLatestSnapshot,
  pushLiveTick,
} from "@/services/monitoring.service"

function utilizationColor(value: number, status: ReturnType<typeof statusPalette>) {
  if (value >= 85) return status.critical
  if (value >= 65) return status.warning
  return status.good
}

export function LiveMonitoringPage() {
  const { theme } = useTheme()
  const categorical = categoricalPalette(theme)
  const status = statusPalette(theme)

  const [servers, setServers] = React.useState<SelectOption[]>([])
  const [clusterId, setClusterId] = React.useState<string>("")
  const [range, setRange] = React.useState<TimeRange>("24h")
  const [series, setSeries] = React.useState<MonitoringRecord[]>([])
  const [snapshot, setSnapshot] = React.useState<MonitoringRecord>()
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<Error>()

  React.useEffect(() => {
    getServerOptions().then((opts) => {
      setServers(opts)
      if (opts.length > 0) setClusterId(opts[0].value)
    })
  }, [])

  const loadData = React.useCallback(async () => {
    if (!clusterId) return
    setError(undefined)
    try {
      const [s, snap] = await Promise.all([
        getMonitoringSeries(clusterId, range),
        getLatestSnapshot(clusterId),
      ])
      setSeries(s)
      setSnapshot(snap)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [clusterId, range])

  React.useEffect(() => {
    setIsLoading(true)
    loadData()
  }, [loadData])

  // Simulated live feed: push a fresh sample every 6s and refresh the view.
  React.useEffect(() => {
    if (!clusterId) return
    const interval = setInterval(async () => {
      await pushLiveTick(clusterId)
      loadData()
    }, 6000)
    return () => clearInterval(interval)
  }, [clusterId, loadData])

  const chartData = series.map((s) => ({
    timestamp: new Date(s.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    cpu: s.cpuUtilization,
    ram: s.ramUtilization,
    storage: s.storageUtilization,
    networkIn: s.networkInMbps,
    networkOut: s.networkOutMbps,
    systemLoad: s.systemLoad,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Monitoring"
        description="Real-time infrastructure metrics across your cluster fleet."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={clusterId} onValueChange={setClusterId}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Select server" /></SelectTrigger>
              <SelectContent>
                {servers.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={range} onValueChange={(v) => setRange(v as TimeRange)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {error ? (
        <ErrorState onRetry={loadData} />
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            <span className="text-xs text-muted-foreground">Live · updates every 6s</span>
            {snapshot && <Badge variant="outline" className="ml-2 font-mono text-[11px]">{snapshot.ipAddress}</Badge>}
          </div>

          <Card>
            <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:justify-around">
              {isLoading || !snapshot ? (
                <>
                  <Skeleton className="size-36 rounded-full" />
                  <Skeleton className="size-36 rounded-full" />
                  <Skeleton className="size-36 rounded-full" />
                </>
              ) : (
                <>
                  <GaugeChart value={snapshot.cpuUtilization} label="CPU" color={utilizationColor(snapshot.cpuUtilization, status)} />
                  <GaugeChart value={snapshot.ramUtilization} label="RAM" color={utilizationColor(snapshot.ramUtilization, status)} />
                  <GaugeChart value={snapshot.storageUtilization} label="Storage" color={utilizationColor(snapshot.storageUtilization, status)} />
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex size-[92px] flex-col items-center justify-center rounded-full border-4 border-muted">
                      <Thermometer className="size-4 text-muted-foreground" />
                      <span className="text-lg font-bold tabular-nums">{snapshot.temperatureC}°C</span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Temperature</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="size-4" /> CPU / RAM / Storage</CardTitle>
                <CardDescription>Resource utilization over the selected time range</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : chartData.length === 0 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">No data for this range.</p>
                ) : (
                  <TimeSeriesChart
                    type="line"
                    xKey="timestamp"
                    height={260}
                    valueFormatter={(v) => `${v}%`}
                    data={chartData}
                    series={[
                      { key: "cpu", label: "CPU", color: categorical[0] },
                      { key: "ram", label: "RAM", color: categorical[6] },
                      { key: "storage", label: "Storage", color: categorical[5] },
                    ]}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><RadioTower className="size-4" /> Network Throughput</CardTitle>
                <CardDescription>Inbound and outbound traffic (Mbps)</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : chartData.length === 0 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">No data for this range.</p>
                ) : (
                  <TimeSeriesChart
                    type="area"
                    xKey="timestamp"
                    height={260}
                    valueFormatter={(v) => `${v} Mbps`}
                    data={chartData}
                    series={[
                      { key: "networkIn", label: "Inbound", color: categorical[4] },
                      { key: "networkOut", label: "Outbound", color: categorical[7] },
                    ]}
                  />
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>System Load Average</CardTitle>
                <CardDescription>Combined system load across all nodes in this cluster</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-52 w-full" />
                ) : chartData.length === 0 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">No data for this range.</p>
                ) : (
                  <TimeSeriesChart
                    type="line"
                    xKey="timestamp"
                    height={220}
                    valueFormatter={(v) => v.toFixed(2)}
                    showLegend={false}
                    data={chartData}
                    series={[{ key: "systemLoad", label: "System Load", color: categorical[2] }]}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
