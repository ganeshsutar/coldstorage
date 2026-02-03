// Loading types

export interface Loading {
  id: string
  amad: string
  amad_no: string
  date: string
  party_name: string
  commodity_name: string
  room: string
  room_number: string
  floor_number: number
  rack_number: number
  aisle: number | null
  quantity: number
  created_at: string
}

export interface LoadingDetail extends Loading {
  organization: string
  party_code: string
  room_name: string | null
  created_by: string | null
  created_by_name: string | null
  updated_at: string
}

export interface CreateLoadingRequest {
  amad: string
  date: string
  room: string
  floor_number: number
  rack_number: number
  aisle?: number
  quantity: number
}

export interface BulkLoadingRequest {
  amad: string
  date: string
  locations: Array<{
    room: string
    floor_number: number
    rack_number: number
    aisle?: number
    quantity: number
  }>
}

export interface RackSuggestion {
  room_id: string
  room_number: string
  floor_number: number
  rack_number: number
  current_quantity: number
  available_space: number
}
