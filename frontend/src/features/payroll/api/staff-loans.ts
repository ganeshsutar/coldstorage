import { apiClient } from "@/lib/api-client"
import type {
  StaffLoan,
  StaffLoanCreateRequest,
  StaffLoanFilters,
} from "../types"

export const staffLoanService = {
  async getAll(filters?: StaffLoanFilters): Promise<StaffLoan[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.employee_id) params.append("employee_id", filters.employee_id)

    let url = "/api/payroll/staff-loans/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<StaffLoan[]>(url)
  },

  async get(id: string): Promise<StaffLoan> {
    return apiClient.get<StaffLoan>(`/api/payroll/staff-loans/${id}/`)
  },

  async create(data: StaffLoanCreateRequest): Promise<StaffLoan> {
    return apiClient.post<StaffLoan>("/api/payroll/staff-loans/", data)
  },

  async cancel(id: string, reason: string): Promise<StaffLoan> {
    return apiClient.post<StaffLoan>(`/api/payroll/staff-loans/${id}/cancel/`, { reason })
  },
}
