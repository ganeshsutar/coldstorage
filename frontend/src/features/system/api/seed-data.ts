import { apiClient } from "@/lib/api-client"
import type { SeedDataResult, SeedDataStatus } from "../types"

export const seedDataService = {
  getStatus(): Promise<SeedDataStatus> {
    return apiClient.get<SeedDataStatus>("/api/system/seed-data/")
  },

  seedAll(): Promise<SeedDataResult> {
    return apiClient.post<SeedDataResult>("/api/system/seed-data/", {})
  },
}
