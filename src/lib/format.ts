import { format, formatDistanceToNow, isValid } from "date-fns"

export function formatDate(input: string | number | Date | null | undefined, pattern = "MMM d, yyyy"): string {
  if (!input) return "—"
  const date = new Date(input)
  if (!isValid(date)) return "—"
  return format(date, pattern)
}

export function formatDateTime(input: string | number | Date | null | undefined): string {
  return formatDate(input, "MMM d, yyyy · h:mm a")
}

export function formatRelativeTime(input: string | number | Date | null | undefined): string {
  if (!input) return "—"
  const date = new Date(input)
  if (!isValid(date)) return "—"
  return formatDistanceToNow(date, { addSuffix: true })
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value)
}

export function formatBytesFromGb(gb: number): string {
  if (gb >= 1024) return `${(gb / 1024).toFixed(1)} TB`
  return `${gb} GB`
}

export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function titleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}
