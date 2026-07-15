import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/cn"

interface KpiCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  accent?: "primary" | "secondary" | "success" | "warning" | "destructive" | "info"
  deltaPct?: number
  deltaLabel?: string
  index?: number
}

const ACCENT_MAP: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  primary: "from-primary/15 to-primary/5 text-primary",
  secondary: "from-secondary/15 to-secondary/5 text-secondary",
  success: "from-success/15 to-success/5 text-success",
  warning: "from-warning/15 to-warning/5 text-warning",
  destructive: "from-destructive/15 to-destructive/5 text-destructive",
  info: "from-info/15 to-info/5 text-info",
}

export function KpiCard({ label, value, icon: Icon, accent = "primary", deltaPct, deltaLabel, index = 0 }: KpiCardProps) {
  const isPositive = (deltaPct ?? 0) >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Card className="relative overflow-hidden transition-shadow hover:shadow-elevated">
        <div className={cn("pointer-events-none absolute -right-6 -top-6 size-28 rounded-full bg-gradient-to-br opacity-70 blur-2xl", ACCENT_MAP[accent])} />
        <CardContent className="relative flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
            <div className={cn("flex size-9 items-center justify-center rounded-lg bg-gradient-to-br", ACCENT_MAP[accent])}>
              <Icon className="size-4.5" />
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <span className="text-2xl font-bold tracking-tight tabular-nums">{value}</span>
            {typeof deltaPct === "number" && (
              <span
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  isPositive ? "text-success" : "text-destructive"
                )}
              >
                {isPositive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                {Math.abs(deltaPct)}% {deltaLabel}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
