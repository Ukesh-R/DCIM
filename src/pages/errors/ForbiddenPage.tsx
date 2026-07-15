import { Link } from "react-router-dom"
import { ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ForbiddenPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="size-8" />
      </div>
      <div>
        <p className="text-6xl font-bold tracking-tight">403</p>
        <p className="mt-2 text-lg font-medium">Access restricted</p>
        <p className="mt-1 text-sm text-muted-foreground">
          You don't have permission to view this page. Contact an administrator if you believe this is a mistake.
        </p>
      </div>
      <Button asChild>
        <Link to="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  )
}
