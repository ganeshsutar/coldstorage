// Loans module types

export type AdvanceStatus = "ACTIVE" | "ADJUSTED" | "CANCELLED"

export type LoanStatus = "ACTIVE" | "PARTIAL" | "REPAID" | "CANCELLED"

export type PaymentMode = "CASH" | "CHEQUE" | "BANK" | "UPI"

export type LoanLedgerType = "DR" | "CR"

// Advance (Pesgi) Types

export interface Advance {
  id: string
  advance_no: string
  date: string
  expected_date: string | null
  party: string
  party_name: string
  bags: number
  amount: number
  payment_mode: PaymentMode
  payment_mode_display: string
  cheque_number: string | null
  cheque_date: string | null
  bank_name: string | null
  upi_reference: string | null
  bardana_voucher: string | null
  narration: string | null
  status: AdvanceStatus
  status_display: string
  adjusted_amount: number
  balance_amount: number
  ledger_entry: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  created_at: string
  updated_at: string
}

export interface AdvanceCreateRequest {
  date: string
  expected_date?: string
  party_id: string
  bags?: number
  amount: number
  payment_mode?: PaymentMode
  cheque_number?: string
  cheque_date?: string
  bank_name?: string
  upi_reference?: string
  bardana_voucher?: string
  narration?: string
}

// Loan Against Goods (Karz) Types

export interface Loan {
  id: string
  loan_no: string
  date: string
  party: string
  party_name: string
  amad: string
  amad_no: string
  amount: number
  interest_rate: number
  payment_mode: PaymentMode
  payment_mode_display: string
  cheque_number: string | null
  cheque_date: string | null
  bank_name: string | null
  upi_reference: string | null
  narration: string | null
  status: LoanStatus
  status_display: string
  repaid_amount: number
  balance_amount: number
  accrued_interest: number
  ledger_entry: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  created_at: string
  updated_at: string
}

export interface LoanCreateRequest {
  date: string
  party_id: string
  amad_id: string
  amount: number
  interest_rate?: number
  payment_mode?: PaymentMode
  cheque_number?: string
  cheque_date?: string
  bank_name?: string
  upi_reference?: string
  narration?: string
}

export interface CollateralAmad {
  id: string
  amad_no: string
  date: string
  party: string
  party_name: string
  commodity: string
  commodity_name: string
  total_packets: number
  total_weight: number
  remaining_packets: number
  remaining_weight: number
  is_fully_dispatched: boolean
}

// Loan Ledger Types

export interface LoanLedgerEntry {
  id: string
  serial_number: number
  date: string
  entry_type: LoanLedgerType
  entry_type_display: string
  amount: number
  interest_rate: number
  running_balance: number
  amad_no: string | null
  narration: string | null
  reference_type: string | null
  reference_id: string | null
  created_at: string
}

export interface PartyLoanLedger {
  party_id: string
  party_name: string
  total_dr: number
  total_cr: number
  outstanding: number
  entries: LoanLedgerEntry[]
}

// Statistics Types

export interface LoanStats {
  active_advances_count: number
  active_advances_amount: number
  active_advances_balance: number
  active_loans_count: number
  active_loans_amount: number
  active_loans_balance: number
  total_interest_accrued: number
  overdue_advances_count: number
}

export interface InterestCalculationItem {
  loan_id: string
  loan_no: string
  party_id: string
  party_name: string
  amad_no: string
  principal: number
  interest_rate: number
  days: number
  interest: number
  from_date: string
  to_date: string
}
