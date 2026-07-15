import { ChevronsLeft, ChevronsRight, Database } from "lucide-react"

import { SidebarNav } from "./SidebarNav"
import { cn } from "@/lib/cn"
import { APP_NAME } from "@/lib/constants"

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div className={cn("flex h-14 items-center gap-2 px-4", collapsed && "justify-center px-0")}>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-glow">
          <Database className="size-4.5" />
        </div>
        {!collapsed && <span className="text-base font-bold tracking-tight">{APP_NAME}</span>}
      </div>

      <SidebarNav collapsed={collapsed} />

      <button
        type="button"
        onClick={onToggleCollapse}
        className="m-2 flex items-center justify-center gap-2 rounded-lg border border-sidebar-border py-2 text-xs text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
      >
        {collapsed ? <ChevronsRight className="size-4" /> : <><ChevronsLeft className="size-4" /> Collapse</>}
      </button>
    </aside>
  )
}
