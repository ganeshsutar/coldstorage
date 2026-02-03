import * as React from "react"

const legendItems = [
  { label: "Empty", color: "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700" },
  { label: "Partial", color: "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-800" },
  { label: "Full", color: "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-800" },
  { label: "Reserved", color: "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-800" },
  { label: "Maintenance", color: "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-800" },
]

export function RackLegend() {
  return (
    <div className="flex flex-wrap gap-4 items-center text-sm">
      <span className="text-muted-foreground">Legend:</span>
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded border-2 ${item.color}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
