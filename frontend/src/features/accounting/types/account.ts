export type AccountType = "asset" | "liability" | "income" | "expense" | "equity"

export type AccountCategory =
  | "balance_sheet"
  | "trading"
  | "profit_loss"

export interface Account {
  id: string
  code: string
  name: string
  type: AccountType
  category: AccountCategory
  parent_id: string | null
  is_party: boolean
  is_group: boolean
  balance: number
  balance_type: "Dr" | "Cr"
  credit_limit?: number
  children?: Account[]
  created_at: string
  updated_at: string
}

export interface PartyAccount extends Account {
  is_party: true
  phone?: string
  address?: string
  village?: string
  credit_limit: number
  component_balances: ComponentBalances
}

export interface ComponentBalances {
  rent: number
  loan: number
  bardana: number
  interest: number
  other: number
}

export interface AccountTreeNode {
  id: string
  code: string
  name: string
  type: AccountType
  is_group: boolean
  is_party: boolean
  balance: number
  balance_type: "Dr" | "Cr"
  children: AccountTreeNode[]
}

export interface CreateAccountRequest {
  code: string
  name: string
  type: AccountType
  category: AccountCategory
  parent_id: string | null
  is_party: boolean
}

export interface CreatePartyRequest extends CreateAccountRequest {
  is_party: true
  phone?: string
  address?: string
  village?: string
  credit_limit?: number
}

export interface AccountSummary {
  total_debtors: number
  total_creditors: number
  todays_receipts: number
  pending_interest: number
}

export interface LedgerEntry {
  id: string
  date: string
  voucher_no: string
  voucher_type: string
  particulars: string
  debit: number | null
  credit: number | null
  balance: number
  balance_type: "Dr" | "Cr"
}
