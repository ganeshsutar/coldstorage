// Master table types for inventory module

export interface Commodity {
  id: string
  code: string
  name: string
  name_hindi: string | null
  variety: string | null
  grace_days: number
  default_rent_rate: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateCommodityRequest {
  code: string
  name: string
  name_hindi?: string
  variety?: string
  grace_days: number
  default_rent_rate: number
  is_active?: boolean
}

export interface Room {
  id: string
  number: string
  name: string | null
  name_hindi: string | null
  capacity_quintals: number
  floor_count: number
  rack_count: number
  racks_per_row: number
  is_sugar_free: boolean
  occupancy_color: string | null
  target_temperature: number | null
  min_temperature: number | null
  max_temperature: number | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateRoomRequest {
  number: string
  name?: string
  name_hindi?: string
  capacity_quintals: number
  floor_count: number
  rack_count?: number
  racks_per_row?: number
  is_sugar_free?: boolean
  occupancy_color?: string
  target_temperature?: number | null
  min_temperature?: number | null
  max_temperature?: number | null
  is_active?: boolean
}

export interface Village {
  id: string
  code: string
  name: string
  name_hindi: string | null
  post: string | null
  district: string | null
  state: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateVillageRequest {
  code: string
  name: string
  name_hindi?: string
  post?: string
  district?: string
  state?: string
  is_active?: boolean
}
