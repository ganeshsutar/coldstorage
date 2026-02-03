import * as React from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRooms } from "@/features/inventory"
import { useRoomFloorsByRoom } from "../../hooks/use-room-floors"

interface LocationPickerProps {
  selectedRoomId?: string
  selectedFloorNumber?: number
  selectedRackNumber?: number
  onRoomChange: (roomId: string) => void
  onFloorChange: (floorNumber: number) => void
  onRackChange: (rackNumber: number) => void
  disabled?: boolean
  label?: string
}

export function LocationPicker({
  selectedRoomId,
  selectedFloorNumber,
  selectedRackNumber,
  onRoomChange,
  onFloorChange,
  onRackChange,
  disabled = false,
  label,
}: LocationPickerProps) {
  const { rooms, loading: roomsLoading } = useRooms(true)
  const { floors, loading: floorsLoading } = useRoomFloorsByRoom(selectedRoomId || "")

  // Get selected floor config to determine rack range
  const selectedFloor = React.useMemo(() => {
    if (!selectedFloorNumber) return null
    return floors.find((f) => f.floor_number === selectedFloorNumber) || null
  }, [floors, selectedFloorNumber])

  // Generate rack numbers from floor config
  const rackNumbers = React.useMemo(() => {
    if (!selectedFloor) return []
    const racks: number[] = []
    for (let i = selectedFloor.from_rack; i <= selectedFloor.to_rack; i++) {
      racks.push(i)
    }
    return racks
  }, [selectedFloor])

  // Get unique floor numbers from floors
  const floorNumbers = React.useMemo(() => {
    const uniqueFloors = [...new Set(floors.map((f) => f.floor_number))]
    return uniqueFloors.sort((a, b) => a - b)
  }, [floors])

  const handleRoomChange = (roomId: string) => {
    onRoomChange(roomId)
  }

  const handleFloorChange = (floorStr: string) => {
    onFloorChange(parseInt(floorStr, 10))
  }

  const handleRackChange = (rackStr: string) => {
    onRackChange(parseInt(rackStr, 10))
  }

  return (
    <div className="space-y-4">
      {label && (
        <Label className="text-sm font-medium text-foreground">{label}</Label>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Room Select */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Room</Label>
          <Select
            value={selectedRoomId || ""}
            onValueChange={handleRoomChange}
            disabled={disabled || roomsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select room" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  Room {room.number}
                  {room.name && <span className="text-muted-foreground ml-1">({room.name})</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Floor Select */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Floor</Label>
          <Select
            value={selectedFloorNumber?.toString() || ""}
            onValueChange={handleFloorChange}
            disabled={disabled || !selectedRoomId || floorsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select floor" />
            </SelectTrigger>
            <SelectContent>
              {floorNumbers.map((floorNum) => (
                <SelectItem key={floorNum} value={floorNum.toString()}>
                  Floor {floorNum}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rack Select */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Rack</Label>
          <Select
            value={selectedRackNumber?.toString() || ""}
            onValueChange={handleRackChange}
            disabled={disabled || !selectedFloorNumber || rackNumbers.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select rack" />
            </SelectTrigger>
            <SelectContent>
              {rackNumbers.map((rackNum) => (
                <SelectItem key={rackNum} value={rackNum.toString()}>
                  Rack {rackNum}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
