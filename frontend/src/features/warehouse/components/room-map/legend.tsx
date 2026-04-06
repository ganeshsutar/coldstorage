import { cn } from "@/lib/utils"

const legendItems = [
  { label: "Empty", color: "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700" },
  { label: "Partial", color: "bg-status-warning-muted border-status-warning-muted" },
  { label: "Full", color: "bg-status-success-muted border-status-success-muted" },
  { label: "Reserved", color: "bg-status-info-muted border-status-info-muted" },
  { label: "Maintenance", color: "bg-status-danger-muted border-status-danger-muted" },
]

export function RackLegend() {
  return (
    <div className="flex flex-wrap gap-4 items-center text-sm">
      <span className="text-muted-foreground">Legend:</span>
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div className={cn("size-4 rounded border-2", item.color)} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
