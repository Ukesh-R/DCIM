import { RadialBar, RadialBarChart, PolarAngleAxis, ResponsiveContainer } from "recharts"

import { cn } from "@/lib/cn"

interface GaugeChartProps {
  value: number
  label: string
  color: string
  size?: number
  unit?: string
}

export function GaugeChart({ value, label, color, size = 140, unit = "%" }: GaugeChartProps) {
  const data = [{ value: Math.min(100, Math.max(0, value)) }]

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={data}
            innerRadius="72%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            barSize={10}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar dataKey="value" cornerRadius={8} fill={color} background={{ fill: "hsl(var(--muted))" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-xl font-bold tabular-nums")} style={{ color }}>
            {Math.round(value)}
            {unit}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}
