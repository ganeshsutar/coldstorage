import * as React from "react"
import { Plus, Search, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRooms, roomService } from "@/features/inventory"
import type { Room, CreateRoomRequest } from "@/features/inventory/types/masters"
import { roomFloorService } from "@/features/warehouse/api/room-floor"
import type { RoomFloor, CreateRoomFloorRequest } from "@/features/warehouse/types/room-floor"
import { getNextRoomNumber } from "@/features/warehouse/utils/floor-utils"
import { getChamberColumns } from "./chamber-columns"
import { ChamberDialog } from "./chamber-dialog"
import { FloorConfigDialog } from "./floor-config-dialog"

export function ChambersTab() {
  const { rooms, loading, refetch } = useRooms()
  const [searchQuery, setSearchQuery] = React.useState("")

  // Dialog states
  const [chamberDialogOpen, setChamberDialogOpen] = React.useState(false)
  const [floorConfigDialogOpen, setFloorConfigDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [selectedChamber, setSelectedChamber] = React.useState<Room | null>(null)
  const [existingFloors, setExistingFloors] = React.useState<RoomFloor[]>([])
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Filter rooms by search query
  const filteredRooms = React.useMemo(() => {
    if (!searchQuery.trim()) return rooms

    const query = searchQuery.toLowerCase()
    return rooms.filter(
      (room) =>
        room.number.toLowerCase().includes(query) ||
        room.name?.toLowerCase().includes(query) ||
        room.name_hindi?.toLowerCase().includes(query)
    )
  }, [rooms, searchQuery])

  // Get next suggested room number
  const suggestedNumber = React.useMemo(() => getNextRoomNumber(rooms), [rooms])

  // Handlers
  const handleAddChamber = () => {
    setSelectedChamber(null)
    setChamberDialogOpen(true)
  }

  const handleEditChamber = (room: Room) => {
    setSelectedChamber(room)
    setChamberDialogOpen(true)
  }

  const handleConfigureFloors = async (room: Room) => {
    setSelectedChamber(room)
    try {
      const floors = await roomFloorService.getByRoom(room.id)
      setExistingFloors(floors)
    } catch {
      setExistingFloors([])
    }
    setFloorConfigDialogOpen(true)
  }

  const handleDeleteChamber = (room: Room) => {
    setSelectedChamber(room)
    setDeleteDialogOpen(true)
  }

  const handleChamberSubmit = async (data: CreateRoomRequest) => {
    try {
      if (selectedChamber) {
        await roomService.updateRoom(selectedChamber.id, data)
        toast.success("Chamber updated successfully")
      } else {
        await roomService.createRoom(data)
        toast.success("Chamber created successfully")
      }
      refetch()
    } catch (error) {
      toast.error(
        selectedChamber ? "Failed to update chamber" : "Failed to create chamber",
        {
          description: error instanceof Error ? error.message : "Unknown error",
        }
      )
      throw error
    }
  }

  const handleFloorConfigSave = async (floors: CreateRoomFloorRequest[]) => {
    if (!selectedChamber) return

    try {
      // Delete all existing floors for this room
      for (const floor of existingFloors) {
        await roomFloorService.deleteRoomFloor(floor.id)
      }

      // Create new floors
      for (const floor of floors) {
        await roomFloorService.createRoomFloor(floor)
      }

      toast.success("Floor configuration saved")
      refetch()
    } catch (error) {
      toast.error("Failed to save floor configuration", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
      throw error
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedChamber) return

    setIsDeleting(true)
    try {
      await roomService.deleteRoom(selectedChamber.id)
      toast.success("Chamber deleted successfully")
      setDeleteDialogOpen(false)
      setSelectedChamber(null)
      refetch()
    } catch (error) {
      toast.error("Failed to delete chamber", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = getChamberColumns({
    onEdit: handleEditChamber,
    onConfigureFloors: handleConfigureFloors,
    onDelete: handleDeleteChamber,
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chambers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleAddChamber}>
            <Plus className="h-4 w-4 mr-2" />
            Add Chamber
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading chambers...
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchQuery
                ? "No chambers found matching your search."
                : "No chambers configured. Click 'Add Chamber' to create one."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key}>{column.header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>{column.cell(room)}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Chamber Dialog */}
      <ChamberDialog
        open={chamberDialogOpen}
        onOpenChange={setChamberDialogOpen}
        chamber={selectedChamber}
        suggestedNumber={suggestedNumber}
        onSubmit={handleChamberSubmit}
      />

      {/* Floor Config Dialog */}
      <FloorConfigDialog
        open={floorConfigDialogOpen}
        onOpenChange={setFloorConfigDialogOpen}
        chamber={selectedChamber}
        existingFloors={existingFloors}
        onSave={handleFloorConfigSave}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chamber</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Room {selectedChamber?.number}
              {selectedChamber?.name && ` (${selectedChamber.name})`}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
