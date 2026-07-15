import * as React from "react"

import { getAlerts } from "@/services/alert.service"
import { getRequests } from "@/services/request.service"

export interface NotificationItem {
  id: string
  title: string
  description: string
  timestamp: string
  level: "critical" | "warning" | "info"
  href: string
}

interface NotificationContextValue {
  notifications: NotificationItem[]
  readIds: Set<string>
  unreadCount: number
  isLoading: boolean
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  refresh: () => void
}

const READ_KEY = "dcims_read_notifications"
const NotificationContext = React.createContext<NotificationContextValue | undefined>(undefined)

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([])
  const [readIds, setReadIds] = React.useState<Set<string>>(loadReadIds)
  const [isLoading, setIsLoading] = React.useState(true)
  const [refreshKey, setRefreshKey] = React.useState(0)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      const [alertsRes, requestsRes] = await Promise.all([
        getAlerts({ status: "open", pageSize: 6, sortBy: "createdAt", sortDir: "desc" }),
        getRequests({ status: "pending", pageSize: 6, sortBy: "createdAt", sortDir: "desc" }),
      ])
      if (cancelled) return

      const alertItems: NotificationItem[] = alertsRes.data.map((a) => ({
        id: `alert-${a.id}`,
        title: a.title,
        description: a.sourceName,
        timestamp: a.createdAt,
        level: a.level,
        href: "/alerts",
      }))
      const requestItems: NotificationItem[] = requestsRes.data.map((r) => ({
        id: `request-${r.id}`,
        title: r.title,
        description: `Requested by ${r.requestedByName}`,
        timestamp: r.createdAt,
        level: "info",
        href: r.targetType === "cluster" ? "/cluster-requests" : "/asset-requests",
      }))

      const merged = [...alertItems, ...requestItems].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      setNotifications(merged)
      setIsLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const persistReadIds = (next: Set<string>) => {
    setReadIds(next)
    localStorage.setItem(READ_KEY, JSON.stringify(Array.from(next)))
  }

  const markAsRead = React.useCallback(
    (id: string) => {
      persistReadIds(new Set(readIds).add(id))
    },
    [readIds]
  )

  const markAllAsRead = React.useCallback(() => {
    const all = new Set(notifications.map((n) => n.id))
    persistReadIds(all)
  }, [notifications])

  const refresh = React.useCallback(() => setRefreshKey((k) => k + 1), [])

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length

  return (
    <NotificationContext.Provider
      value={{ notifications, readIds, unreadCount, isLoading, markAsRead, markAllAsRead, refresh }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const ctx = React.useContext(NotificationContext)
  if (!ctx) throw new Error("useNotificationContext must be used within NotificationProvider")
  return ctx
}
