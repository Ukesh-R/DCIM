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
import { assetTypeOptions, assetStatusOptions } from "@/lib/constants"
import { formatDate } from "@/lib/format"
import type { CustomerAsset, AssetFormInput } from "@/types/asset.types"
import type { SelectOption } from "@/types/common.types"
import {
  getAssets,
  deleteAsset,
  bulkDeleteAssets,
  bulkCreateAssets,
  type AssetQueryParams,
} from "@/services/asset.service"
import { getAllUsers } from "@/services/user.service"
import { AssetFormDialog } from "./AssetFormDialog"

const SAMPLE_ROW = {
  assetTag: "AST-00999",
  name: "Acme Server 999",
  type: "server",
  status: "in-service",
  customerName: "Acme Logistics",
  customerId: "cust-001",
  serialNumber: "SN99999999",
  manufacturer: "Dell",
  model: "PowerEdge R750",
  ipAddress: "172.16.20.10",
  location: "New York, US",
  datacenter: "DC-NY-01",
  allocationStatus: "unallocated",
  purchaseDate: "2025-01-01",
  warrantyExpiry: "2028-01-01",
  cpu: "Intel Xeon Gold 6338",
  ramGb: 64,
  storageGb: 1024,
  ownerId: "usr-0001",
  notes: "",
}

export function AssetListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const confirm = useConfirm()
  const isAdmin = user?.role === "admin"

  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [status, setStatus] = React.useState<string>("all")
  const [type, setType] = React.useState<string>("all")
  const [sort, setSort] = React.useState<{ sortBy?: string; sortDir?: "asc" | "desc" }>({
    sortBy: "name",
    sortDir: "asc",
  })
  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination()
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [refreshKey, setRefreshKey] = React.useState(0)

  const [data, setData] = React.useState<CustomerAsset[]>([])
  const [total, setTotal] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<Error>()
  const [ownerOptions, setOwnerOptions] = React.useState<SelectOption[]>([])

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingAsset, setEditingAsset] = React.useState<CustomerAsset | null>(null)

  React.useEffect(() => {
    getAllUsers().then((users) =>
      setOwnerOptions(users.map((u) => ({ label: `${u.fullName} (${u.department})`, value: u.id })))
    )
  }, [])

  React.useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(undefined)

    const params: AssetQueryParams = {
      page,
      pageSize,
      search: debouncedSearch,
      sortBy: sort.sortBy,
      sortDir: sort.sortDir,
      status: status === "all" ? undefined : status,
      type: type === "all" ? undefined : type,
    }

    getAssets(params)
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
  }, [page, pageSize, debouncedSearch, sort, status, type, refreshKey])

  const reload = () => setRefreshKey((k) => k + 1)

  const handleSortChange = (sortKey: string) => {
    setSort((prev) => ({
      sortBy: sortKey,
      sortDir: prev.sortBy === sortKey && prev.sortDir === "asc" ? "desc" : "asc",
    }))
  }

  const handleDelete = async (asset: CustomerAsset) => {
    const ok = await confirm({
      title: `Delete ${asset.name}?`,
      description: "This will permanently remove the asset record. This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "destructive",
    })
    if (!ok) return
    await deleteAsset(asset.id)
    toast({ title: "Asset deleted", description: `${asset.name} has been removed.` })
    reload()
  }

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])

  const handleBulkDelete = async () => {
    const ok = await confirm({
      title: `Delete ${selectedIds.length} assets?`,
      description: "This will permanently remove all selected asset records. This action cannot be undone.",
      confirmLabel: "Delete All",
      variant: "destructive",
    })
    if (!ok) return
    await bulkDeleteAssets(selectedIds)
    toast({ title: "Assets deleted", description: `${selectedIds.length} assets removed.` })
    setRowSelection({})
    reload()
  }

  const handleImport = async (rows: Record<string, string>[]) => {
    const inputs: Array<AssetFormInput & { ownerName?: string }> = rows.map((r) => ({
      assetTag: r.assetTag,
      name: r.name,
      type: (r.type as CustomerAsset["type"]) || "server",
      status: (r.status as CustomerAsset["status"]) || "in-service",
      customerName: r.customerName,
      customerId: r.customerId,
      serialNumber: r.serialNumber,
      manufacturer: r.manufacturer,
      model: r.model,
      ipAddress: r.ipAddress,
      location: r.location,
      datacenter: r.datacenter,
      allocationStatus: (r.allocationStatus as CustomerAsset["allocationStatus"]) || "unallocated",
      purchaseDate: r.purchaseDate || new Date().toISOString().slice(0, 10),
      warrantyExpiry: r.warrantyExpiry || new Date().toISOString().slice(0, 10),
      cpu: r.cpu || "N/A",
      ramGb: Number(r.ramGb) || 0,
      storageGb: Number(r.storageGb) || 0,
      ownerId: r.ownerId || ownerOptions[0]?.value || "",
      notes: r.notes || "",
      ownerName: ownerOptions.find((o) => o.value === r.ownerId)?.label.split(" (")[0],
    }))
    await bulkCreateAssets(inputs)
    reload()
  }

  const columns: ColumnDef<CustomerAsset, unknown>[] = [
    {
      id: "name",
      header: () => <SortableHeader label="Asset" sortKey="name" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => (
        <div className="min-w-[180px]">
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.assetTag}</p>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => <span className="capitalize text-muted-foreground">{row.original.type}</span>,
    },
    {
      id: "status",
      header: () => <SortableHeader label="Status" sortKey="status" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "customerName",
      header: () => <SortableHeader label="Customer" sortKey="customerName" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => row.original.customerName,
    },
    {
      id: "manufacturer",
      header: "Manufacturer / Model",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.manufacturer} · {row.original.model}</span>
      ),
    },
    {
      id: "allocationStatus",
      header: "Allocation",
      cell: ({ row }) => <StatusBadge status={row.original.allocationStatus} />,
    },
    {
      id: "warrantyExpiry",
      header: () => <SortableHeader label="Warranty" sortKey="warrantyExpiry" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.warrantyExpiry)}</span>,
    },
    {
      id: "ownerName",
      header: "Owner",
      cell: ({ row }) => row.original.ownerName,
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
            <DropdownMenuItem onClick={() => navigate(`/customer-assets/${row.original.id}`)}>
              <Eye /> View Details
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuItem onClick={() => { setEditingAsset(row.original); setFormOpen(true) }}>
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
        title="Customer Asset Management"
        description="Track hardware and equipment allocated to customers."
        actions={
          isAdmin && (
            <Button className="gap-1.5" onClick={() => { setEditingAsset(null); setFormOpen(true) }}>
              <Plus className="size-4" />
              New Asset
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
        onRowClick={(row) => navigate(`/customer-assets/${row.id}`)}
        emptyTitle="No assets found"
        emptyDescription="Try adjusting your search or filters, or add a new asset."
        toolbar={
          <>
            <SearchInput value={search} onChange={(v) => { setSearch(v); resetPage() }} placeholder="Search name, tag, customer..." />
            <Select value={status} onValueChange={(v) => { setStatus(v); resetPage() }}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {assetStatusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={(v) => { setType(v); resetPage() }}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {assetTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
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
                <CsvImportButton onImport={handleImport} sampleRow={SAMPLE_ROW} sampleFilename="assets-sample" />
              )}
              <CsvExportButton
                data={data}
                filename="assets-export"
                columns={["id", "assetTag", "name", "type", "status", "customerName", "ownerName"]}
              />
            </div>
          </>
        }
      />

      <AssetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        asset={editingAsset}
        ownerOptions={ownerOptions}
        onSuccess={reload}
      />
    </div>
  )
}
