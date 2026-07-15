import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts"

import { useTheme } from "@/hooks/useTheme"
import { chromePalette } from "@/lib/chartPalette"
import { ChartTooltip } from "./ChartTooltip"

export interface TimeSeries {
  key: string
  label: string
  color: string
}

interface TimeSeriesChartProps<T extends object> {
  data: T[]
  series: TimeSeries[]
  xKey: Extract<keyof T, string>
  type?: "line" | "area"
  height?: number
  valueFormatter?: (value: number) => string
  showLegend?: boolean
}

export function TimeSeriesChart<T extends object>({
  data,
  series,
  xKey,
  type = "area",
  height = 280,
  valueFormatter,
  showLegend = true,
}: TimeSeriesChartProps<T>) {
  const { theme } = useTheme()
  const chrome = chromePalette(theme)
  const Chart = type === "area" ? AreaChart : LineChart

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Chart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke={chrome.grid} strokeDasharray="3 5" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fill: chrome.muted, fontSize: 11 }}
          axisLine={{ stroke: chrome.baseline }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fill: chrome.muted, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={42}
        />
        <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} cursor={{ stroke: chrome.baseline }} />
        {showLegend && series.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: 12, color: chrome.textSecondary }}
            iconType="circle"
            iconSize={8}
          />
        )}
        {series.map((s) =>
          type === "area" ? (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              fill={`url(#grad-${s.key})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ) : (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          )
        )}
      </Chart>
    </ResponsiveContainer>
  )
}
