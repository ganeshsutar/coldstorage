import { apiClient } from "@/lib/api-client"
import type {
  Attendance,
  AttendanceCreateRequest,
  AttendanceFilters,
  SalaryProcessRequest,
} from "../types"

export const attendanceService = {
  async getAll(filters?: AttendanceFilters): Promise<Attendance[]> {
    const params = new URLSearchParams()
    if (filters?.month) params.append("month", String(filters.month))
    if (filters?.year) params.append("year", String(filters.year))
    if (filters?.status) params.append("status", filters.status)
    if (filters?.employee_id) params.append("employee_id", filters.employee_id)

    let url = "/api/payroll/attendance/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<Attendance[]>(url)
  },

  async get(id: string): Promise<Attendance> {
    return apiClient.get<Attendance>(`/api/payroll/attendance/${id}/`)
  },

  async create(data: AttendanceCreateRequest): Promise<Attendance> {
    return apiClient.post<Attendance>("/api/payroll/attendance/", data)
  },

  async processSalary(data: SalaryProcessRequest): Promise<Attendance[]> {
    return apiClient.post<Attendance[]>("/api/payroll/attendance/process-salary/", data)
  },

  async confirm(id: string): Promise<Attendance> {
    return apiClient.post<Attendance>(`/api/payroll/attendance/${id}/confirm/`, {})
  },

  async cancel(id: string, reason: string): Promise<Attendance> {
    return apiClient.post<Attendance>(`/api/payroll/attendance/${id}/cancel/`, { reason })
  },

  async getSalarySheet(month: number, year: number): Promise<Attendance[]> {
    return apiClient.get<Attendance[]>(
      `/api/payroll/attendance/salary-sheet/?month=${month}&year=${year}`
    )
  },
}
