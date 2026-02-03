// Takpatti (Weighment Slip) types

export interface Takpatti {
  id: string
  takpatti_no: string
  date: string
  amad: string
  amad_no: string
  party_name?: string
  packets: number
  gross_weight: number
  tare_weight: number
  net_weight: number
  room: string | null
  room_number: string | null
  room_name?: string | null
  floor_no: number
  created_at?: string
  updated_at?: string
}

export interface CreateTakpattiRequest {
  date: string
  amad: string
  packets: number
  gross_weight: number
  tare_weight: number
  room?: string
  floor_no?: number
}
