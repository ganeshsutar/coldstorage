// Trading module types

export type DealStatus = "OPEN" | "PARTIAL" | "DISPATCHED" | "CANCELLED" | "COMPLETED"

export type GatePassStatus = "DRAFT" | "DONE" | "CANCELLED"

// Sauda (Deal) Types

export interface Sauda {
  id: string
  deal_no: string
  deal_date: string
  seller: string
  seller_name: string
  buyer: string
  buyer_name: string
  commodity: string
  commodity_name: string
  variety: string | null
  quantity: number
  rate: number
  amount: number
  due_days: number
  due_date: string | null
  dispatched_quantity: number
  balance_quantity: number
  status: DealStatus
  status_display: string
  payment_terms: string | null
  delivery_location: string | null
  remarks: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  gate_passes?: GatePassNested[]
  created_at: string
  updated_at: string
}

export interface SaudaCreateRequest {
  deal_date: string
  seller_id: string
  buyer_id: string
  commodity_id: string
  variety?: string
  quantity: number
  rate: number
  due_days?: number
  due_date?: string
  payment_terms?: string
  delivery_location?: string
  remarks?: string
}

// Gate Pass Types

export interface GatePassNested {
  id: string
  gp_no: string
  gp_date: string
  total_packets: number
  total_weight: number
  vehicle_no: string | null
  status: GatePassStatus
  status_display: string
}

export interface GatePassItem {
  id: string
  amad: string
  amad_no: string
  pkt1: number
  pkt2: number
  pkt3: number
  weight: number
  rate: number
  amount: number
}

export interface GatePass {
  id: string
  gp_no: string
  gp_date: string
  gp_time: string | null
  seller: string
  seller_name: string
  buyer: string
  buyer_name: string
  sauda: string | null
  sauda_deal_no: string | null
  transport_name: string | null
  vehicle_no: string | null
  driver_name: string | null
  driver_contact: string | null
  bilti_no: string | null
  total_packets: number
  total_weight: number
  rate: number
  amount: number
  status: GatePassStatus
  status_display: string
  remarks: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  items?: GatePassItem[]
  created_at: string
  updated_at: string
}

export interface GatePassItemInput {
  amad_id: string
  pkt1?: number
  pkt2?: number
  pkt3?: number
  weight?: number
  rate?: number
}

export interface GatePassCreateRequest {
  gp_date: string
  gp_time?: string
  seller_id: string
  buyer_id: string
  sauda_id?: string
  transport_name?: string
  vehicle_no?: string
  driver_name?: string
  driver_contact?: string
  bilti_no?: string
  rate?: number
  remarks?: string
  items: GatePassItemInput[]
}

// Katai (Grading) Types

export interface Katai {
  id: string
  katai_no: string
  katai_date: string
  party: string
  party_name: string
  amad: string
  amad_no: string
  bags_graded: number
  mota_bags: number
  chatta_bags: number
  beej_bags: number
  mix_bags: number
  gulla_bags: number
  charge_per_bag: number
  total_charges: number
  labor_name: string | null
  remarks: string | null
  ledger_entry: string | null
  created_at: string
  updated_at: string
}

export interface KataiCreateRequest {
  katai_date: string
  party_id: string
  amad_id: string
  bags_graded: number
  mota_bags?: number
  chatta_bags?: number
  beej_bags?: number
  mix_bags?: number
  gulla_bags?: number
  charge_per_bag?: number
  labor_name?: string
  remarks?: string
}

// Statistics Types

export interface TradingStats {
  open_deals_count: number
  open_deals_value: number
  dispatched_today_bags: number
  dispatched_today_gps: number
  pending_delivery_value: number
  pending_delivery_count: number
  grading_done_bags: number
}

// Available Amad (for gate pass creation)

export interface AvailableAmad {
  id: string
  amad_no: string
  date: string
  party: string
  party_name: string
  commodity: string
  commodity_name: string
  pkt1: number
  pkt2: number
  pkt3: number
  total_packets: number
  total_weight: number
  remaining_packets: number
  remaining_weight: number
  is_fully_dispatched: boolean
}
