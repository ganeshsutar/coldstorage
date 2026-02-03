// Unloading types

export type BillType = "RENT" | "TRANSFER" | "DAMAGE" | "OTHER"

export interface Unloading {
  id: string
  amad: string
  amad_no: string
  date: string
  party_name: string
  rent: string | null
  rent_serial_no: string | null
  room: string
  room_number: string
  floor_number: number
  rack_number: number
  quantity: number
  bill_type: BillType
  created_at: string
}

export interface UnloadingDetail extends Unloading {
  organization: string
  party_code: string
  commodity_name: string
  room_name: string | null
  created_by: string | null
  created_by_name: string | null
  updated_at: string
}

export interface CreateUnloadingRequest {
  amad: string
  rent?: string
  date: string
  room: string
  floor_number: number
  rack_number: number
  quantity: number
  bill_type?: BillType
}

export interface AmadLocation {
  room_id: string
  room_number: string
  floor_number: number
  rack_number: number
  quantity: number
  loaded_date: string
}

export interface UnloadSuggestion {
  room_id: string
  floor_number: number
  rack_number: number
  quantity: number
  loaded_date: string
}
