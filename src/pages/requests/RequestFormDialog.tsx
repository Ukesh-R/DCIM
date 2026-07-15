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
import { useAuth } from "@/hooks/useAuth"
import { requestFormSchema, type RequestFormValues } from "@/lib/validators/request.schema"
import { requestPriorityOptions } from "@/lib/constants"
import type { RequestTargetType } from "@/types/request.types"
import { createRequest } from "@/services/request.service"

interface RequestFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetType: RequestTargetType
  onSuccess: () => void
}

export function RequestFormDialog({ open, onOpenChange, targetType, onSuccess }: RequestFormDialogProps) {
  const { toast } = useToast()
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      targetType,
      title: "",
      justification: "",
      priority: "medium",
      requestedSpecs: "",
      customerName: "",
    },
  })

  React.useEffect(() => {
    if (open) reset({ targetType, title: "", justification: "", priority: "medium", requestedSpecs: "", customerName: "" })
  }, [open, targetType, reset])

  const watched = watch()

  const onSubmit = async (values: RequestFormValues) => {
    if (!user) return
    try {
      const request = await createRequest(values, user)
      toast({ title: "Request submitted", description: `${request.requestNumber} is now pending approval.` })
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New {targetType === "cluster" ? "Cluster" : "Asset"} Request</DialogTitle>
          <DialogDescription>
            Submit a request for {targetType === "cluster" ? "new cluster capacity" : "a customer asset allocation"}.
            It will be routed to an administrator for approval.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input {...register("title")} placeholder="e.g. Additional ML training capacity" />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {targetType === "asset" && (
            <div className="space-y-1.5">
              <Label>Customer Name</Label>
              <Input {...register("customerName")} placeholder="Acme Logistics" />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Requested Specs</Label>
            <Input {...register("requestedSpecs")} placeholder="32 vCPU, 256GB RAM, 8TB storage" />
            {errors.requestedSpecs && <p className="text-xs text-destructive">{errors.requestedSpecs.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={watched.priority} onValueChange={(v) => setValue("priority", v as RequestFormValues["priority"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {requestPriorityOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Justification</Label>
            <Textarea rows={3} {...register("justification")} placeholder="Explain why this resource is needed..." />
            {errors.justification && <p className="text-xs text-destructive">{errors.justification.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
