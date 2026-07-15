import { Bell, Info, LayoutGrid, Moon, Sun } from "lucide-react"

import { PageHeader } from "@/components/common/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { useTheme } from "@/hooks/useTheme"
import { useDensity } from "@/hooks/useDensity"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { APP_NAME } from "@/lib/constants"

interface NotificationPrefs {
  emailAlerts: boolean
  pushNotifications: boolean
  weeklyDigest: boolean
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { density, setDensity } = useDensity()
  const [prefs, setPrefs] = useLocalStorage<NotificationPrefs>("dcims_notification_prefs", {
    emailAlerts: true,
    pushNotifications: true,
    weeklyDigest: false,
  })

  const togglePref = (key: keyof NotificationPrefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure your workspace preferences." />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
            Appearance
          </CardTitle>
          <CardDescription>Choose how {APP_NAME} looks on your device.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={theme} onValueChange={(v) => setTheme(v as "light" | "dark")} className="grid grid-cols-2 gap-3 sm:max-w-sm">
            <Label
              htmlFor="theme-light"
              className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 ${theme === "light" ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <RadioGroupItem id="theme-light" value="light" />
              <Sun className="size-4" /> Light
            </Label>
            <Label
              htmlFor="theme-dark"
              className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 ${theme === "dark" ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <RadioGroupItem id="theme-dark" value="dark" />
              <Moon className="size-4" /> Dark
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LayoutGrid className="size-4" /> Density</CardTitle>
          <CardDescription>Adjust table and list spacing across the app.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={density} onValueChange={(v) => setDensity(v as "comfortable" | "compact")} className="grid grid-cols-2 gap-3 sm:max-w-sm">
            <Label
              htmlFor="density-comfortable"
              className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 ${density === "comfortable" ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <RadioGroupItem id="density-comfortable" value="comfortable" />
              Comfortable
            </Label>
            <Label
              htmlFor="density-compact"
              className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 ${density === "compact" ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <RadioGroupItem id="density-compact" value="compact" />
              Compact
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="size-4" /> Notification Preferences</CardTitle>
          <CardDescription>Control how you're notified about alerts and requests.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email Alerts</p>
              <p className="text-xs text-muted-foreground">Receive an email when a critical alert is triggered.</p>
            </div>
            <Switch checked={prefs.emailAlerts} onCheckedChange={() => togglePref("emailAlerts")} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Push Notifications</p>
              <p className="text-xs text-muted-foreground">Show in-app notifications for new requests and alerts.</p>
            </div>
            <Switch checked={prefs.pushNotifications} onCheckedChange={() => togglePref("pushNotifications")} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Weekly Digest</p>
              <p className="text-xs text-muted-foreground">Get a weekly summary of fleet health and utilization.</p>
            </div>
            <Switch checked={prefs.weeklyDigest} onCheckedChange={() => togglePref("weeklyDigest")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="size-4" /> About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm text-muted-foreground">
          <p>{APP_NAME} — Data Center & Inventory Management System</p>
          <p>Version 1.0.0 · Mock data environment</p>
        </CardContent>
      </Card>
    </div>
  )
}
