import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/cn"
import type { SortState } from "./DataTable"

interface SortableHeaderProps {
  label: string
  sortKey: string
  sort?: SortState
  onSortChange?: (sortKey: string) => void
  className?: string
}

export function SortableHeader({ label, sortKey, sort, onSortChange, className }: SortableHeaderProps) {
  const isActive = sort?.sortBy === sortKey
  const Icon = isActive ? (sort?.sortDir === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown

  if (!onSortChange) return <span className={className}>{label}</span>

  return (
    <button
      type="button"
      onClick={() => onSortChange(sortKey)}
      className={cn(
        "inline-flex items-center gap-1 uppercase tracking-wide hover:text-foreground",
        isActive && "text-foreground",
        className
      )}
    >
      {label}
      <Icon className="size-3.5" />
    </button>
  )
}
