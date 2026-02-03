import { apiClient } from "@/lib/api-client"
import type {
  ChargesConfig,
  ConfigType,
  GeneralConfig,
  InterestConfig,
  PacketsConfig,
  RentConfig,
} from "../types"

type ConfigMap = {
  general: GeneralConfig
  rent: RentConfig
  interest: InterestConfig
  packets: PacketsConfig
  charges: ChargesConfig
}

export const configService = {
  async getConfig<T extends ConfigType>(configType: T): Promise<ConfigMap[T]> {
    return apiClient.get<ConfigMap[T]>(`/api/system/config/${configType}/`)
  },

  async updateConfig<T extends ConfigType>(
    configType: T,
    data: Partial<ConfigMap[T]>
  ): Promise<ConfigMap[T]> {
    return apiClient.patch<ConfigMap[T]>(`/api/system/config/${configType}/`, data)
  },

  // Convenience methods for each config type
  async getGeneralConfig(): Promise<GeneralConfig> {
    return this.getConfig("general")
  },

  async updateGeneralConfig(data: Partial<GeneralConfig>): Promise<GeneralConfig> {
    return this.updateConfig("general", data)
  },

  async getRentConfig(): Promise<RentConfig> {
    return this.getConfig("rent")
  },

  async updateRentConfig(data: Partial<RentConfig>): Promise<RentConfig> {
    return this.updateConfig("rent", data)
  },

  async getInterestConfig(): Promise<InterestConfig> {
    return this.getConfig("interest")
  },

  async updateInterestConfig(data: Partial<InterestConfig>): Promise<InterestConfig> {
    return this.updateConfig("interest", data)
  },

  async getPacketsConfig(): Promise<PacketsConfig> {
    return this.getConfig("packets")
  },

  async updatePacketsConfig(data: Partial<PacketsConfig>): Promise<PacketsConfig> {
    return this.updateConfig("packets", data)
  },

  async getChargesConfig(): Promise<ChargesConfig> {
    return this.getConfig("charges")
  },

  async updateChargesConfig(data: Partial<ChargesConfig>): Promise<ChargesConfig> {
    return this.updateConfig("charges", data)
  },
}
