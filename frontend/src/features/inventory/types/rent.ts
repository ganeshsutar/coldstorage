// Rent/Nikasi (Goods Dispatch) types

export type NikasiType = "SEEDHI" | "KATAI"

export interface Rent {
  id: string
  serial_no: string
  date: string
  party: string
  party_code: string
  party_name: string
  receiver_name: string | null
  receiver_account: string | null
  receiver_name_from_account?: string | null
  amad: string
  amad_no: string
  amad_date?: string
  commodity_name: string
  packets: number
  weight: number
  storage_days: number
  rent_rate: number
  rent_amount: number
  gst_percent: number
  gst_amount: number
  total_amount: number
  nikasi_type: NikasiType
  vehicle_no: string | null
  narration: string | null
  ledger_entry: string | null
  created_at?: string
  updated_at?: string
}

export interface RentSummary {
  id: string
  serial_no: string
  date: string
  party: string
  party_code: string
  party_name: string
  amad: string
  amad_no: string
  commodity_name: string
  packets: number
  weight: number
  storage_days: number
  rent_amount: number
  gst_amount: number
  total_amount: number
  nikasi_type: NikasiType
}

export interface CreateRentRequest {
  date: string
  party: string
  receiver_name?: string
  receiver_account?: string
  amad: string
  packets: number
  weight: number
  storage_days?: number
  rent_rate?: number
  rent_amount?: number
  gst_percent?: number
  gst_amount?: number
  nikasi_type?: NikasiType
  vehicle_no?: string
  narration?: string
}

export interface RentCalculationRequest {
  amad_id: string
  dispatch_date: string
  packets: number
  weight: number
}

export interface RentCalculation {
  amad_no: string
  amad_date: string
  dispatch_date: string
  packets: number
  weight: number
  weight_quintals: number
  storage_days: number
  grace_days: number
  billable_days: number
  rent_rate: number
  rent_amount: number
  gst_percent: number
  gst_amount: number
  total_amount: number
}

export interface StockTransferRequest {
  amad_id: string
  to_party_id: string
  date: string
  packets: number
  weight: number
  narration?: string
}
