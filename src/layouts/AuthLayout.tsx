import { Outlet } from "react-router-dom"
import { Database, ShieldCheck, Activity, Server } from "lucide-react"

import { Toaster } from "@/components/ui/toaster"
import { APP_NAME, APP_FULL_NAME } from "@/lib/constants"

export function AuthLayout() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-glow">
              <Database className="size-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
          </div>
          <Outlet />
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-secondary to-info lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.12),transparent_40%)]" />
        <div className="relative z-10 text-primary-foreground">
          <p className="text-sm font-medium uppercase tracking-widest text-primary-foreground/70">Enterprise Platform</p>
          <h1 className="mt-3 max-w-md text-3xl font-bold leading-tight">{APP_FULL_NAME}</h1>
          <p className="mt-3 max-w-md text-sm text-primary-foreground/80">
            Manage clusters, customer assets, requests, and live infrastructure monitoring from a single
            unified control plane.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { icon: Server, label: "Cluster Fleet Ops" },
            { icon: Activity, label: "Live Monitoring" },
            { icon: ShieldCheck, label: "Role-Based Access" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="rounded-xl border border-white/20 bg-white/10 p-4 text-primary-foreground backdrop-blur-sm"
            >
              <Icon className="size-5" />
              <p className="mt-2 text-xs font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
      <Toaster />
    </div>
  )
}
