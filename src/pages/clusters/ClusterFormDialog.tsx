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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { clusterFormSchema, type ClusterFormValues } from "@/lib/validators/cluster.schema"
import {
  clusterStatusOptions,
  clusterEnvironmentOptions,
  allocationStatusOptions,
  storageTypeOptions,
  departmentOptions,
} from "@/lib/constants"
import type { Cluster } from "@/types/cluster.types"
import type { SelectOption } from "@/types/common.types"
import { createCluster, updateCluster } from "@/services/cluster.service"

interface ClusterFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cluster?: Cluster | null
  ownerOptions: SelectOption[]
  onSuccess: () => void
}

const emptyDefaults: ClusterFormValues = {
  name: "",
  hostname: "",
  ipAddress: "",
  status: "active",
  environment: "production",
  region: "us-east-1",
  datacenter: "DC-NY-01",
  rack: "",
  cpuCores: 32,
  cpuModel: "Intel Xeon Gold 6338",
  ramGb: 256,
  storageTb: 8,
  storageType: "NVMe",
  nodeCount: 3,
  allocationStatus: "unallocated",
  ownerId: "",
  department: "Infrastructure",
  tags: "",
}

function toDefaults(cluster?: Cluster | null): ClusterFormValues {
  if (!cluster) return emptyDefaults
  return {
    name: cluster.name,
    hostname: cluster.hostname,
    ipAddress: cluster.ipAddress,
    status: cluster.status,
    environment: cluster.environment,
    region: cluster.region,
    datacenter: cluster.datacenter,
    rack: cluster.rack,
    cpuCores: cluster.specs.cpuCores,
    cpuModel: cluster.specs.cpuModel,
    ramGb: cluster.specs.ramGb,
    storageTb: cluster.specs.storageTb,
    storageType: cluster.specs.storageType,
    nodeCount: cluster.specs.nodeCount,
    allocationStatus: cluster.allocationStatus,
    ownerId: cluster.ownerId,
    department: cluster.department,
    tags: cluster.tags.join(", "),
  }
}

export function ClusterFormDialog({ open, onOpenChange, cluster, ownerOptions, onSuccess }: ClusterFormDialogProps) {
  const { toast } = useToast()
  const isEdit = !!cluster

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClusterFormValues>({
    resolver: zodResolver(clusterFormSchema),
    defaultValues: emptyDefaults,
  })

  React.useEffect(() => {
    if (open) reset(toDefaults(cluster))
  }, [open, cluster, reset])

  const watched = watch()

  const onSubmit = async (values: ClusterFormValues) => {
    try {
      const ownerName = ownerOptions.find((o) => o.value === values.ownerId)?.label.split(" (")[0] ?? ""
      if (isEdit && cluster) {
        await updateCluster(cluster.id, values, ownerName)
        toast({ title: "Cluster updated", description: `${values.name} was updated successfully.` })
      } else {
        await createCluster(values, ownerName)
        toast({ title: "Cluster created", description: `${values.name} has been provisioned.` })
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
          <DialogTitle>{isEdit ? "Edit Cluster" : "Provision New Cluster"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update cluster configuration and ownership." : "Define specs and ownership for a new cluster."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Cluster Name</Label>
            <Input {...register("name")} placeholder="Compute Cluster 042" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Hostname</Label>
            <Input {...register("hostname")} placeholder="dc-cl-prod-042.corp.local" />
            {errors.hostname && <p className="text-xs text-destructive">{errors.hostname.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>IP Address</Label>
            <Input {...register("ipAddress")} placeholder="10.24.100.12" />
            {errors.ipAddress && <p className="text-xs text-destructive">{errors.ipAddress.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={watched.status} onValueChange={(v) => setValue("status", v as ClusterFormValues["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {clusterStatusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Environment</Label>
            <Select value={watched.environment} onValueChange={(v) => setValue("environment", v as ClusterFormValues["environment"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {clusterEnvironmentOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Region</Label>
            <Input {...register("region")} placeholder="us-east-1" />
          </div>

          <div className="space-y-1.5">
            <Label>Datacenter</Label>
            <Input {...register("datacenter")} placeholder="DC-NY-01" />
          </div>

          <div className="space-y-1.5">
            <Label>Rack</Label>
            <Input {...register("rack")} placeholder="R12-U18" />
            {errors.rack && <p className="text-xs text-destructive">{errors.rack.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Node Count</Label>
            <Input type="number" min={1} {...register("nodeCount", { valueAsNumber: true })} />
          </div>

          <div className="space-y-1.5">
            <Label>CPU Cores</Label>
            <Input type="number" min={1} {...register("cpuCores", { valueAsNumber: true })} />
          </div>

          <div className="space-y-1.5">
            <Label>CPU Model</Label>
            <Input {...register("cpuModel")} />
          </div>

          <div className="space-y-1.5">
            <Label>RAM (GB)</Label>
            <Input type="number" min={1} {...register("ramGb", { valueAsNumber: true })} />
          </div>

          <div className="space-y-1.5">
            <Label>Storage (TB)</Label>
            <Input type="number" step="0.5" min={0.5} {...register("storageTb", { valueAsNumber: true })} />
          </div>

          <div className="space-y-1.5">
            <Label>Storage Type</Label>
            <Select value={watched.storageType} onValueChange={(v) => setValue("storageType", v as ClusterFormValues["storageType"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {storageTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Allocation Status</Label>
            <Select value={watched.allocationStatus} onValueChange={(v) => setValue("allocationStatus", v as ClusterFormValues["allocationStatus"])}>
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
            <Label>Department</Label>
            <Select value={watched.department} onValueChange={(v) => setValue("department", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {departmentOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Tags (comma separated)</Label>
            <Input {...register("tags")} placeholder="critical, gpu, ml-training" />
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEdit ? "Save Changes" : "Provision Cluster"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
