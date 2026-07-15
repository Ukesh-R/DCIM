import * as React from "react"
import { FileUp, FileDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { parseCsv, toCsv, downloadCsv } from "@/lib/csv"
import { useToast } from "@/hooks/use-toast"

interface CsvImportButtonProps {
  onImport: (rows: Record<string, string>[]) => Promise<void> | void
  sampleRow: Record<string, unknown>
  sampleFilename: string
  label?: string
}

export function CsvImportButton({ onImport, sampleRow, sampleFilename, label = "Import CSV" }: CsvImportButtonProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = React.useState(false)
  const { toast } = useToast()

  const handleFile = async (file: File) => {
    setIsImporting(true)
    try {
      const text = await file.text()
      const rows = parseCsv(text)
      if (rows.length === 0) {
        toast({ title: "Empty file", description: "No data rows were found in that CSV." })
        return
      }
      await onImport(rows)
      toast({ title: "Import complete", description: `${rows.length} rows imported successfully.` })
    } catch (err) {
      toast({
        title: "Import failed",
        description: err instanceof Error ? err.message : "Could not parse the CSV file.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const downloadSample = () => {
    downloadCsv(sampleFilename, toCsv([sampleRow]))
    toast({ title: "Sample downloaded", description: `${sampleFilename}.csv is ready to use as a template.` })
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ""
        }}
      />
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        loading={isImporting}
        onClick={() => inputRef.current?.click()}
      >
        <FileUp className="size-4" />
        {label}
      </Button>
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={downloadSample}>
        <FileDown className="size-4" />
        Sample CSV
      </Button>
    </div>
  )
}
