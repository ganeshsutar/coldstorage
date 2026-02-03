// Masters module types

export interface GstRate {
  id: string
  code: string
  description: string
  cgst_rate: number
  sgst_rate: number
  igst_rate: number
  total_rate: number
  hsn_code: string | null
  is_default: boolean
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateGstRateRequest {
  code: string
  description: string
  cgst_rate: number
  sgst_rate: number
  igst_rate: number
  hsn_code?: string
  is_default?: boolean
  is_active?: boolean
}

export interface Bank {
  id: string
  code: string
  name: string
  ifsc_pattern: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateBankRequest {
  code: string
  name: string
  ifsc_pattern?: string
  is_active?: boolean
}

export type RateType = "LOADING" | "UNLOADING" | "KATAI" | "RELOAD" | "DUMP" | "DALA"

export type PacketType = "PKT1" | "PKT2" | "PKT3"

export interface LaborRate {
  id: string
  rate_type: RateType
  rate_type_display: string
  packet_type: PacketType | null
  packet_type_display: string | null
  rate: number
  effective_from: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateLaborRateRequest {
  rate_type: RateType
  packet_type?: PacketType
  rate: number
  effective_from: string
  is_active?: boolean
}

export interface CurrentLaborRates {
  [rateType: string]: {
    flat_rate: string | null
    by_packet: {
      [packetType: string]: string
    }
  }
}
