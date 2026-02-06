import { apiClient } from "@/lib/api-client"
import type { PayPost, Allowance, Deduction, PayrollStats, DailyWage, DailyWageCreateRequest, DailyWageFilters } from "../types"

export const payPostService = {
  async getAll(): Promise<PayPost[]> {
    return apiClient.get<PayPost[]>("/api/payroll/pay-posts/")
  },

  async create(data: Partial<PayPost>): Promise<PayPost> {
    return apiClient.post<PayPost>("/api/payroll/pay-posts/", data)
  },

  async update(id: string, data: Partial<PayPost>): Promise<PayPost> {
    return apiClient.patch<PayPost>(`/api/payroll/pay-posts/${id}/`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/payroll/pay-posts/${id}/`)
  },
}

export const allowanceService = {
  async getAll(): Promise<Allowance[]> {
    return apiClient.get<Allowance[]>("/api/payroll/allowances/")
  },

  async create(data: Partial<Allowance>): Promise<Allowance> {
    return apiClient.post<Allowance>("/api/payroll/allowances/", data)
  },

  async update(id: string, data: Partial<Allowance>): Promise<Allowance> {
    return apiClient.patch<Allowance>(`/api/payroll/allowances/${id}/`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/payroll/allowances/${id}/`)
  },
}

export const deductionService = {
  async getAll(): Promise<Deduction[]> {
    return apiClient.get<Deduction[]>("/api/payroll/deductions/")
  },

  async create(data: Partial<Deduction>): Promise<Deduction> {
    return apiClient.post<Deduction>("/api/payroll/deductions/", data)
  },

  async update(id: string, data: Partial<Deduction>): Promise<Deduction> {
    return apiClient.patch<Deduction>(`/api/payroll/deductions/${id}/`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/payroll/deductions/${id}/`)
  },
}

export const payrollStatsService = {
  async getStats(): Promise<PayrollStats> {
    return apiClient.get<PayrollStats>("/api/payroll/daily-wages/stats/")
  },
}

export const dailyWageService = {
  async getAll(filters?: DailyWageFilters): Promise<DailyWage[]> {
    const params = new URLSearchParams()
    if (filters?.date) params.append("date", filters.date)
    if (filters?.from_date) params.append("from_date", filters.from_date)
    if (filters?.to_date) params.append("to_date", filters.to_date)

    let url = "/api/payroll/daily-wages/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<DailyWage[]>(url)
  },

  async create(data: DailyWageCreateRequest): Promise<DailyWage> {
    return apiClient.post<DailyWage>("/api/payroll/daily-wages/", data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/payroll/daily-wages/${id}/`)
  },
}
