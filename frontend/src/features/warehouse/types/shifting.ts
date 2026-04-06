// Shifting types

import type { AmadSummary } from "@/features/inventory"

export interface ShiftingWizardState {
  step: 1 | 2 | 3 | 4
  sourceRoomId?: string
  sourceFloorNumber?: number
  sourceRackNumber?: number
  destinationRoomId?: string
  destinationFloorNumber?: number
  destinationRackNumber?: number
  amadId?: string
  amad?: AmadSummary
  pkt1: number
  pkt2: number
  pkt3: number
  reason?: string
  remarks?: string
}

export interface ShiftingItem {
  id: string
  amad: string
  amad_no: string
  party_name: string
  from_room: string
  from_room_number: string
  from_floor: number
  from_rack: number
  to_room: string
  to_room_number: string
  to_floor: number
  to_rack: number
  quantity: number
  narration: string | null
}

export interface ShiftHeader {
  id: string
  shift_no: string
  date: string
  from_room: string
  from_room_number: string
  to_room: string
  to_room_number: string
  item_count: number
  total_quantity: number
  remarks: string | null
  created_at: string
}

export interface ShiftHeaderDetail extends ShiftHeader {
  organization: string
  from_room_name: string | null
  to_room_name: string | null
  items: ShiftingItem[]
  created_by: string | null
  created_by_name: string | null
  updated_at: string
}

export interface CreateShiftingItemRequest {
  amad: string
  from_room: string
  from_floor: number
  from_rack: number
  to_room: string
  to_floor: number
  to_rack: number
  quantity: number
  narration?: string
}

export interface CreateShiftHeaderRequest {
  date: string
  from_room: string
  to_room: string
  remarks?: string
  items: CreateShiftingItemRequest[]
}

export interface ShiftValidationResult {
  valid: boolean
  errors: string[]
}
