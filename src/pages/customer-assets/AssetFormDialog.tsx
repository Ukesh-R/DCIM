import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { assetFormSchema, type AssetFormValues } from "@/lib/validators/asset.schema"
import { assetTypeOptions, assetStatusOptions, allocationStatusOptions } from "@/lib/constants"
import type { CustomerAsset } from "@/types/asset.types"
import type { SelectOption } from "@/types/common.types"
import { createAsset, updateAsset } from "@/services/asset.service"

interface AssetFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset?: CustomerAsset | null
  ownerOptions: SelectOption[]
  onSuccess: () => void
}

const emptyDefaults: AssetFormValues = {
  assetTag: "",
  name: "",
  type: "server",
  status: "in-service",
  customerName: "",
  customerId: "",
  serialNumber: "",
  manufacturer: "Dell",
  model: "PowerEdge R750",
  ipAddress: "",
  location: "",
  datacenter: "DC-NY-01",
  allocationStatus: "unallocated",
  purchaseDate: new Date().toISOString().slice(0, 10),
  warrantyExpiry: new Date(Date.now() + 3 * 365 * 86400000).toISOString().slice(0, 10),
  cpu: "N/A",
  ramGb: 32,
  storageGb: 512,
  ownerId: "",
  notes: "",
}

function toDefaults(asset?: CustomerAsset | null): AssetFormValues {
  if (!asset) return emptyDefaults
  return {
    assetTag: asset.assetTag,
    name: asset.name,
    type: asset.type,
    status: asset.status,
    customerName: asset.customerName,
    customerId: asset.customerId,
    serialNumber: asset.serialNumber,
    manufacturer: asset.manufacturer,
    model: asset.model,
    ipAddress: asset.ipAddress,
    location: asset.location,
    datacenter: asset.datacenter,
    allocationStatus: asset.allocationStatus,
    purchaseDate: asset.purchaseDate.slice(0, 10),
    warrantyExpiry: asset.warrantyExpiry.slice(0, 10),
    cpu: asset.specs.cpu,
    ramGb: asset.specs.ramGb,
    storageGb: asset.specs.storageGb,
    ownerId: asset.ownerId,
    notes: asset.notes,
  }
}

export function AssetFormDialog({ open, onOpenChange, asset, ownerOptions, onSuccess }: AssetFormDialogProps) {
  const { toast } = useToast()
  const isEdit = !!asset

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: emptyDefaults,
  })

  React.useEffect(() => {
    if (open) reset(toDefaults(asset))
  }, [open, asset, reset])

  const watched = watch()

  const onSubmit = async (values: AssetFormValues) => {
    try {
      const ownerName = ownerOptions.find((o) => o.value === values.ownerId)?.label.split(" (")[0] ?? ""
      if (isEdit && asset) {
        await updateAsset(asset.id, values, ownerName)
        toast({ title: "Asset updated", description: `${values.name} was updated successfully.` })
      } else {
        await createAsset(values, ownerName)
        toast({ title: "Asset created", description: `${values.name} has been added to inventory.` })
      }
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Asset" : "Add Customer Asset"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update asset details and ownership." : "Register a new customer-owned asset in inventory."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid max-h-[65vh] grid-cols-1 gap-4 overflow-y-auto p-1 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Asset Name</Label>
            <Input {...register("name")} placeholder="Acme Server 042" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Asset Tag</Label>
            <Input {...register("assetTag")} placeholder="AST-00999" />
            {errors.assetTag && <p className="text-xs text-destructive">{errors.assetTag.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={watched.type} onValueChange={(v) => setValue("type", v as AssetFormValues["type"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {assetTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={watched.status} onValueChange={(v) => setValue("status", v as AssetFormValues["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {assetStatusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Customer Name</Label>
            <Input {...register("customerName")} placeholder="Acme Logistics" />
            {errors.customerName && <p className="text-xs text-destructive">{errors.customerName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Customer ID</Label>
            <Input {...register("customerId")} placeholder="cust-001" />
          </div>

          <div className="space-y-1.5">
            <Label>Serial Number</Label>
            <Input {...register("serialNumber")} placeholder="SN12345678" />
          </div>

          <div className="space-y-1.5">
            <Label>IP Address</Label>
            <Input {...register("ipAddress")} placeholder="172.16.20.10" />
          </div>

          <div className="space-y-1.5">
            <Label>Manufacturer</Label>
            <Input {...register("manufacturer")} />
          </div>

          <div className="space-y-1.5">
            <Label>Model</Label>
            <Input {...register("model")} />
          </div>

          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input {...register("location")} placeholder="New York, US" />
          </div>

          <div className="space-y-1.5">
            <Label>Datacenter</Label>
            <Input {...register("datacenter")} />
          </div>

          <div className="space-y-1.5">
            <Label>Allocation Status</Label>
            <Select value={watched.allocationStatus} onValueChange={(v) => setValue("allocationStatus", v as AssetFormValues["allocationStatus"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {allocationStatusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Owner</Label>
            <Select value={watched.ownerId} onValueChange={(v) => setValue("ownerId", v)}>
              <SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger>
              <SelectContent>
                {ownerOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.ownerId && <p className="text-xs text-destructive">{errors.ownerId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Purchase Date</Label>
            <Input type="date" {...register("purchaseDate")} />
          </div>

          <div className="space-y-1.5">
            <Label>Warranty Expiry</Label>
            <Input type="date" {...register("warrantyExpiry")} />
          </div>

          <div className="space-y-1.5">
            <Label>CPU</Label>
            <Input {...register("cpu")} placeholder="Intel Xeon Gold 6338 / N/A" />
          </div>

          <div className="space-y-1.5">
            <Label>RAM (GB)</Label>
            <Input type="number" min={0} {...register("ramGb", { valueAsNumber: true })} />
          </div>

          <div className="space-y-1.5">
            <Label>Storage (GB)</Label>
            <Input type="number" min={0} {...register("storageGb", { valueAsNumber: true })} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Notes</Label>
            <Textarea rows={2} {...register("notes")} placeholder="Optional notes about this asset..." />
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEdit ? "Save Changes" : "Add Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
