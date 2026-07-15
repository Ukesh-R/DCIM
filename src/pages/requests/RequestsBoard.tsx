import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Ban, CheckCircle2, MoreHorizontal, Plus, XCircle } from "lucide-react"

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
import { requestStatusOptions, requestPriorityOptions } from "@/lib/constants"
import { formatRelativeTime } from "@/lib/format"
import type { AllocationRequest, RequestTargetType } from "@/types/request.types"
import {
  getRequests,
  getRequestCounts,
  cancelRequest,
  type RequestQueryParams,
  type RequestCounts,
} from "@/services/request.service"
import { RequestFormDialog } from "./RequestFormDialog"
import { RequestDecisionDialog } from "./RequestDecisionDialog"

interface RequestsBoardProps {
  targetType: RequestTargetType
  title: string
  description: string
}

const emptyCounts: RequestCounts = { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 }

export function RequestsBoard({ targetType, title, description }: RequestsBoardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const confirm = useConfirm()
  const isAdmin = user?.role === "admin"

  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [status, setStatus] = React.useState<string>("all")
  const [priority, setPriority] = React.useState<string>("all")
  const [sort, setSort] = React.useState<{ sortBy?: string; sortDir?: "asc" | "desc" }>({
    sortBy: "createdAt",
    sortDir: "desc",
  })
  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination()
  const [refreshKey, setRefreshKey] = React.useState(0)

  const [data, setData] = React.useState<AllocationRequest[]>([])
  const [total, setTotal] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<Error>()
  const [counts, setCounts] = React.useState<RequestCounts>(emptyCounts)

  const [formOpen, setFormOpen] = React.useState(false)
  const [decisionRequest, setDecisionRequest] = React.useState<AllocationRequest | null>(null)
  const [decisionAction, setDecisionAction] = React.useState<"approve" | "reject">("approve")

  const reload = () => setRefreshKey((k) => k + 1)

  React.useEffect(() => {
    getRequestCounts(targetType).then(setCounts)
  }, [targetType, refreshKey])

  React.useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(undefined)

    const params: RequestQueryParams = {
      page,
      pageSize,
      search: debouncedSearch,
      sortBy: sort.sortBy,
      sortDir: sort.sortDir,
      targetType,
      status: status === "all" ? undefined : status,
      priority: priority === "all" ? undefined : priority,
    }

    getRequests(params)
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
  }, [page, pageSize, debouncedSearch, sort, status, priority, targetType, refreshKey])

  const handleSortChange = (sortKey: string) => {
    setSort((prev) => ({
      sortBy: sortKey,
      sortDir: prev.sortBy === sortKey && prev.sortDir === "asc" ? "desc" : "asc",
    }))
  }

  const handleCancel = async (request: AllocationRequest) => {
    const ok = await confirm({
      title: `Cancel ${request.requestNumber}?`,
      description: "This request will be marked as cancelled and can no longer be approved.",
      confirmLabel: "Cancel Request",
      variant: "destructive",
    })
    if (!ok) return
    await cancelRequest(request.id)
    toast({ title: "Request cancelled", description: `${request.requestNumber} has been cancelled.` })
    reload()
  }

  const canCancel = (request: AllocationRequest) =>
    request.status === "pending" && (isAdmin || request.requestedById === user?.id)

  const columns: ColumnDef<AllocationRequest, unknown>[] = [
    {
      id: "requestNumber",
      header: () => <SortableHeader label="Request" sortKey="requestNumber" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => (
        <div className="min-w-[200px]">
          <p className="font-medium">{row.original.requestNumber}</p>
          <p className="text-xs text-muted-foreground">{row.original.title}</p>
        </div>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      cell: ({ row }) => <StatusBadge status={row.original.priority} />,
    },
    {
      id: "status",
      header: () => <SortableHeader label="Status" sortKey="status" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "requestedByName",
      header: "Requested By",
      cell: ({ row }) => (
        <div>
          <p>{row.original.requestedByName}</p>
          <p className="text-xs text-muted-foreground">{row.original.department}</p>
        </div>
      ),
    },
    {
      id: "allocatedResourceName",
      header: "Allocated Resource",
      cell: ({ row }) => row.original.allocatedResourceName ?? <span className="text-muted-foreground">—</span>,
    },
    {
      id: "createdAt",
      header: () => <SortableHeader label="Submitted" sortKey="createdAt" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatRelativeTime(row.original.createdAt)}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const request = row.original
        const showApproveReject = isAdmin && request.status === "pending"
        const showCancel = canCancel(request)
        if (!showApproveReject && !showCancel) return null
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {showApproveReject && (
                <>
                  <DropdownMenuItem
                    onClick={() => { setDecisionRequest(request); setDecisionAction("approve"); }}
                  >
                    <CheckCircle2 className="text-success" /> Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => { setDecisionRequest(request); setDecisionAction("reject"); }}
                  >
                    <XCircle /> Reject
                  </DropdownMenuItem>
                </>
              )}
              {showCancel && (
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleCancel(request)}>
                  <Ban /> Cancel Request
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button className="gap-1.5" onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            New Request
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Pending", value: counts.pending, color: "text-info" },
          { label: "Approved", value: counts.approved, color: "text-success" },
          { label: "Rejected", value: counts.rejected, color: "text-destructive" },
          { label: "Cancelled", value: counts.cancelled, color: "text-muted-foreground" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`mt-1 text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

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
        emptyTitle="No requests found"
        emptyDescription="Try adjusting your filters, or submit a new request."
        toolbar={
          <>
            <SearchInput value={search} onChange={(v) => { setSearch(v); resetPage() }} placeholder="Search request #, title..." />
            <Select value={status} onValueChange={(v) => { setStatus(v); resetPage() }}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {requestStatusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={(v) => { setPriority(v); resetPage() }}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {requestPriorityOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="ml-auto">
              <CsvExportButton
                data={data}
                filename={`${targetType}-requests-export`}
                columns={["requestNumber", "title", "status", "priority", "requestedByName", "allocatedResourceName"]}
              />
            </div>
          </>
        }
      />

      <RequestFormDialog open={formOpen} onOpenChange={setFormOpen} targetType={targetType} onSuccess={reload} />
      <RequestDecisionDialog
        open={!!decisionRequest}
        onOpenChange={(open) => !open && setDecisionRequest(null)}
        request={decisionRequest}
        action={decisionAction}
        onSuccess={reload}
      />
    </div>
  )
}
