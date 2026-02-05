import { cn } from "@/lib/utils"
import type { Room } from "@/features/inventory"

interface RoomSelectorProps {
  rooms: Room[]
  selectedRoom: string | null
  onSelectRoom: (roomId: string) => void
  loading?: boolean
}

export function RoomSelector({
  rooms,
  selectedRoom,
  onSelectRoom,
  loading,
}: RoomSelectorProps) {
  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 w-24 rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => onSelectRoom(room.id)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
            selectedRoom === room.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          )}
        >
          Room {room.number}
          {room.name && <span className="text-xs opacity-75 ml-1">({room.name})</span>}
        </button>
      ))}
    </div>
  )
}
