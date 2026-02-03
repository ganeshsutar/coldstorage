import * as React from "react"
import { RackCell } from "./rack-cell"
import type { RackOccupancy, FloorConfig } from "../../types/room-map"

interface RackGridProps {
  floor: FloorConfig
  occupancy: RackOccupancy[]
  racksPerRow: number
  onRackClick?: (floor: number, rack: number) => void
  selectedRack?: { floor: number; rack: number } | null
}

export function RackGrid({
  floor,
  occupancy,
  racksPerRow,
  onRackClick,
  selectedRack,
}: RackGridProps) {
  // Build rack data map
  const rackMap = React.useMemo(() => {
    const map = new Map<number, number>()
    occupancy.forEach((o) => {
      if (o.floor_number === floor.floor_number) {
        map.set(o.rack_number, o.current_quantity)
      }
    })
    return map
  }, [occupancy, floor.floor_number])

  // Generate rack numbers for this floor
  const racks = React.useMemo(() => {
    const result: number[] = []
    for (let i = floor.from_rack; i <= floor.to_rack; i++) {
      result.push(i)
    }
    return result
  }, [floor.from_rack, floor.to_rack])

  // Group racks into rows
  const rows = React.useMemo(() => {
    const result: number[][] = []
    for (let i = 0; i < racks.length; i += racksPerRow) {
      result.push(racks.slice(i, i + racksPerRow))
    }
    return result
  }, [racks, racksPerRow])

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-muted-foreground mb-2">
        Floor {floor.floor_number} - Racks {floor.from_rack} to {floor.to_rack}
      </div>
      <div className="space-y-1">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((rackNumber) => (
              <RackCell
                key={rackNumber}
                floorNumber={floor.floor_number}
                rackNumber={rackNumber}
                quantity={rackMap.get(rackNumber) ?? 0}
                onClick={() => onRackClick?.(floor.floor_number, rackNumber)}
                selected={
                  selectedRack?.floor === floor.floor_number &&
                  selectedRack?.rack === rackNumber
                }
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
