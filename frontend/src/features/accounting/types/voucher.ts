export type VoucherType = "CR" | "DR" | "JV" | "CV" | "BH"

export type PaymentMode = "cash" | "cheque" | "bank" | "upi"

export interface VoucherLine {
  id?: string
  account_id: string
  account_name?: string
  debit: number | null
  credit: number | null
}

export interface ReceiptAllocationItem {
  head: "rent" | "loan" | "bardana" | "interest" | "other"
  outstanding: number
  allocate: number
  remaining: number
}

export interface PaymentDetails {
  mode: PaymentMode
  cheque_no?: string
  cheque_date?: string
  bank_name?: string
  upi_ref?: string
}

export interface Voucher {
  id: string
  voucher_no: string
  voucher_type: VoucherType
  date: string
  lines: VoucherLine[]
  narration?: string
  payment_details?: PaymentDetails
  receipt_allocation?: ReceiptAllocationItem[]
  total_debit: number
  total_credit: number
  created_at: string
  updated_at: string
}

export interface CreateVoucherRequest {
  voucher_type: VoucherType
  date: string
  lines: Omit<VoucherLine, "id" | "account_name">[]
  narration?: string
  payment_details?: PaymentDetails
  receipt_allocation?: Omit<ReceiptAllocationItem, "remaining">[]
}

export const VOUCHER_TYPE_LABELS: Record<VoucherType, string> = {
  CR: "Cash Receipt",
  DR: "Payment",
  JV: "Journal",
  CV: "Contra",
  BH: "Bhugtaan",
}

export const VOUCHER_TYPE_SHORTCUTS: Record<string, VoucherType> = {
  F4: "CR",
  F5: "DR",
  F6: "JV",
  F7: "CV",
  F8: "BH",
}
