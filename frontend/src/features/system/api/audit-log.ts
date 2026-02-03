import { apiClient } from "@/lib/api-client"
import type { ActivityLog, ActivityLogFilters, DashboardSettings } from "../types"

export const auditLogService = {
  async getActivityLogs(filters?: ActivityLogFilters): Promise<ActivityLog[]> {
    const params = new URLSearchParams()

    if (filters?.user) params.append("user", filters.user)
    if (filters?.action_type) params.append("action_type", filters.action_type)
    if (filters?.module) params.append("module", filters.module)
    if (filters?.from_date) params.append("from_date", filters.from_date)
    if (filters?.to_date) params.append("to_date", filters.to_date)
    if (filters?.search) params.append("search", filters.search)

    let url = "/api/system/audit-log/"
    if (params.toString()) url += `?${params.toString()}`

    return apiClient.get<ActivityLog[]>(url)
  },

  async getActivityLog(id: string): Promise<ActivityLog> {
    return apiClient.get<ActivityLog>(`/api/system/audit-log/${id}/`)
  },
}

export const dashboardSettingsService = {
  async getDashboardSettings(): Promise<DashboardSettings> {
    return apiClient.get<DashboardSettings>("/api/system/dashboard/")
  },

  async updateDashboardSettings(
    data: Partial<DashboardSettings>
  ): Promise<DashboardSettings> {
    return apiClient.patch<DashboardSettings>("/api/system/dashboard/", data)
  },
}
