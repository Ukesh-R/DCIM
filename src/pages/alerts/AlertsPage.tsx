import * as React from "react"
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table"
import { CheckCircle2, MoreHorizontal, ShieldCheck, Trash2 } from "lucide-react"

import { PageHeader } from "@/components/common/PageHeader"
import { SearchInput } from "@/components/common/SearchInput"
import { DataTable } from "@/components/common/DataTable"
import { SortableHeader } from "@/components/common/SortableHeader"
import { StatusBadge } from "@/components/common/StatusBadge"
import { CsvExportButton } from "@/components/common/CsvExportButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDebounce } from "@/hooks/useDebounce"
import { usePagination } from "@/hooks/usePagination"
import { useConfirm } from "@/hooks/useConfirm"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { alertLevelOptions, alertStatusOptions } from "@/lib/constants"
import { formatRelativeTime } from "@/lib/format"
import type { Alert } from "@/types/alert.types"
import {
  getAlerts,
  acknowledgeAlert,
  resolveAlert,
  bulkDeleteAlerts,
  type AlertQueryParams,
} from "@/services/alert.service"
import { AlertDetailModal } from "./AlertDetailModal"

export function AlertsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const confirm = useConfirm()
  const isAdmin = user?.role === "admin"

  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [level, setLevel] = React.useState<string>("all")
  const [status, setStatus] = React.useState<string>("all")
  const [sort, setSort] = React.useState<{ sortBy?: string; sortDir?: "asc" | "desc" }>({
    sortBy: "createdAt",
    sortDir: "desc",
  })
  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination()
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [refreshKey, setRefreshKey] = React.useState(0)

  const [data, setData] = React.useState<Alert[]>([])
  const [total, setTotal] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<Error>()
  const [selectedAlert, setSelectedAlert] = React.useState<Alert | null>(null)

  const reload = () => setRefreshKey((k) => k + 1)

  React.useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(undefined)

    const params: AlertQueryParams = {
      page,
      pageSize,
      search: debouncedSearch,
      sortBy: sort.sortBy,
      sortDir: sort.sortDir,
      level: level === "all" ? undefined : level,
      status: status === "all" ? undefined : status,
    }

    getAlerts(params)
      .then((res) => {
        if (cancelled) return
        setData(res.data)
        setTotal(res.total)
        setTotalPages(res.totalPages)
      })
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setIsLoading(false))

    return () => {
      cancelled = true
    }
  }, [page, pageSize, debouncedSearch, sort, level, status, refreshKey])

  const handleSortChange = (sortKey: string) => {
    setSort((prev) => ({
      sortBy: sortKey,
      sortDir: prev.sortBy === sortKey && prev.sortDir === "asc" ? "desc" : "asc",
    }))
  }

  const handleAcknowledge = async (alert: Alert) => {
    if (!user) return
    await acknowledgeAlert(alert.id, user.fullName)
    toast({ title: "Alert acknowledged", description: alert.title })
    setSelectedAlert(null)
    reload()
  }

  const handleResolve = async (alert: Alert) => {
    await resolveAlert(alert.id)
    toast({ title: "Alert resolved", description: alert.title })
    setSelectedAlert(null)
    reload()
  }

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])

  const handleBulkDelete = async () => {
    const ok = await confirm({
      title: `Delete ${selectedIds.length} alerts?`,
      description: "This will permanently remove the selected alert records.",
      confirmLabel: "Delete All",
      variant: "destructive",
    })
    if (!ok) return
    await bulkDeleteAlerts(selectedIds)
    toast({ title: "Alerts deleted", description: `${selectedIds.length} alerts removed.` })
    setRowSelection({})
    reload()
  }

  const columns: ColumnDef<Alert, unknown>[] = [
    {
      id: "title",
      header: () => <SortableHeader label="Alert" sortKey="title" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => (
        <div className="min-w-[220px]">
          <p className="font-medium">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.sourceName} · {row.original.ipAddress}</p>
        </div>
      ),
    },
    {
      id: "level",
      header: () => <SortableHeader label="Level" sortKey="level" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => <StatusBadge status={row.original.level} />,
    },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => <span className="capitalize text-muted-foreground">{row.original.category}</span>,
    },
    {
      id: "status",
      header: () => <SortableHeader label="Status" sortKey="status" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "metric",
      header: "Metric",
      cell: ({ row }) => (
        <span className="text-xs tabular-nums text-muted-foreground">
          {row.original.metricValue}{row.original.metricUnit} / {row.original.metricThreshold}{row.original.metricUnit}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: () => <SortableHeader label="Created" sortKey="createdAt" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatRelativeTime(row.original.createdAt)}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            {row.original.status === "open" && (
              <DropdownMenuItem onClick={() => handleAcknowledge(row.original)}>
                <ShieldCheck /> Acknowledge
              </DropdownMenuItem>
            )}
            {row.original.status !== "resolved" && (
              <DropdownMenuItem onClick={() => handleResolve(row.original)}>
                <CheckCircle2 /> Mark Resolved
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const criticalOpenCount = data.filter((a) => a.level === "critical" && a.status !== "resolved").length

  return (
    <div className="space-y-6">
      <PageHeader title="Alerts Management" description="Monitor and respond to infrastructure alerts across your fleet." />

      {criticalOpenCount > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldCheck className="size-4.5" />
            </div>
            <p className="text-sm">
              <span className="font-semibold text-destructive">{criticalOpenCount} critical alert(s)</span> on this page require immediate attention.
            </p>
          </CardContent>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={data}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        enableRowSelection={isAdmin}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowClick={(row) => setSelectedAlert(row)}
        emptyTitle="No alerts found"
        emptyDescription="Try adjusting your search or filters."
        toolbar={
          <>
            <SearchInput value={search} onChange={(v) => { setSearch(v); resetPage() }} placeholder="Search alerts..." />
            <Select value={level} onValueChange={(v) => { setLevel(v); resetPage() }}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {alertLevelOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => { setStatus(v); resetPage() }}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {alertStatusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              {selectedIds.length > 0 && isAdmin && (
                <Button variant="destructive" size="sm" className="gap-1.5" onClick={handleBulkDelete}>
                  <Trash2 className="size-4" />
                  Delete ({selectedIds.length})
                </Button>
              )}
              <CsvExportButton
                data={data}
                filename="alerts-export"
                columns={["id", "title", "level", "status", "category", "sourceName", "createdAt"]}
              />
            </div>
          </>
        }
      />

      <AlertDetailModal
        alert={selectedAlert}
        open={!!selectedAlert}
        onOpenChange={(open) => !open && setSelectedAlert(null)}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
      />
    </div>
  )
}
