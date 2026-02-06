// System module types

// ============== Company Settings Types ==============

export interface CompanySettings {
  name: string
  name_hindi: string
  address: string
  city: string
  state: string
  phone: string
  email: string
  gst_no: string
  logo_url: string
  pan: string
  tan: string
  cin: string
  owner_name: string
  owner_aadhar: string
  upi_id: string
  fax: string
}

export interface TaxSettings {
  default_cgst: number
  default_sgst: number
  default_igst: number
}

export interface BankSettings {
  bank_name: string
  account_no: string
  ifsc_code: string
  branch: string
}

export interface FinancialYearSettings {
  financial_year_start: number
  current_year: string
  from_date: string | null
  to_date: string | null
}

// ============== User Management Types ==============

export type UserRole = "ADMIN" | "OPERATOR"

export type MembershipStatus = "PENDING" | "ACTIVE" | "SUSPENDED"

export interface User {
  id: string
  email: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  last_login_at: string | null
  created_at: string
}

export interface OrganizationUser {
  id: string
  user: User
  role: UserRole
  role_display: string
  status: MembershipStatus
  status_display: string
  is_default: boolean
  permissions: UserPermissions
  loan_per_bag_limit: number | null
  backdate_entry_limit: number | null
  joined_at: string | null
  created_at: string
}

export interface UserPermissions {
  // Basic permissions
  add?: boolean
  modify?: boolean
  delete?: boolean
  print?: boolean
  change_settings?: boolean

  // Module access
  inventory?: boolean
  accounts?: boolean
  billing?: boolean
  trading?: boolean
  bardana?: boolean
  loans?: boolean
  payroll?: boolean
  reports?: boolean
  system?: boolean

  // Special permissions
  backdate_entry?: boolean
  approve_loans?: boolean
  year_end_close?: boolean
  user_management?: boolean
  multi_room?: boolean
}

export interface CreateUserRequest {
  email: string
  full_name: string
  password: string
  phone?: string
  role: UserRole
  permissions?: UserPermissions
  loan_per_bag_limit?: number | null
  backdate_entry_limit?: number | null
}

export interface UpdateUserRequest {
  full_name?: string
  phone?: string
  role?: UserRole
  status?: MembershipStatus
  permissions?: UserPermissions
  loan_per_bag_limit?: number | null
  backdate_entry_limit?: number | null
  is_active?: boolean
}

// ============== Configuration Types ==============

export interface GeneralConfig {
  software_mode: "S" | "A"
  multi_chamber: boolean
  partial_lot: boolean
  map_required: boolean
  separate_voucher_numbers: boolean
  marka_on: "L" | "P"
  rack_quantity: number
}

export interface RentConfig {
  rent_on: "Q" | "P" | "W"
  rent_through: "L" | "B"
  rent_days: number
}

export interface InterestConfig {
  interest_rate: number
  days_in_year: number
  calculate_interest: boolean
  interest_on_rent: boolean
  interest_on_loan: boolean
  interest_on_bardana: boolean
}

export interface PacketsConfig {
  pkt1_name: string
  pkt1_weight: number
  pkt2_name: string
  pkt2_weight: number
  pkt3_name: string
  pkt3_weight: number
  mix_packets: boolean
}

export interface ChargesConfig {
  katai1: number
  katai2: number
  katai3: number
  load1: number
  load2: number
  load3: number
  unload1: number
  unload2: number
  unload3: number
  reload1: number
  reload2: number
  reload3: number
}

export type ConfigType = "general" | "rent" | "interest" | "packets" | "charges"

// ============== Audit Log Types ==============

export type ActionType =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "VIEW"
  | "PRINT"
  | "EXPORT"

export interface ActivityLog {
  id: string
  user: string | null
  user_email: string | null
  user_name: string | null
  action_type: ActionType
  action_type_display: string
  module: string
  entry_type: string
  entry_id: string
  details: Record<string, unknown>
  ip_address: string | null
  created_at: string
}

export interface ActivityLogFilters {
  user?: string
  action_type?: ActionType
  module?: string
  from_date?: string
  to_date?: string
  search?: string
}

// ============== Sequence Config Types ==============

export interface SequenceConfig {
  id: string
  key: string
  label: string
  prefix: string
  separator: string
  include_year: boolean
  padding: number
  next_preview: string
}

export interface UpdateSequenceConfigRequest {
  prefix?: string
  separator?: string
  include_year?: boolean
  padding?: number
}

export interface NextNumberPreview {
  next_number: string
  key: string
  year: number
}

// ============== Seed Data Types ==============

export interface SeedCategoryStatus {
  seeded: boolean
  total: number
  existing: number
}

export interface SeedDataStatus {
  chart_of_accounts: SeedCategoryStatus
  banks: SeedCategoryStatus
  bardana_types: SeedCategoryStatus
  commodities: SeedCategoryStatus
  all_seeded: boolean
}

export interface SeedCategoryResult {
  created: number
  updated: number
}

export interface SeedDataResult {
  chart_of_accounts: SeedCategoryResult
  banks: SeedCategoryResult
  bardana_types: SeedCategoryResult
  commodities: SeedCategoryResult
}

// ============== Dashboard Settings Types ==============

export interface DashboardSettings {
  show_summary_inward: boolean
  show_bag_grading: boolean
  show_pending_dues: boolean
  show_low_stock_alert: boolean
  show_chamber_occupancy: boolean
  show_recent_transactions: boolean
  show_todays_collections: boolean
  print_takpatti: boolean
  print_gate_pass: boolean
  print_receipt: boolean
  auto_print_rent_bill: boolean
  default_date_range: number
  auto_refresh_interval: number
  default_page_size: number
}
