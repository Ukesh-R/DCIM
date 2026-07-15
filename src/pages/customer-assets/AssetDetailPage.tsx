import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Box, Building2, Pencil, Trash2 } from "lucide-react"

import { PageHeader } from "@/components/common/PageHeader"
import { StatusBadge } from "@/components/common/StatusBadge"
import { ErrorState } from "@/components/common/ErrorState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAsync } from "@/hooks/useAsync"
import { useAuth } from "@/hooks/useAuth"
import { useConfirm } from "@/hooks/useConfirm"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatDateTime } from "@/lib/format"
import { getAssetById, deleteAsset } from "@/services/asset.service"
import { getAllUsers } from "@/services/user.service"
import { AssetFormDialog } from "./AssetFormDialog"
import type { SelectOption } from "@/types/common.types"

export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const confirm = useConfirm()
  const { toast } = useToast()
  const isAdmin = user?.role === "admin"

  const { data: asset, isLoading, error, reload } = useAsync(() => getAssetById(id!), [id])
  const [formOpen, setFormOpen] = React.useState(false)
  const [ownerOptions, setOwnerOptions] = React.useState<SelectOption[]>([])

  React.useEffect(() => {
    getAllUsers().then((users) =>
      setOwnerOptions(users.map((u) => ({ label: `${u.fullName} (${u.department})`, value: u.id })))
    )
  }, [])

  const handleDelete = async () => {
    if (!asset) return
    const ok = await confirm({
      title: `Delete ${asset.name}?`,
      description: "This will permanently remove the asset record.",
      confirmLabel: "Delete",
      variant: "destructive",
    })
    if (!ok) return
    await deleteAsset(asset.id)
    toast({ title: "Asset deleted" })
    navigate("/customer-assets")
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate("/customer-assets")}>
          <ArrowLeft className="size-4" /> Back to Assets
        </Button>
        <ErrorState onRetry={reload} title="Asset not found" description="This asset may have been removed." />
      </div>
    )
  }

  if (isLoading || !asset) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" className="w-fit gap-1.5" onClick={() => navigate("/customer-assets")}>
          <ArrowLeft className="size-4" /> Back to Assets
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
        title={asset.name}
        description={`${asset.assetTag} · ${asset.serialNumber}`}
        actions={
          <>
            <StatusBadge status={asset.status} />
            <StatusBadge status={asset.allocationStatus} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Box className="size-4" /> Hardware Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Type" value={<span className="capitalize">{asset.type}</span>} />
            <Row label="Manufacturer" value={asset.manufacturer} />
            <Row label="Model" value={asset.model} />
            <Row label="CPU" value={asset.specs.cpu} />
            <Row label="RAM" value={`${asset.specs.ramGb} GB`} />
            <Row label="Storage" value={`${asset.specs.storageGb} GB`} />
            <Row label="IP Address" value={asset.ipAddress || "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="size-4" /> Customer & Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Customer" value={asset.customerName} />
            <Row label="Customer ID" value={asset.customerId} />
            <Row label="Location" value={asset.location} />
            <Row label="Datacenter" value={asset.datacenter} />
            <Row label="Purchase Date" value={formatDate(asset.purchaseDate)} />
            <Row label="Warranty Expiry" value={formatDate(asset.warrantyExpiry)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ownership & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Owner" value={asset.ownerName} />
            <Row label="Created" value={formatDateTime(asset.createdAt)} />
            <Row label="Updated" value={formatDateTime(asset.updatedAt)} />
            {asset.notes && (
              <p className="mt-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">{asset.notes}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <AssetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        asset={asset}
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
