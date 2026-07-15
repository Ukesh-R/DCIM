import { BellRing, ClipboardList, Gauge, Server } from "lucide-react"

import { PageHeader } from "@/components/common/PageHeader"
import { KpiCard } from "@/components/common/KpiCard"
import { CardGridSkeleton } from "@/components/common/TableSkeleton"
import { ErrorState } from "@/components/common/ErrorState"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart"
import { DonutChart } from "@/components/charts/DonutChart"
import { CategoryBarChart } from "@/components/charts/CategoryBarChart"
import { useAsync } from "@/hooks/useAsync"
import { useTheme } from "@/hooks/useTheme"
import { categoricalPalette, statusPalette, chromePalette } from "@/lib/chartPalette"
import { formatRelativeTime } from "@/lib/format"
import {
  getDashboardKpis,
  getUtilizationTrend,
  getClustersByStatus,
  getClustersByRegion,
  getAlertsBySeverity,
  getRecentActivity,
} from "@/services/dashboard.service"

async function loadDashboard() {
  const [kpis, trend, byStatus, byRegion, bySeverity, activity] = await Promise.all([
    getDashboardKpis(),
    getUtilizationTrend(),
    getClustersByStatus(),
    getClustersByRegion(),
    getAlertsBySeverity(),
    getRecentActivity(8),
  ])
  return { kpis, trend, byStatus, byRegion, bySeverity, activity }
}

const STATUS_COLOR_KEY: Record<string, keyof ReturnType<typeof statusPalette>> = {
  active: "good",
  maintenance: "warning",
  inactive: "serious",
  decommissioned: "critical",
}

const LEVEL_DOT: Record<string, string> = {
  critical: "bg-destructive",
  warning: "bg-warning",
  info: "bg-info",
}

export function DashboardPage() {
  const { theme } = useTheme()
  const { data, isLoading, error, reload } = useAsync(loadDashboard, [])
  const categorical = categoricalPalette(theme)
  const status = statusPalette(theme)
  const chrome = chromePalette(theme)

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Fleet-wide overview of your data center estate." />
        <ErrorState onRetry={reload} />
      </div>
    )
  }

  const kpis = data?.kpis

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Fleet-wide overview of your data center estate." />

      {isLoading || !kpis ? (
        <CardGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            index={0}
            label="Total Clusters"
            value={kpis.totalClusters}
            icon={Server}
            accent="primary"
            deltaPct={kpis.clusterDeltaPct}
            deltaLabel="vs last month"
          />
          <KpiCard
            index={1}
            label="Active Alerts"
            value={kpis.activeAlerts}
            icon={BellRing}
            accent="destructive"
            deltaPct={kpis.criticalAlerts > 0 ? -kpis.criticalAlerts : 0}
            deltaLabel="critical"
          />
          <KpiCard
            index={2}
            label="Pending Requests"
            value={kpis.pendingRequests}
            icon={ClipboardList}
            accent="warning"
          />
          <KpiCard
            index={3}
            label="Avg CPU Utilization"
            value={`${kpis.avgCpuUtilization}%`}
            icon={Gauge}
            accent="info"
            deltaPct={kpis.assetDeltaPct}
            deltaLabel="vs last week"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Utilization Trend</CardTitle>
            <CardDescription>Average CPU, RAM, and storage utilization across active clusters (7 days)</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <TimeSeriesChart
                data={data.trend}
                xKey="date"
                type="area"
                valueFormatter={(v) => `${v}%`}
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
            <CardTitle>Alerts by Severity</CardTitle>
            <CardDescription>Distribution of all recorded alerts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <DonutChart
                centerLabel="Total Alerts"
                centerValue={data.bySeverity.reduce((s, d) => s + d.value, 0)}
                data={[
                  { name: "Critical", value: data.bySeverity.find((d) => d.name === "critical")?.value ?? 0, color: status.critical },
                  { name: "Warning", value: data.bySeverity.find((d) => d.name === "warning")?.value ?? 0, color: status.warning },
                  { name: "Info", value: data.bySeverity.find((d) => d.name === "info")?.value ?? 0, color: categorical[0] },
                ]}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Clusters by Status</CardTitle>
            <CardDescription>Operational state across the fleet</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <CategoryBarChart
                layout="vertical"
                data={data.byStatus.map((d) => ({
                  name: d.name,
                  value: d.value,
                  color: status[STATUS_COLOR_KEY[d.name] ?? "good"],
                }))}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clusters by Region</CardTitle>
            <CardDescription>Geographic distribution of deployed clusters</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <CategoryBarChart
                layout="vertical"
                data={data.byRegion.map((d, i) => ({
                  name: d.name,
                  value: d.value,
                  color: categorical[i % categorical.length],
                }))}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest alerts and requests</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[300px] space-y-1 overflow-y-auto">
            {isLoading || !data ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : data.activity.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              data.activity.map((item) => (
                <div key={item.id} className="flex items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-accent">
                  <span
                    className={item.level ? `mt-1.5 size-1.5 shrink-0 rounded-full ${LEVEL_DOT[item.level]}` : "mt-1.5 size-1.5 shrink-0 rounded-full"}
                    style={item.level ? undefined : { backgroundColor: chrome.muted }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{formatRelativeTime(item.timestamp)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
