import * as React from "react"
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Plus, PowerOff, Power, Trash2 } from "lucide-react"

import { PageHeader } from "@/components/common/PageHeader"
import { SearchInput } from "@/components/common/SearchInput"
import { DataTable } from "@/components/common/DataTable"
import { SortableHeader } from "@/components/common/SortableHeader"
import { StatusBadge } from "@/components/common/StatusBadge"
import { CsvExportButton } from "@/components/common/CsvExportButton"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { roleOptions, userStatusOptions } from "@/lib/constants"
import { formatRelativeTime, initials } from "@/lib/format"
import type { User } from "@/types/user.types"
import {
  getUsers,
  deleteUser,
  bulkDeleteUsers,
  updateUser,
  type UserQueryParams,
} from "@/services/user.service"
import { UserFormDialog } from "./UserFormDialog"

export function UserManagementPage() {
  const { toast } = useToast()
  const confirm = useConfirm()

  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [role, setRole] = React.useState<string>("all")
  const [status, setStatus] = React.useState<string>("all")
  const [sort, setSort] = React.useState<{ sortBy?: string; sortDir?: "asc" | "desc" }>({
    sortBy: "fullName",
    sortDir: "asc",
  })
  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination()
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [refreshKey, setRefreshKey] = React.useState(0)

  const [data, setData] = React.useState<User[]>([])
  const [total, setTotal] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<Error>()

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<User | null>(null)

  const reload = () => setRefreshKey((k) => k + 1)

  React.useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(undefined)

    const params: UserQueryParams = {
      page,
      pageSize,
      search: debouncedSearch,
      sortBy: sort.sortBy,
      sortDir: sort.sortDir,
      role: role === "all" ? undefined : role,
      status: status === "all" ? undefined : status,
    }

    getUsers(params)
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
  }, [page, pageSize, debouncedSearch, sort, role, status, refreshKey])

  const handleSortChange = (sortKey: string) => {
    setSort((prev) => ({
      sortBy: sortKey,
      sortDir: prev.sortBy === sortKey && prev.sortDir === "asc" ? "desc" : "asc",
    }))
  }

  const handleDelete = async (user: User) => {
    const ok = await confirm({
      title: `Delete ${user.fullName}?`,
      description: "This will permanently remove the user account. This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "destructive",
    })
    if (!ok) return
    await deleteUser(user.id)
    toast({ title: "User deleted", description: `${user.fullName} has been removed.` })
    reload()
  }

  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === "active" ? "inactive" : "active"
    await updateUser(user.id, { status: nextStatus })
    toast({ title: `User ${nextStatus === "active" ? "activated" : "deactivated"}`, description: user.fullName })
    reload()
  }

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])

  const handleBulkDelete = async () => {
    const ok = await confirm({
      title: `Delete ${selectedIds.length} users?`,
      description: "This will permanently remove all selected user accounts.",
      confirmLabel: "Delete All",
      variant: "destructive",
    })
    if (!ok) return
    await bulkDeleteUsers(selectedIds)
    toast({ title: "Users deleted", description: `${selectedIds.length} users removed.` })
    setRowSelection({})
    reload()
  }

  const columns: ColumnDef<User, unknown>[] = [
    {
      id: "fullName",
      header: () => <SortableHeader label="User" sortKey="fullName" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => (
        <div className="flex min-w-[200px] items-center gap-2.5">
          <Avatar className="size-8">
            <AvatarFallback>{initials(row.original.fullName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.fullName}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "role",
      header: () => <SortableHeader label="Role" sortKey="role" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => (
        <span className="capitalize font-medium">{row.original.role}</span>
      ),
    },
    {
      id: "department",
      header: () => <SortableHeader label="Department" sortKey="department" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => row.original.department,
    },
    {
      id: "jobTitle",
      header: "Job Title",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.jobTitle}</span>,
    },
    {
      id: "status",
      header: () => <SortableHeader label="Status" sortKey="status" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "lastLoginAt",
      header: () => <SortableHeader label="Last Login" sortKey="lastLoginAt" sort={sort} onSortChange={handleSortChange} />,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.lastLoginAt ? formatRelativeTime(row.original.lastLoginAt) : "Never"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditingUser(row.original); setFormOpen(true) }}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleStatus(row.original)}>
              {row.original.status === "active" ? <PowerOff /> : <Power />}
              {row.original.status === "active" ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(row.original)}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage user accounts, roles, and access across the platform."
        actions={
          <Button className="gap-1.5" onClick={() => { setEditingUser(null); setFormOpen(true) }}>
            <Plus className="size-4" />
            Add User
          </Button>
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
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        emptyTitle="No users found"
        emptyDescription="Try adjusting your search or filters."
        toolbar={
          <>
            <SearchInput value={search} onChange={(v) => { setSearch(v); resetPage() }} placeholder="Search name, email..." />
            <Select value={role} onValueChange={(v) => { setRole(v); resetPage() }}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roleOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => { setStatus(v); resetPage() }}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {userStatusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              {selectedIds.length > 0 && (
                <Button variant="destructive" size="sm" className="gap-1.5" onClick={handleBulkDelete}>
                  <Trash2 className="size-4" />
                  Delete ({selectedIds.length})
                </Button>
              )}
              <CsvExportButton
                data={data}
                filename="users-export"
                columns={["id", "fullName", "email", "role", "department", "jobTitle", "status"]}
              />
            </div>
          </>
        }
      />

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editingUser} onSuccess={reload} />
    </div>
  )
}
