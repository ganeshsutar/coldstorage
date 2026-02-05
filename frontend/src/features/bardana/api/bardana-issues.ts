import { apiClient } from "@/lib/api-client"
import type {
  BardanaIssueHeader,
  BardanaIssueCreateRequest,
  BardanaIssueFilters,
} from "../types"

export const bardanaIssueService = {
  async getAll(filters?: BardanaIssueFilters): Promise<BardanaIssueHeader[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.party_id) params.append("party_id", filters.party_id)
    if (filters?.from_date) params.append("from_date", filters.from_date)
    if (filters?.to_date) params.append("to_date", filters.to_date)

    let url = "/api/bardana/issues/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<BardanaIssueHeader[]>(url)
  },

  async get(id: string): Promise<BardanaIssueHeader> {
    return apiClient.get<BardanaIssueHeader>(`/api/bardana/issues/${id}/`)
  },

  async create(data: BardanaIssueCreateRequest): Promise<BardanaIssueHeader> {
    return apiClient.post<BardanaIssueHeader>("/api/bardana/issues/", data)
  },

  async confirm(id: string): Promise<BardanaIssueHeader> {
    return apiClient.post<BardanaIssueHeader>(`/api/bardana/issues/${id}/confirm/`, {})
  },

  async cancel(id: string, reason: string): Promise<BardanaIssueHeader> {
    return apiClient.post<BardanaIssueHeader>(`/api/bardana/issues/${id}/cancel/`, { reason })
  },
}
