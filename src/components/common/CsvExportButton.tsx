import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toCsv, downloadCsv } from "@/lib/csv"
import { useToast } from "@/hooks/use-toast"

interface CsvExportButtonProps<T extends object> {
  data: T[]
  filename: string
  columns?: string[]
  label?: string
}

export function CsvExportButton<T extends object>({ data, filename, columns, label = "Export CSV" }: CsvExportButtonProps<T>) {
  const { toast } = useToast()

  const handleExport = () => {
    if (data.length === 0) {
      toast({ title: "Nothing to export", description: "There are no rows matching the current view." })
      return
    }
    downloadCsv(filename, toCsv(data, columns))
    toast({ title: "Export ready", description: `${data.length} rows exported to ${filename}.csv` })
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
      <Download className="size-4" />
      {label}
    </Button>
  )
}
