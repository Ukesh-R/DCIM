import * as React from "react"
import { useNavigate } from "react-router-dom"
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table"
import { MoreHorizontal, Plus, Trash2, Pencil, Eye } from "lucide-react"

import { PageHeader } from "@/components/common/PageHeader"
import { SearchInput } from "@/components/common/SearchInput"
import { DataTable } from "@/components/common/DataTable"
import { SortableHeader } from "@/components/common/SortableHeader"
import { StatusBadge } from "@/components/common/StatusBadge"
import { CsvImportButton } from "@/components/common/CsvImportButton"
import { CsvExportButton } from "@/components/common/CsvExportButton"
import { Button } from "@/components/ui/button"
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
import { clusterStatusOptions, clusterEnvironmentOptions } from "@/lib/constants"
import { formatRelativeTime } from "@/lib/format"
import type { Cluster, ClusterFormInput } from "@/types/cluster.types"
import type { SelectOption } from "@/types/common.types"
import {
  getClusters,
  deleteCluster,
  bulkDeleteClusters,
  bulkCreateClusters,
  type ClusterQueryParams,
} from "@/services/cluster.service"
import { getAllUsers } from "@/services/user.service"
import { ClusterFormDialog } from "./ClusterFormDialog"

const SAMPLE_ROW = {
  name: "Compute Cluster 999",
  hostname: "dc-cl-prod-999.corp.local",
  ipAddress: "10.10.10.10",
  status: "active",
  environment: "production",
  region: "us-east-1",
  datacenter: "DC-NY-01",
  rack: "R10-U20",
  cpuCores: 32,
  cpuModel: "AMD EPYC 7763",
  ramGb: 256,
  storageTb: 8,
  storageType: "NVMe",
  nodeCount: 3,
  allocationStatus: "unallocated",
  ownerId: "usr-0001",
  department: "Infrastructure",
  tags: "critical, gpu",
}

