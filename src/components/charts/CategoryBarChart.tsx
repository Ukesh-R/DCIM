import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { useTheme } from "@/hooks/useTheme"
import { chromePalette } from "@/lib/chartPalette"
import { ChartTooltip } from "./ChartTooltip"

export interface CategoryDatum {
  name: string
  value: number
  color: string
}

interface CategoryBarChartProps {
  data: CategoryDatum[]
  height?: number
  layout?: "vertical" | "horizontal"
  valueFormatter?: (value: number) => string
}

export function CategoryBarChart({ data, height = 280, layout = "horizontal", valueFormatter }: CategoryBarChartProps) {
  const { theme } = useTheme()
  const chrome = chromePalette(theme)
  const isVertical = layout === "vertical"

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={isVertical ? "vertical" : "horizontal"}
        margin={{ top: 4, right: 16, left: isVertical ? 8 : 0, bottom: 0 }}
        barCategoryGap={isVertical ? 10 : 18}
      >
        <CartesianGrid stroke={chrome.grid} strokeDasharray="3 5" horizontal={!isVertical} vertical={isVertical} />
        {isVertical ? (
          <>
            <XAxis type="number" tick={{ fill: chrome.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: chrome.textSecondary, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={110}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="name"
              tick={{ fill: chrome.muted, fontSize: 11 }}
              axisLine={{ stroke: chrome.baseline }}
              tickLine={false}
              interval={0}
            />
            <YAxis tick={{ fill: chrome.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
          </>
        )}
        <Tooltip
          content={<ChartTooltip valueFormatter={valueFormatter} />}
          cursor={{ fill: "currentColor", opacity: 0.05 }}
        />
        <Bar dataKey="value" name="Count" radius={isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={36}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
