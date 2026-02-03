import type { VoucherType } from "./voucher"

export interface DaybookSummary {
  date: string
  cash: {
    opening: number
    receipts: number
    payments: number
    closing: number
  }
  bank: {
    opening: number
    receipts: number
    payments: number
    closing: number
  }
  is_closed: boolean
}

export interface DaybookTransaction {
  id: string
  voucher_no: string
  voucher_type: VoucherType
  debit_account: string
  debit_account_id: string
  credit_account: string
  credit_account_id: string
  amount: number
  narration?: string
  time: string
}

export interface DaybookFilters {
  date: string
  type?: VoucherType | "all"
}

export type DaybookTab = "all" | "receipts" | "payments" | "journal"

export interface CloseDayRequest {
  date: string
  cash_closing: number
  bank_closing: number
}
