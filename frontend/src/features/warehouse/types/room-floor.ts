// Room Floor types

export interface RoomFloor {
  id: string
  room: string
  room_number: string
  floor_number: number
  from_rack: number
  to_rack: number
  rack_count: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateRoomFloorRequest {
  room: string
  floor_number: number
  from_rack: number
  to_rack: number
  is_active?: boolean
}
