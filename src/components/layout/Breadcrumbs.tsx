import { useLocation } from "react-router-dom"

import { navItems } from "@/lib/nav"

export function Breadcrumbs() {
  const location = useLocation()
  const current = navItems.find((item) => location.pathname.startsWith(item.href))

  return (
    <div className="flex flex-col leading-tight">
      <span className="text-[11px] text-muted-foreground">DCIMS / Workspace</span>
      <span className="text-sm font-semibold">{current?.label ?? "Overview"}</span>
    </div>
  )
}
