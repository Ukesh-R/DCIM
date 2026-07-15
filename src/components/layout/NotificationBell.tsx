import { Bell, CheckCheck } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotifications } from "@/hooks/useNotifications"
import { formatRelativeTime } from "@/lib/format"
import { cn } from "@/lib/cn"

const LEVEL_DOT: Record<string, string> = {
  critical: "bg-destructive",
  warning: "bg-warning",
  info: "bg-info",
}

export function NotificationBell() {
  const { notifications, readIds, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const navigate = useNavigate()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-2 items-center justify-center rounded-full bg-destructive ring-2 ring-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={markAllAsRead}>
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">You're all caught up.</p>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => {
                const isRead = readIds.has(n.id)
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      markAsRead(n.id)
                      navigate(n.href)
                    }}
                    className={cn(
                      "flex w-full items-start gap-2.5 px-4 py-3 text-left text-sm transition-colors hover:bg-accent",
                      !isRead && "bg-primary/[0.03]"
                    )}
                  >
                    <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", LEVEL_DOT[n.level])} />
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate", !isRead && "font-medium")}>{n.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{n.description}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground/70">{formatRelativeTime(n.timestamp)}</p>
                    </div>
                    {!isRead && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />}
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
