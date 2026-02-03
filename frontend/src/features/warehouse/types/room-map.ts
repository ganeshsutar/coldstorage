// Room Map types

export type RackStatus = "empty" | "partial" | "full" | "reserved" | "maintenance"

export interface RackOccupancy {
  id: string
  room: string
  room_number: string
  floor_number: number
  rack_number: number
  current_quantity: number
  last_updated: string
}

export interface FloorConfig {
  floor_number: number
  from_rack: number
  to_rack: number
  rack_count: number
}

export interface RoomSummary {
  total_racks: number
  occupied_racks: number
  total_capacity: number
  current_load: number
  occupancy_percent: number
}

export interface RoomMap {
  room_id: string
  room_number: string
  room_name: string | null
  floor_count: number
  rack_count: number
  racks_per_row: number
  floors: FloorConfig[]
  occupancy: RackOccupancy[]
  summary: RoomSummary
}

export interface RackItem {
  amad_id: string
  amad_no: string
  party_name: string
  commodity_name: string
  quantity: number
  loaded_date: string
}

export interface RackHistoryEntry {
  date: string
  type: "load" | "unload" | "shift_in" | "shift_out"
  amad_no: string
  quantity: number
  user: string
}

export interface RackContents {
  rack: {
    id: string | null
    room: string
    floor_number: number
    rack_number: number
    current_quantity: number
  }
  items: RackItem[]
  history: RackHistoryEntry[]
}

export function getRackStatus(quantity: number, capacity: number = 100): RackStatus {
  if (quantity === 0) return "empty"
  if (quantity >= capacity) return "full"
  if (quantity > capacity * 0.7) return "partial"
  return "partial"
}
