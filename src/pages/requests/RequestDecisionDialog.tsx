import * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import type { AllocationRequest } from "@/types/request.types"
import { approveRequest, rejectRequest } from "@/services/request.service"

interface RequestDecisionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: AllocationRequest | null
  action: "approve" | "reject"
  onSuccess: () => void
}

export function RequestDecisionDialog({ open, onOpenChange, request, action, onSuccess }: RequestDecisionDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [note, setNote] = React.useState("")
  const [error, setError] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setNote("")
      setError("")
    }
  }, [open, request])

  if (!request) return null
  const isApprove = action === "approve"

  const handleSubmit = async () => {
    if (!user) return
    if (!isApprove && note.trim().length < 4) {
      setError("Please provide a short reason (min 4 characters).")
      return
    }
    setIsSubmitting(true)
    try {
      if (isApprove) {
        const updated = await approveRequest(request.id, user, note)
        toast({
          title: "Request approved",
          description: updated.allocatedResourceName
            ? `Allocated: ${updated.allocatedResourceName}`
            : "Approved — pending manual allocation.",
        })
      } else {
        await rejectRequest(request.id, user, note)
        toast({ title: "Request rejected", description: `${request.requestNumber} has been rejected.` })
      }
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isApprove ? "Approve Request" : "Reject Request"}</DialogTitle>
          <DialogDescription>
            {request.requestNumber} · {request.title}
            {isApprove && " — an available resource will be automatically allocated if one exists."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label>{isApprove ? "Decision note (optional)" : "Reason for rejection"}</Label>
          <Textarea
            rows={3}
            value={note}
            onChange={(e) => {
              setNote(e.target.value)
              setError("")
            }}
            placeholder={isApprove ? "Optional note for the requester..." : "Explain why this request is being rejected..."}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={isApprove ? "default" : "destructive"}
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            {isApprove ? "Approve" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
