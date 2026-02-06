// Payroll module types

export type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "INACTIVE" | "PROBATION"

export type AttendanceStatus = "DRAFT" | "PROCESSED" | "CONFIRMED" | "CANCELLED"

export type StaffLoanStatus = "ACTIVE" | "REPAID" | "CANCELLED"

export type PayrollTransactionType = "SAL" | "ADV" | "LOAN" | "EMI"

export type ComponentType = "FIXED" | "PERCENTAGE"

// Master entities
export interface PayPost {
  id: string
  post_no: string
  post_name: string
  basic_salary: number
  cl_entitlement: number
  el_entitlement: number
  ml_entitlement: number
  metl_entitlement: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Allowance {
  id: string
  code: string
  name: string
  component_type: ComponentType
  component_type_display: string
  value: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Deduction {
  id: string
  code: string
  name: string
  component_type: ComponentType
  component_type_display: string
  value: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Employee entities
export interface EmployeeAllowance {
  id: string
  allowance: string
  allowance_code: string
  allowance_name: string
  component_type: ComponentType
  value: number
}

export interface EmployeeDeduction {
  id: string
  deduction: string
  deduction_code: string
  deduction_name: string
  component_type: ComponentType
  value: number
}

export interface Employee {
  id: string
  employee_code: string
  name: string
  designation: string | null
  department: string | null
  phone: string | null
  address: string | null
  aadhaar: string | null
  pan_number: string | null
  bank_name: string | null
  bank_account_no: string | null
  bank_ifsc: string | null
  bank_branch: string | null
  uan: string | null
  pf_applicable: boolean
  esi_applicable: boolean
  pay_post: string | null
  pay_post_name: string | null
  joining_date: string | null
  basic_salary: number
  status: EmployeeStatus
  status_display: string
  allowances?: EmployeeAllowance[]
  deductions?: EmployeeDeduction[]
  created_at: string
  updated_at: string
}

// Attendance entities
export interface AttendanceAllowance {
  id: string
  allowance: string | null
  name: string
  amount: number
}

export interface AttendanceDeduction {
  id: string
  deduction: string | null
  name: string
  amount: number
}

export interface Attendance {
  id: string
  organization: string
  employee: string
  employee_name: string
  month: number
  year: number
  month_days: number
  present_days: number
  lwp: number
  cl: number
  ml: number
  el: number
  metl: number
  basic_salary: number
  gross_salary: number
  total_allowances: number
  total_deductions: number
  pf_employee: number
  pf_employer: number
  esi_employee: number
  esi_employer: number
  loan_emi: number
  net_salary: number
  status: AttendanceStatus
  status_display: string
  confirmed_at: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  allowance_items?: AttendanceAllowance[]
  deduction_items?: AttendanceDeduction[]
  created_at: string
  updated_at: string
}

// Staff Loan entities
export interface StaffLoan {
  id: string
  organization: string
  loan_no: string
  employee: string
  employee_name: string
  loan_date: string
  loan_amount: number
  emi: number
  repaid_amount: number
  balance: number
  remarks: string | null
  status: StaffLoanStatus
  status_display: string
  confirmed_at: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  created_at: string
  updated_at: string
}

// Payroll Ledger
export interface PayrollLedgerEntry {
  id: string
  employee: string
  employee_name: string
  serial_number: number
  transaction_date: string
  transaction_type: PayrollTransactionType
  transaction_type_display: string
  debit: number
  credit: number
  running_balance: number
  reference_id: string | null
  remarks: string | null
  created_at: string
}

// Daily Wage
export interface DailyWage {
  id: string
  date: string
  worker_name: string
  work_type: string | null
  hours: number
  rate: number
  amount: number
  remarks: string | null
}

// Stats
export interface PayrollStats {
  total_employees: number
  active_employees: number
  salary_payable: number
  loan_outstanding: number
}

// Request types
export interface EmployeeAllowanceInput {
  allowance_id: string
  value: number
}

export interface EmployeeDeductionInput {
  deduction_id: string
  value: number
}

export interface EmployeeCreateRequest {
  name: string
  designation?: string
  department?: string
  phone?: string
  address?: string
  aadhaar?: string
  pan_number?: string
  bank_name?: string
  bank_account_no?: string
  bank_ifsc?: string
  bank_branch?: string
  uan?: string
  pf_applicable?: boolean
  esi_applicable?: boolean
  pay_post_id?: string | null
  joining_date?: string
  basic_salary?: number
  status?: EmployeeStatus
  allowances?: EmployeeAllowanceInput[]
  deductions?: EmployeeDeductionInput[]
}

export interface AttendanceCreateRequest {
  employee_id: string
  month: number
  year: number
  month_days: number
  present_days: number
  lwp?: number
  cl?: number
  ml?: number
  el?: number
  metl?: number
}

export interface SalaryProcessRequest {
  month: number
  year: number
}

export interface StaffLoanCreateRequest {
  employee_id: string
  loan_date: string
  loan_amount: number
  emi: number
  remarks?: string
}

export interface DailyWageCreateRequest {
  date: string
  worker_name: string
  work_type?: string
  hours: number
  rate: number
  remarks?: string
}

// Filter types
export interface EmployeeFilters {
  status?: EmployeeStatus
  department?: string
  search?: string
}

export interface AttendanceFilters {
  month?: number
  year?: number
  status?: AttendanceStatus
  employee_id?: string
}

export interface StaffLoanFilters {
  status?: StaffLoanStatus
  employee_id?: string
}

export interface PayrollLedgerFilters {
  employee_id?: string
  type?: PayrollTransactionType
  from_date?: string
  to_date?: string
}

export interface DailyWageFilters {
  date?: string
  from_date?: string
  to_date?: string
}
