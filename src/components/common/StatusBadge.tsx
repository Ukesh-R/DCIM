import { Badge, type BadgeProps } from "@/components/ui/badge"
import { cn } from "@/lib/cn"
import { titleCase } from "@/lib/format"

type BadgeVariant = NonNullable<BadgeProps["variant"]>

const STATUS_VARIANT_MAP: Record<string, BadgeVariant> = {
  // generic
  active: "success",
  "in-service": "success",
  allocated: "success",
  approved: "success",
  resolved: "success",
  open: "info",
  pending: "info",
  info: "info",
  unallocated: "outline",
  reserved: "warning",
  maintenance: "warning",
  "in-storage": "warning",
  acknowledged: "warning",
  warning: "warning",
  inactive: "outline",
  cancelled: "outline",
  suspended: "destructive",
  decommissioned: "destructive",
  "under-repair": "destructive",
  retired: "destructive",
  rejected: "destructive",
  critical: "destructive",
  // request priority
  low: "outline",
  medium: "info",
  high: "warning",
  urgent: "destructive",
}

const DOT_COLOR_MAP: Record<BadgeVariant, string> = {
  default: "bg-primary",
  secondary: "bg-secondary",
  destructive: "bg-destructive",
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  outline: "bg-muted-foreground",
  solid: "bg-primary-foreground",
}

interface StatusBadgeProps {
  status: string
  className?: string
  withDot?: boolean
}

export function StatusBadge({ status, className, withDot = true }: StatusBadgeProps) {
  const variant = STATUS_VARIANT_MAP[status] ?? "outline"
  return (
    <Badge variant={variant} className={cn("capitalize", className)}>
      {withDot && <span className={cn("size-1.5 rounded-full", DOT_COLOR_MAP[variant])} />}
      {titleCase(status)}
    </Badge>
  )
}
