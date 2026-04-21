// Amad (Goods Arrival) types

export type AmadType = "SEEDHI" | "DUMP"

export interface Amad {
  id: string
  amad_no: string
  date: string
  party: string
  party_code: string
  party_name: string
  village: string | null
  village_code?: string
  village_name: string | null
  commodity: string
  commodity_code?: string
  commodity_name: string
  room: string | null
  room_number: string | null
  room_name?: string | null
  pkt1: number
  pwt1: number
  pkt2: number
  pwt2: number
  pkt3: number
  pwt3: number
  total_packets: number
  total_weight: number
  marks: string | null
  grace_days: number
  rent_rate: number
  amad_type: AmadType
  e_way_bill: string | null
  is_fully_dispatched: boolean
  remaining_packets: number
  remaining_weight: number
  created_at?: string
  updated_at?: string
}

export interface AmadSummary {
  id: string
  amad_no: string
  date: string
  party: string
  party_code: string
  party_name: string
  village: string | null
  village_name: string | null
  commodity: string
  commodity_name: string
  room: string | null
  room_number: string | null
  total_packets: number
  total_weight: number
  remaining_packets: number
  remaining_weight: number
  amad_type: AmadType
  is_fully_dispatched: boolean
}

export interface CreateAmadRequest {
  date: string
  party: string
  village?: string
  commodity: string
  room?: string
  pkt1: number
  pwt1: number
  pkt2?: number
  pwt2?: number
  pkt3?: number
  pwt3?: number
  marks?: string
  grace_days?: number
  rent_rate?: number
  amad_type?: AmadType
  e_way_bill?: string
}

export interface StockSummary {
  total_amads: number
  active_amads: number
  total_packets: number
  total_weight: number
  remaining_packets: number
  remaining_weight: number
  fully_dispatched: number
}

export interface PartyStock {
  party_id: string
  party_code: string
  party_name: string
  amads: AmadSummary[]
  total_packets: number
  total_weight: number
  remaining_packets: number
  remaining_weight: number
}

export interface CommodityStock {
  commodity_id: string
  commodity_code: string
  commodity_name: string
  total_packets: number
  total_weight: number
  remaining_packets: number
  remaining_weight: number
}

export interface RoomStock {
  room_id: string
  room_number: string
  room_name: string | null
  capacity_quintals: number
  occupied_quintals: number
  utilization_percent: number
  total_packets: number
}

export interface TodaySummary {
  date: string
  arrivals: {
    count: number
    packets: number
    weight: number
  }
  dispatches: {
    count: number
    packets: number
    weight: number
    amount: number
  }
}

export interface RecentAmad {
  id: string
  amad_no: string
  date: string
  party_name: string
  commodity_name: string
  total_packets: number
  total_weight: string
}

export interface DashboardData {
  today_summary: TodaySummary
  stock_summary: StockSummary
  avg_utilization: number
  pending_dues: string
  today_receipts: string
  active_saudas: number
  recent_amads: RecentAmad[]
}
