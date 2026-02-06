export type AccountType = "asset" | "liability" | "income" | "expense" | "equity"

export type AccountCategory =
  | "balance_sheet"
  | "trading"
  | "profit_loss"

export type PartyType =
  | "KISAN"
  | "AARTI"
  | "STAFF"
  | "LOADING_CONTRACTOR"
  | "OTHERS"
  | "KISAN_D"
  | "CHATAI_CONTRACTOR"
  | "MANDI"
  | "FINANCER"
  | "GUARANTOR"

export type GuardianRelation = "S_O" | "F_O" | "W_O" | "D_O"

export type CalculateInterestOnBardana = "DEFAULT" | "YES" | "NO"

export const PARTY_TYPE_LABELS: Record<PartyType, string> = {
  KISAN: "Kisan",
  AARTI: "Aarti",
  STAFF: "Staff",
  LOADING_CONTRACTOR: "Loading Contractor",
  OTHERS: "Others",
  KISAN_D: "Kisan D",
  CHATAI_CONTRACTOR: "Chatai Contractor",
  MANDI: "Mandi",
  FINANCER: "Financer",
  GUARANTOR: "Guarantor",
}

export const GUARDIAN_RELATION_LABELS: Record<GuardianRelation, string> = {
  S_O: "S/O",
  F_O: "F/O",
  W_O: "W/O",
  D_O: "D/O",
}

export const INTEREST_ON_BARDANA_LABELS: Record<CalculateInterestOnBardana, string> = {
  DEFAULT: "Default",
  YES: "Yes",
  NO: "No",
}

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
  party_type?: PartyType
  guardian_name?: string
  guardian_relation?: GuardianRelation
  village_hindi?: string
  tin_number?: string
  guarantor_name?: string
  remark?: string
  charge_interest_from?: string
  depreciation_rate?: number
  dr_limit?: number
  sauda_limit?: number
  due_days?: number
  calculate_interest_on_bardana?: CalculateInterestOnBardana
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
  party_type?: PartyType
  guardian_name?: string
  guardian_relation?: GuardianRelation
  village_hindi?: string
  tin_number?: string
  guarantor_name?: string
  remark?: string
  charge_interest_from?: string
  depreciation_rate?: number
  dr_limit?: number
  sauda_limit?: number
  due_days?: number
  calculate_interest_on_bardana?: CalculateInterestOnBardana
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
