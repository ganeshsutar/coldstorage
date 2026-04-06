import * as React from "react"
import { Plus, Trash2, Wand2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Room } from "@/features/inventory/types/masters"
import type { RoomFloor, CreateRoomFloorRequest } from "@/features/warehouse/types/room-floor"
import {
  generateFloorConfigs,
  validateFloorConfigs,
} from "@/features/warehouse/utils/floor-utils"
import type { FloorConfig } from "@/features/warehouse/types/room-map"

interface FloorConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chamber: Room | null
  existingFloors: RoomFloor[]
  onSave: (floors: CreateRoomFloorRequest[]) => Promise<void>
}

interface EditableFloor {
  id?: string
  floor_number: number
  from_rack: number
  to_rack: number
  isNew?: boolean
  isDeleted?: boolean
}

export function FloorConfigDialog({
  open,
  onOpenChange,
  chamber,
  existingFloors,
  onSave,
}: FloorConfigDialogProps) {
  const [floors, setFloors] = React.useState<EditableFloor[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Initialize floors when dialog opens
  React.useEffect(() => {
    if (open && chamber) {
      if (existingFloors.length > 0) {
        setFloors(
          existingFloors.map((f) => ({
            id: f.id,
            floor_number: f.floor_number,
            from_rack: f.from_rack,
            to_rack: f.to_rack,
          }))
        )
      } else {
        // Start with empty state if no existing floors
        setFloors([])
      }
    }
  }, [open, chamber, existingFloors])

  const handleAutoGenerate = () => {
    if (!chamber) return

    const configs = generateFloorConfigs(
      chamber.floor_count,
      chamber.rack_count || 0
    )

    setFloors(
      configs.map((config, index) => ({
        id: existingFloors[index]?.id,
        floor_number: config.floor_number,
        from_rack: config.from_rack,
        to_rack: config.to_rack,
        isNew: !existingFloors[index],
      }))
    )
  }

  const handleAddFloor = () => {
    const maxFloorNumber = Math.max(0, ...floors.map((f) => f.floor_number))
    const lastFloor = floors[floors.length - 1]
    const nextFromRack = lastFloor ? lastFloor.to_rack + 1 : 1

    setFloors([
      ...floors,
      {
        floor_number: maxFloorNumber + 1,
        from_rack: nextFromRack,
        to_rack: nextFromRack + 9,
        isNew: true,
      },
    ])
  }

  const handleRemoveFloor = (index: number) => {
    const floor = floors[index]
    if (floor.id) {
      // Mark existing floor as deleted
      setFloors(
        floors.map((f, i) => (i === index ? { ...f, isDeleted: true } : f))
      )
    } else {
      // Remove new floor entirely
      setFloors(floors.filter((_, i) => i !== index))
    }
  }

  const handleFloorChange = (
    index: number,
    field: keyof EditableFloor,
    value: number
  ) => {
    setFloors(
      floors.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    )
  }

  const handleSave = async () => {
    if (!chamber) return

    // Validate floor configurations
    const activeFloors = floors.filter((f) => !f.isDeleted)
    const configs: FloorConfig[] = activeFloors.map((f) => ({
      floor_number: f.floor_number,
      from_rack: f.from_rack,
      to_rack: f.to_rack,
      rack_count: f.to_rack - f.from_rack + 1,
    }))

    const errors = validateFloorConfigs(configs)
    if (errors.length > 0) {
      toast.error("Validation Error", {
        description: errors[0],
      })
      return
    }

    setIsSubmitting(true)
    try {
      const floorRequests: CreateRoomFloorRequest[] = activeFloors.map((f) => ({
        room: chamber.id,
        floor_number: f.floor_number,
        from_rack: f.from_rack,
        to_rack: f.to_rack,
        is_active: true,
      }))

      await onSave(floorRequests)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeFloors = floors.filter((f) => !f.isDeleted)
  const totalRacks = activeFloors.reduce(
    (sum, f) => sum + (f.to_rack - f.from_rack + 1),
    0
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Configure Floors - Room {chamber?.number}
          </DialogTitle>
          <DialogDescription>
            Define rack ranges for each floor. Total racks: {totalRacks}
            {chamber?.rack_count ? ` / ${chamber.rack_count}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Auto-generate button */}
          <div className="flex justify-between items-center">
            <Label className="text-sm text-muted-foreground">
              {chamber?.floor_count} floor(s) configured in chamber
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoGenerate}
              disabled={!chamber?.rack_count}
            >
              <Wand2 className="mr-2 size-4" />
              Auto-generate
            </Button>
          </div>

          {/* Floor table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Floor #</TableHead>
                  <TableHead>From Rack</TableHead>
                  <TableHead>To Rack</TableHead>
                  <TableHead className="w-[80px]">Racks</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeFloors.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      No floors configured. Click "Add Floor" or "Auto-generate"
                      to begin.
                    </TableCell>
                  </TableRow>
                ) : (
                  activeFloors.map((floor) => {
                    const originalIndex = floors.findIndex(
                      (f) =>
                        f.floor_number === floor.floor_number && !f.isDeleted
                    )
                    return (
                      <TableRow key={floor.floor_number}>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            value={floor.floor_number}
                            onChange={(e) =>
                              handleFloorChange(
                                originalIndex,
                                "floor_number",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-16"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            value={floor.from_rack}
                            onChange={(e) =>
                              handleFloorChange(
                                originalIndex,
                                "from_rack",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            value={floor.to_rack}
                            onChange={(e) =>
                              handleFloorChange(
                                originalIndex,
                                "to_rack",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          {floor.to_rack - floor.from_rack + 1}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleRemoveFloor(originalIndex)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Add floor button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddFloor}
          >
            <Plus className="mr-2 size-4" />
            Add Floor
          </Button>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting || activeFloors.length === 0}
          >
            {isSubmitting ? "Saving..." : "Save Configuration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
