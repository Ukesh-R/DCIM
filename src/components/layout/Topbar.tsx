import * as React from "react"
import { Menu, Database } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SidebarNav } from "./SidebarNav"
import { Breadcrumbs } from "./Breadcrumbs"
import { ThemeToggle } from "./ThemeToggle"
import { NotificationBell } from "./NotificationBell"
import { UserMenu } from "./UserMenu"
import { APP_NAME } from "@/lib/constants"

export function Topbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
          <Menu className="size-5" />
        </Button>
        <SheetContent side="left" className="flex w-72 flex-col bg-sidebar p-0 text-sidebar-foreground">
          <SheetHeader className="flex-row items-center gap-2 space-y-0 px-4 py-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <Database className="size-4.5" />
            </div>
            <SheetTitle className="text-base font-bold text-sidebar-foreground">{APP_NAME}</SheetTitle>
          </SheetHeader>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <Breadcrumbs />

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell />
        <div className="ml-1 h-6 w-px bg-border" />
        <UserMenu />
      </div>
    </header>
  )
}
