// Billing module types

export type BillStatus = "DRAFT" | "CONFIRMED" | "PARTIAL_PAID" | "PAID" | "CANCELLED"

export type GstType = "INTRA" | "INTER"

export type PaymentMode = "CASH" | "CHEQUE" | "BANK" | "UPI"

export type ChargeComponent =
  | "RENT"
  | "LOADING"
  | "UNLOADING"
  | "DALA"
  | "KATAI"
  | "INSURANCE"
  | "RELOAD"
  | "DUMP"
  | "OTHER"

// Rent Bill Types

export interface RentBillItem {
  id: string
  amad_no: string
  amad_date: string
  commodity_name: string
  total_packets: number
  weight_qtl: number
  storage_days: number
  grace_days: number
  billable_days: number
  rate_per_qtl: number
  rent_amount: number
}

export interface PriceBreakup {
  id: string
  component: ChargeComponent
  component_display: string
  hsn_code: string | null
  description: string | null
  rate: number
  quantity: number
  unit: string | null
  amount: number
}

export interface RentBillHeader {
  id: string
  bill_no: string
  bill_date: string
  party: string
  party_code: string
  party_name: string
  party_gstin: string | null
  party_state: string | null
  // Charges
  rent_amount: number
  loading_charges: number
  unloading_charges: number
  dala_charges: number
  katai_charges: number
  insurance_amount: number
  reload_charges: number
  dump_charges: number
  other_charges: number
  discount_amount: number
  // Computed
  taxable_amount: number
  // GST
  gst_rate: string | null
  gst_rate_info?: {
    id: string
    code: string
    description: string
    cgst_rate: number
    sgst_rate: number
    igst_rate: number
    total_rate: number
  }
  gst_type: GstType
  gst_type_display: string
  cgst_rate: number
  cgst_amount: number
  sgst_rate: number
  sgst_amount: number
  igst_rate: number
  igst_amount: number
  total_gst: number
  // TDS
  tds_rate: number
  tds_amount: number
  // Final
  total_amount: number
  round_off: number
  net_amount: number
  paid_amount: number
  balance_amount: number
  // Status
  status: BillStatus
  status_display: string
  // Audit
  confirmed_at: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  notes: string | null
  // Related
  items?: RentBillItem[]
  breakups?: PriceBreakup[]
  // Timestamps
  created_at: string
  updated_at: string
}

export interface RentBillItemInput {
  amad_id: string
  dispatch_date?: string
  grace_days?: number
  rate_per_qtl?: number
  rent_amount?: number
}

export interface RentBillCreateRequest {
  bill_date: string
  party_id: string
  gst_rate_id?: string
  gst_type?: GstType
  loading_charges?: number
  unloading_charges?: number
  dala_charges?: number
  katai_charges?: number
  insurance_amount?: number
  reload_charges?: number
  dump_charges?: number
  other_charges?: number
  discount_amount?: number
  tds_rate?: number
  items: RentBillItemInput[]
  notes?: string
}

// Billable Amad Types

export interface BillableAmad {
  id: string
  amad_no: string
  date: string
  party: string
  party_code: string
  party_name: string
  commodity: string
  commodity_name: string
  room: string | null
  room_number: string | null
  pkt1: number
  pkt2: number
  pkt3: number
  total_packets: number
  total_weight: number
  weight_qtl: number
  remaining_packets: number
  remaining_weight: number
  grace_days: number
  rent_rate: number
  is_fully_dispatched: boolean
  storage_days: number
  suggested_rent: number
}

// Receipt Types

export interface ReceiptAllocation {
  id: string
  rent_bill: string
  bill_no: string
  bill_date: string
  bill_amount: number
  allocated_amount: number
}

export interface Receipt {
  id: string
  receipt_no: string
  receipt_date: string
  party: string
  party_code: string
  party_name: string
  amount: number
  amount_in_words: string | null
  payment_mode: PaymentMode
  payment_mode_display: string
  // Cheque
  cheque_no: string | null
  cheque_date: string | null
  bank_name: string | null
  branch_name: string | null
  is_pdc: boolean
  is_cleared: boolean
  // Bank
  bank_ref_no: string | null
  upi_ref_no: string | null
  // Details
  narration: string | null
  status: BillStatus
  status_display: string
  // Audit
  confirmed_at: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  // Allocations
  allocations?: ReceiptAllocation[]
  // Timestamps
  created_at: string
  updated_at: string
}

export interface ReceiptAllocationInput {
  rent_bill_id: string
  allocated_amount: number
}

export interface ReceiptCreateRequest {
  receipt_date: string
  party_id: string
  amount: number
  payment_mode?: PaymentMode
  cheque_no?: string
  cheque_date?: string
  bank_name?: string
  branch_name?: string
  is_pdc?: boolean
  bank_ref_no?: string
  upi_ref_no?: string
  narration?: string
  allocations?: ReceiptAllocationInput[]
}

// Statistics Types

export interface BillingStats {
  bills_this_month: number
  bills_amount: number
  pending_amount: number
  collections_this_month: number
  gst_payable: number
}

export interface PartyOutstanding {
  party_id: string
  party_code: string
  party_name: string
  total_bills: number
  total_amount: number
  paid_amount: number
  outstanding_amount: number
  bills: RentBillHeader[]
}
