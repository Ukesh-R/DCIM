import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Cpu, HardDrive, MemoryStick, Pencil, Server, Trash2 } from "lucide-react"

import { PageHeader } from "@/components/common/PageHeader"
import { StatusBadge } from "@/components/common/StatusBadge"
import { ErrorState } from "@/components/common/ErrorState"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart"
import { useAsync } from "@/hooks/useAsync"
import { useAuth } from "@/hooks/useAuth"
import { useConfirm } from "@/hooks/useConfirm"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "@/hooks/useTheme"
import { categoricalPalette } from "@/lib/chartPalette"
import { formatDateTime } from "@/lib/format"
import { getClusterById, deleteCluster } from "@/services/cluster.service"
import { getMonitoringSeries } from "@/services/monitoring.service"
import { ClusterFormDialog } from "./ClusterFormDialog"
import { getAllUsers } from "@/services/user.service"
import type { SelectOption } from "@/types/common.types"

async function loadClusterDetail(id: string) {
  const cluster = await getClusterById(id)
  const series = await getMonitoringSeries(id, "24h")
  return { cluster, series }
}

export function ClusterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const confirm = useConfirm()
  const { toast } = useToast()
  const { theme } = useTheme()
  const categorical = categoricalPalette(theme)
  const isAdmin = user?.role === "admin"

  const { data, isLoading, error, reload } = useAsync(() => loadClusterDetail(id!), [id])
  const [formOpen, setFormOpen] = React.useState(false)
  const [ownerOptions, setOwnerOptions] = React.useState<SelectOption[]>([])

  React.useEffect(() => {
    getAllUsers().then((users) =>
      setOwnerOptions(users.map((u) => ({ label: `${u.fullName} (${u.department})`, value: u.id })))
    )
  }, [])

  const handleDelete = async () => {
    if (!data) return
    const ok = await confirm({
      title: `Delete ${data.cluster.name}?`,
      description: "This will permanently remove the cluster record.",
      confirmLabel: "Delete",
      variant: "destructive",
    })
    if (!ok) return
    await deleteCluster(data.cluster.id)
    toast({ title: "Cluster deleted" })
    navigate("/clusters")
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate("/clusters")}>
          <ArrowLeft className="size-4" /> Back to Clusters
        </Button>
        <ErrorState onRetry={reload} title="Cluster not found" description="This cluster may have been removed." />
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  const { cluster, series } = data

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" className="w-fit gap-1.5" onClick={() => navigate("/clusters")}>
          <ArrowLeft className="size-4" /> Back to Clusters
        </Button>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setFormOpen(true)}>
              <Pencil className="size-4" /> Edit
            </Button>
            <Button variant="destructive" size="sm" className="gap-1.5" onClick={handleDelete}>
              <Trash2 className="size-4" /> Delete
            </Button>
          </div>
        )}
      </div>

      <PageHeader
        title={cluster.name}
        description={`${cluster.hostname} · ${cluster.ipAddress}`}
        actions={
          <>
            <StatusBadge status={cluster.status} />
            <StatusBadge status={cluster.allocationStatus} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Utilization (Last 24 Hours)</CardTitle>
            <CardDescription>CPU, RAM, and storage utilization trend for this cluster</CardDescription>
          </CardHeader>
          <CardContent>
            {series.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">No monitoring data available for this cluster.</p>
            ) : (
              <TimeSeriesChart
                type="line"
                xKey="timestamp"
                valueFormatter={(v) => `${v}%`}
                data={series.map((s) => ({
                  timestamp: new Date(s.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  cpu: s.cpuUtilization,
                  ram: s.ramUtilization,
                  storage: s.storageUtilization,
                }))}
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
            <CardTitle>Current Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground"><Cpu className="size-3.5" /> CPU</span>
                <span className="font-medium tabular-nums">{cluster.utilizationCpu}%</span>
              </div>
              <Progress value={cluster.utilizationCpu} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground"><MemoryStick className="size-3.5" /> RAM</span>
                <span className="font-medium tabular-nums">{cluster.utilizationRam}%</span>
              </div>
              <Progress value={cluster.utilizationRam} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground"><HardDrive className="size-3.5" /> Storage</span>
                <span className="font-medium tabular-nums">{cluster.utilizationStorage}%</span>
              </div>
              <Progress value={cluster.utilizationStorage} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Server className="size-4" /> Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="CPU" value={`${cluster.specs.cpuCores} cores · ${cluster.specs.cpuModel}`} />
            <Row label="RAM" value={`${cluster.specs.ramGb} GB`} />
            <Row label="Storage" value={`${cluster.specs.storageTb} TB · ${cluster.specs.storageType}`} />
            <Row label="Nodes" value={String(cluster.specs.nodeCount)} />
            <Row label="Rack" value={cluster.rack} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location & Environment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Environment" value={<span className="capitalize">{cluster.environment}</span>} />
            <Row label="Region" value={cluster.region} />
            <Row label="Datacenter" value={cluster.datacenter} />
            <Row label="Last Health Check" value={formatDateTime(cluster.lastHealthCheckAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ownership</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Owner" value={cluster.ownerName} />
            <Row label="Department" value={cluster.department} />
            <Row label="Created" value={formatDateTime(cluster.createdAt)} />
            <Row label="Updated" value={formatDateTime(cluster.updatedAt)} />
            {cluster.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {cluster.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ClusterFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        cluster={cluster}
        ownerOptions={ownerOptions}
        onSuccess={reload}
      />
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
