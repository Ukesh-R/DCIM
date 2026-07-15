import { NavLink } from "react-router-dom"

import { navItems } from "@/lib/nav"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/cn"

interface SidebarNavProps {
  collapsed?: boolean
  onNavigate?: () => void
}

export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const { user } = useAuth()

  const visible = navItems.filter((item) => !item.roles || (user && item.roles.includes(user.role)))
  const mainItems = visible.filter((i) => i.section === "main")
  const accountItems = visible.filter((i) => i.section === "account")

  const renderGroup = (items: typeof visible, groupLabel: string) => (
    <div className="space-y-1">
      {!collapsed && (
        <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          {groupLabel}
        </p>
      )}
      {items.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
              isActive && "bg-sidebar-accent text-sidebar-foreground",
              collapsed && "justify-center px-2"
            )
          }
          title={collapsed ? item.label : undefined}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <item.icon className="size-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </>
          )}
        </NavLink>
      ))}
    </div>
  )

  return (
    <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-4">
      {renderGroup(mainItems, "Workspace")}
      <div className="my-1 h-px bg-sidebar-border" />
      {renderGroup(accountItems, "Account")}
    </nav>
  )
}
