import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FloorConfig } from "../../types/room-map"

interface FloorSelectorProps {
  floors: FloorConfig[]
  selectedFloor: number | null
  onSelectFloor: (floor: number) => void
  disabled?: boolean
}

export function FloorSelector({
  floors,
  selectedFloor,
  onSelectFloor,
  disabled,
}: FloorSelectorProps) {
  return (
    <Select
      value={selectedFloor?.toString() ?? ""}
      onValueChange={(value) => onSelectFloor(parseInt(value))}
      disabled={disabled || floors.length === 0}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select floor" />
      </SelectTrigger>
      <SelectContent>
        {floors.map((floor) => (
          <SelectItem key={floor.floor_number} value={floor.floor_number.toString()}>
            Floor {floor.floor_number} (Racks {floor.from_rack}-{floor.to_rack})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
