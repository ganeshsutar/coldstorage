import { apiClient } from "@/lib/api-client"
import type { PayrollLedgerEntry, PayrollLedgerFilters } from "../types"

export const payrollLedgerService = {
  async getAll(filters?: PayrollLedgerFilters): Promise<PayrollLedgerEntry[]> {
    const params = new URLSearchParams()
    if (filters?.employee_id) params.append("employee_id", filters.employee_id)
    if (filters?.type) params.append("type", filters.type)
    if (filters?.from_date) params.append("from_date", filters.from_date)
    if (filters?.to_date) params.append("to_date", filters.to_date)

    let url = "/api/payroll/ledger/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<PayrollLedgerEntry[]>(url)
  },
}
