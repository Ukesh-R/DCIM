// Validated categorical/status palette (see dataviz skill references/palette.md).
// Fixed hue order — never cycled/reassigned when a filter changes series count.
export const CATEGORICAL_LIGHT = [
  "#2a78d6", // 1 blue
  "#008300", // 2 green
  "#e87ba4", // 3 magenta
  "#eda100", // 4 yellow
  "#1baf7a", // 5 aqua
  "#eb6834", // 6 orange
  "#4a3aa7", // 7 violet
  "#e34948", // 8 red
] as const

export const CATEGORICAL_DARK = [
  "#3987e5",
  "#008300",
  "#d55181",
  "#c98500",
  "#199e70",
  "#d95926",
  "#9085e9",
  "#e66767",
] as const

export const STATUS_LIGHT = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
}

export const STATUS_DARK = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#e66767",
}

export const CHROME_LIGHT = {
  textSecondary: "#52514e",
  muted: "#898781",
  grid: "#e1e0d9",
  baseline: "#c3c2b7",
}

export const CHROME_DARK = {
  textSecondary: "#c3c2b7",
  muted: "#898781",
  grid: "#2c2c2a",
  baseline: "#383835",
}

export function categoricalPalette(theme: "light" | "dark") {
  return theme === "dark" ? CATEGORICAL_DARK : CATEGORICAL_LIGHT
}

export function statusPalette(theme: "light" | "dark") {
  return theme === "dark" ? STATUS_DARK : STATUS_LIGHT
}

export function chromePalette(theme: "light" | "dark") {
  return theme === "dark" ? CHROME_DARK : CHROME_LIGHT
}
