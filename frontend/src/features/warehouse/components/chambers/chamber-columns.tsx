import { MoreHorizontal, Pencil, Layers, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Room } from "@/features/inventory/types/masters"

export interface ChamberColumnActions {
  onEdit: (room: Room) => void
  onConfigureFloors: (room: Room) => void
  onDelete: (room: Room) => void
}

export function getChamberColumns(actions: ChamberColumnActions) {
  return [
    {
      key: "number" as const,
      header: "Number",
      cell: (room: Room) => (
        <span className="font-medium">Room {room.number}</span>
      ),
    },
    {
      key: "name" as const,
      header: "Name",
      cell: (room: Room) => (
        <div>
          <span>{room.name || "-"}</span>
          {room.name_hindi && (
            <span className="ml-2 text-muted-foreground">
              ({room.name_hindi})
            </span>
          )}
        </div>
      ),
    },
    {
      key: "floor_count" as const,
      header: "Floors",
      cell: (room: Room) => room.floor_count,
    },
    {
      key: "rack_count" as const,
      header: "Racks",
      cell: (room: Room) => room.rack_count || "-",
    },
    {
      key: "target_temperature" as const,
      header: "Target Temp",
      cell: (room: Room) =>
        room.target_temperature !== null
          ? `${room.target_temperature}°C`
          : "-",
    },
    {
      key: "is_active" as const,
      header: "Status",
      cell: (room: Room) => (
        <Badge variant={room.is_active ? "default" : "secondary"}>
          {room.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions" as const,
      header: "",
      cell: (room: Room) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => actions.onEdit(room)}>
              <Pencil className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions.onConfigureFloors(room)}>
              <Layers className="mr-2 size-4" />
              Configure Floors
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => actions.onDelete(room)}
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