export function ClusterListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const confirm = useConfirm()
  const isAdmin = user?.role === "admin"

  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [status, setStatus] = React.useState<string>("all")
  const [environment, setEnvironment] = React.useState<string>("all")
  const [sort, setSort] = React.useState<{ sortBy?: string; sortDir?: "asc" | "desc" }>({
    sortBy: "name",
    sortDir: "asc",
  })
  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination()
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [refreshKey, setRefreshKey] = React.useState(0)

  const [data, setData] = React.useState<Cluster[]>([])
  const [total, setTotal] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<Error>()
  const [ownerOptions, setOwnerOptions] = React.useState<SelectOption[]>([])

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingCluster, setEditingCluster] = React.useState<Cluster | null>(null)

  React.useEffect(() => {
    getAllUsers().then((users) =>
      setOwnerOptions(users.map((u) => ({ label: `${u.fullName} (${u.department})`, value: u.id })))
    )
  }, [])

  React.useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(undefined)

    const params: ClusterQueryParams = {
      page,
      pageSize,
      search: debouncedSearch,
      sortBy: sort.sortBy,
      sortDir: sort.sortDir,
      status: status === "all" ? undefined : status,
      environment: environment === "all" ? undefined : environment,
    }

    getClusters(params)
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
  }, [page, pageSize, debouncedSearch, sort, status, environment, refreshKey])

  const reload = () => setRefreshKey((k) => k + 1)

  const handleSortChange = (sortKey: string) => {
    setSort((prev) => ({
      sortBy: sortKey,
      sortDir: prev.sortBy === sortKey && prev.sortDir === "asc" ? "desc" : "asc",
    }))
  }

  const handleDelete = async (cluster: Cluster) => {
    const ok = await confirm({
      title: `Delete ${cluster.name}?`,
      description: "This will permanently remove the cluster record. This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "destructive",
    })
    if (!ok) return
    await deleteCluster(cluster.id)
    toast({ title: "Cluster deleted", description: `${cluster.name} has been removed.` })
    reload()
  }

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])

  const handleBulkDelete = async () => {
    const ok = await confirm({
      title: `Delete ${selectedIds.length} clusters?`,
      description: "This will permanently remove all selected cluster records. This action cannot be undone.",
      confirmLabel: "Delete All",
      variant: "destructive",
    })
    if (!ok) return
    await bulkDeleteClusters(selectedIds)
    toast({ title: "Clusters deleted", description: `${selectedIds.length} clusters removed.` })
    setRowSelection({})
    reload()
  }

  const handleImport = async (rows: Record<string, string>[]) => {
    const inputs: Array<ClusterFormInput & { ownerName?: string }> = rows.map((r) => ({
      name: r.name,
      hostname: r.hostname,
      ipAddress: r.ipAddress,
      status: (r.status as Cluster["status"]) || "active",
      environment: (r.environment as Cluster["environment"]) || "production",
      region: r.region,
      datacenter: r.datacenter,
      rack: r.rack,
      cpuCores: Number(r.cpuCores) || 16,
      cpuModel: r.cpuModel,
      ramGb: Number(r.ramGb) || 128,
      storageTb: Number(r.storageTb) || 4,
      storageType: (r.storageType as Cluster["specs"]["storageType"]) || "SSD",
      nodeCount: Number(r.nodeCount) || 1,
      allocationStatus: (r.allocationStatus as Cluster["allocationStatus"]) || "unallocated",
      ownerId: r.ownerId || ownerOptions[0]?.value || "",
      department: r.department || "Infrastructure",
      tags: r.tags || "",
      ownerName: ownerOptions.find((o) => o.value === r.ownerId)?.label.split(" (")[0],
    }))
    await bulkCreateClusters(inputs)
    reload()
  }

  const columns: ColumnDef<Cluster, unknown>[] = [
    {
      id: "name",
      header: () => <SortableHeader label="Cluster" sortKey="name" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => (
        <div className="min-w-[180px]">
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.hostname}</p>
        </div>
      ),
    },
    {
      id: "ipAddress",
      header: () => <SortableHeader label="IP Address" sortKey="ipAddress" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.ipAddress}</span>,
    },
    {
      id: "status",
      header: () => <SortableHeader label="Status" sortKey="status" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "environment",
      header: "Environment",
      cell: ({ row }) => <span className="capitalize text-muted-foreground">{row.original.environment}</span>,
    },
    {
      id: "region",
      header: () => <SortableHeader label="Region" sortKey="region" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => row.original.region,
    },
    {
      id: "utilization",
      header: "CPU / RAM",
      cell: ({ row }) => (
        <span className="text-xs tabular-nums text-muted-foreground">
          {row.original.utilizationCpu}% / {row.original.utilizationRam}%
        </span>
      ),
    },
    {
      id: "allocationStatus",
      header: "Allocation",
      cell: ({ row }) => <StatusBadge status={row.original.allocationStatus} />,
    },
    {
      id: "ownerName",
      header: "Owner",
      cell: ({ row }) => row.original.ownerName,
    },
    {
      id: "updatedAt",
      header: () => <SortableHeader label="Updated" sortKey="updatedAt" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatRelativeTime(row.original.updatedAt)}</span>,
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
            <DropdownMenuItem onClick={() => navigate(`/clusters/${row.original.id}`)}>
              <Eye /> View Details
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuItem onClick={() => { setEditingCluster(row.original); setFormOpen(true) }}>
                  <Pencil /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(row.original)}>
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cluster Management"
        description="Provision, monitor, and manage your compute cluster fleet."
        actions={
          isAdmin && (
            <Button className="gap-1.5" onClick={() => { setEditingCluster(null); setFormOpen(true) }}>
              <Plus className="size-4" />
              New Cluster
            </Button>
          )
        }
      />

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
        onRowClick={(row) => navigate(`/clusters/${row.id}`)}
        emptyTitle="No clusters found"
        emptyDescription="Try adjusting your search or filters, or provision a new cluster."
        toolbar={
          <>
            <SearchInput value={search} onChange={(v) => { setSearch(v); resetPage() }} placeholder="Search name, hostname, IP..." />
            <Select value={status} onValueChange={(v) => { setStatus(v); resetPage() }}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {clusterStatusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={environment} onValueChange={(v) => { setEnvironment(v); resetPage() }}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Environment" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Environments</SelectItem>
                {clusterEnvironmentOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              {selectedIds.length > 0 && isAdmin && (
                <Button variant="destructive" size="sm" className="gap-1.5" onClick={handleBulkDelete}>
                  <Trash2 className="size-4" />
                  Delete ({selectedIds.length})
                </Button>
              )}
              {isAdmin && (
                <CsvImportButton onImport={handleImport} sampleRow={SAMPLE_ROW} sampleFilename="clusters-sample" />
              )}
              <CsvExportButton
                data={data}
                filename="clusters-export"
                columns={["id", "name", "hostname", "ipAddress", "status", "environment", "region", "ownerName"]}
              />
            </div>
          </>
        }
      />

      <ClusterFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        cluster={editingCluster}
        ownerOptions={ownerOptions}
        onSuccess={reload}
      />
    </div>
  )
}
