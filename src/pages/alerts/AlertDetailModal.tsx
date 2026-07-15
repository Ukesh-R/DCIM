import { AlertTriangle, CheckCircle2, Lightbulb, MapPin, ShieldCheck } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/common/StatusBadge"
import { formatDateTime } from "@/lib/format"
import type { Alert } from "@/types/alert.types"

interface AlertDetailModalProps {
  alert: Alert | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAcknowledge: (alert: Alert) => void
  onResolve: (alert: Alert) => void
}

const LEVEL_ICON_CLASS: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
}

export function AlertDetailModal({ alert, open, onOpenChange, onAcknowledge, onResolve }: AlertDetailModalProps) {
  if (!alert) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${LEVEL_ICON_CLASS[alert.level]}`}>
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle>{alert.title}</DialogTitle>
              <DialogDescription className="mt-1">{alert.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <StatusBadge status={alert.level} />
          <StatusBadge status={alert.status} />
          <span className="rounded-full border border-border px-2.5 py-0.5 text-xs capitalize text-muted-foreground">
            {alert.category}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Source</p>
            <p className="flex items-center gap-1 font-medium"><MapPin className="size-3.5" /> {alert.sourceName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">IP Address</p>
            <p className="font-mono text-xs font-medium">{alert.ipAddress}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Metric Value</p>
            <p className="font-medium tabular-nums">{alert.metricValue} {alert.metricUnit}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Threshold</p>
            <p className="font-medium tabular-nums">{alert.metricThreshold} {alert.metricUnit}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="font-medium">{formatDateTime(alert.createdAt)}</p>
          </div>
          {alert.acknowledgedAt && (
            <div>
              <p className="text-xs text-muted-foreground">Acknowledged</p>
              <p className="font-medium">{formatDateTime(alert.acknowledgedAt)} by {alert.acknowledgedBy}</p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Lightbulb className="size-3.5" /> Recommendation
          </p>
          <p className="text-sm text-foreground/90">{alert.recommendation}</p>
        </div>

        <DialogFooter>
          {alert.status === "open" && (
            <Button variant="outline" className="gap-1.5" onClick={() => onAcknowledge(alert)}>
              <ShieldCheck className="size-4" /> Acknowledge
            </Button>
          )}
          {alert.status !== "resolved" && (
            <Button className="gap-1.5" onClick={() => onResolve(alert)}>
              <CheckCircle2 className="size-4" /> Mark Resolved
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
