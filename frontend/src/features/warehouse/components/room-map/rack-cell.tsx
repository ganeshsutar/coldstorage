import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getRackStatus, type RackStatus } from "../../types/room-map"

interface RackCellProps {
  floorNumber: number
  rackNumber: number
  quantity: number
  capacity?: number
  onClick?: () => void
  selected?: boolean
}

const statusColors: Record<RackStatus, string> = {
  empty: "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
  partial: "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-800",
  full: "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-800",
  reserved: "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-800",
  maintenance: "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-800",
}

export function RackCell({
  floorNumber,
  rackNumber,
  quantity,
  capacity = 100,
  onClick,
  selected,
}: RackCellProps) {
  const status = getRackStatus(quantity, capacity)
  const occupancyPercent = Math.min(100, Math.round((quantity / capacity) * 100))

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "w-10 h-10 rounded border-2 text-xs font-medium transition-all",
              "hover:ring-2 hover:ring-primary/50 hover:ring-offset-1",
              "flex items-center justify-center",
              statusColors[status],
              selected && "ring-2 ring-primary ring-offset-2"
            )}
          >
            {rackNumber}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="space-y-1">
            <p className="font-semibold">Rack {rackNumber} (Floor {floorNumber})</p>
            <p>Quantity: {quantity} bags</p>
            <p>Occupancy: {occupancyPercent}%</p>
            <p className="capitalize">Status: {status}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
