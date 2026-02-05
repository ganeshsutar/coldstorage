// Bardana module types

export type BardanaStatus = "DRAFT" | "CONFIRMED" | "CANCELLED"

export type BardanaCondition = "GOOD" | "FAIR" | "DAMAGED"

// Master entity
export interface BardanaType {
  id: string
  code: string
  name: string
  rate_per_unit: number
  opening_stock: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Issue entities
export interface BardanaIssueItem {
  id: string
  bardana_type: string
  bardana_type_code: string
  bardana_type_name: string
  qty: number
  rate: number
  amount: number
}

export interface BardanaIssueHeader {
  id: string
  organization: string
  voucher_no: string
  date: string
  party: string
  party_name: string
  total_qty: number
  total_amount: number
  remarks: string | null
  status: BardanaStatus
  status_display: string
  is_advance: boolean
  interest_rate_pm: number
  expected_arrival_date: string | null
  expected_bags: number | null
  reference_no: string | null
  confirmed_at: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  items?: BardanaIssueItem[]
  created_at: string
  updated_at: string
}

// Return entities
export interface BardanaReturnItem {
  id: string
  bardana_type: string
  bardana_type_code: string
  bardana_type_name: string
  qty: number
  rate: number
  amount: number
  condition: BardanaCondition
  condition_display: string
}

export interface BardanaReturnHeader {
  id: string
  organization: string
  voucher_no: string
  date: string
  party: string
  party_name: string
  total_qty: number
  total_amount: number
  remarks: string | null
  status: BardanaStatus
  status_display: string
  confirmed_at: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  items?: BardanaReturnItem[]
  created_at: string
  updated_at: string
}

// Stats types
export interface StockKpis {
  total_stock: number
  issued_today: number
  total_outstanding: number
  returns_pending: number
}

export interface StockTypeInfo {
  id: string
  code: string
  name: string
  rate_per_unit: number
  opening_stock: number
  total_issued: number
  total_returned: number
  current_stock: number
  outstanding: number
  issued_today: number
  returns_pending: number
}

export interface StockSummary {
  kpis: StockKpis
  types: StockTypeInfo[]
}

export interface PartyTypeOutstanding {
  bardana_type_id: string
  bardana_type_code: string
  bardana_type_name: string
  issued: number
  returned: number
  outstanding: number
  rate: number
  amount: number
}

export interface PartyOutstanding {
  party_id: string
  party_name: string
  total_issued: number
  total_returned: number
  total_outstanding: number
  types: PartyTypeOutstanding[]
}

// Request types
export interface BardanaIssueItemInput {
  bardana_type_id: string
  qty: number
  rate?: number
}

export interface BardanaIssueCreateRequest {
  date: string
  party_id: string
  remarks?: string
  is_advance?: boolean
  interest_rate_pm?: number
  expected_arrival_date?: string
  expected_bags?: number
  reference_no?: string
  items: BardanaIssueItemInput[]
}

export interface BardanaReturnItemInput {
  bardana_type_id: string
  qty: number
  rate?: number
  condition?: BardanaCondition
}

export interface BardanaReturnCreateRequest {
  date: string
  party_id: string
  remarks?: string
  items: BardanaReturnItemInput[]
}

// Filter types
export interface BardanaIssueFilters {
  status?: BardanaStatus
  party_id?: string
  from_date?: string
  to_date?: string
}

export interface BardanaReturnFilters {
  status?: BardanaStatus
  party_id?: string
  from_date?: string
  to_date?: string
}
