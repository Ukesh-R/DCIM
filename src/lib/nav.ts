import {
  LayoutDashboard,
  Server,
  Package,
  ClipboardList,
  FileStack,
  Activity,
  BellRing,
  Users,
  UserCircle,
  Settings,
  type LucideIcon,
} from "lucide-react"

import type { Role } from "@/types/user.types"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles?: Role[]
  section: "main" | "account"
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, section: "main" },
  { label: "Clusters", href: "/clusters", icon: Server, section: "main" },
  { label: "Customer Assets", href: "/customer-assets", icon: Package, section: "main" },
  { label: "Cluster Requests", href: "/cluster-requests", icon: ClipboardList, section: "main" },
  { label: "Asset Requests", href: "/asset-requests", icon: FileStack, section: "main" },
  { label: "Live Monitoring", href: "/monitoring", icon: Activity, section: "main" },
  { label: "Alerts", href: "/alerts", icon: BellRing, section: "main" },
  { label: "User Management", href: "/users", icon: Users, roles: ["admin"], section: "main" },
  { label: "Profile", href: "/profile", icon: UserCircle, section: "account" },
  { label: "Settings", href: "/settings", icon: Settings, section: "account" },
]
