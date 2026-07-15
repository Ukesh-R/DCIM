import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { useTheme } from "@/hooks/useTheme"
import { chromePalette } from "@/lib/chartPalette"
import { ChartTooltip } from "./ChartTooltip"

export interface DonutDatum {
  name: string
  value: number
  color: string
}

interface DonutChartProps {
  data: DonutDatum[]
  height?: number
  centerLabel?: string
  centerValue?: string | number
}

export function DonutChart({ data, height = 260, centerLabel, centerValue }: DonutChartProps) {
  const { theme } = useTheme()
  const chrome = chromePalette(theme)
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="88%"
            paddingAngle={2}
            cornerRadius={4}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip valueFormatter={(v) => `${v} (${((v / (total || 1)) * 100).toFixed(0)}%)`} />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: chrome.textSecondary }}
          />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
          <span className="text-2xl font-bold tabular-nums">{centerValue}</span>
          {centerLabel && <span className="text-xs text-muted-foreground">{centerLabel}</span>}
        </div>
      )}
    </div>
  )
}
