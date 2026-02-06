import { apiClient } from "@/lib/api-client"
import type {
  Employee,
  EmployeeCreateRequest,
  EmployeeFilters,
} from "../types"

export const employeeService = {
  async getAll(filters?: EmployeeFilters): Promise<Employee[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.department) params.append("department", filters.department)
    if (filters?.search) params.append("search", filters.search)

    let url = "/api/payroll/employees/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<Employee[]>(url)
  },

  async get(id: string): Promise<Employee> {
    return apiClient.get<Employee>(`/api/payroll/employees/${id}/`)
  },

  async create(data: EmployeeCreateRequest): Promise<Employee> {
    return apiClient.post<Employee>("/api/payroll/employees/", data)
  },

  async update(id: string, data: Partial<EmployeeCreateRequest>): Promise<Employee> {
    return apiClient.patch<Employee>(`/api/payroll/employees/${id}/`, data)
  },
}
