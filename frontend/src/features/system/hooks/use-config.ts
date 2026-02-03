import * as React from "react"
import { configService } from "../api/config"
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

export function useConfig<T extends ConfigType>(configType: T) {
  const [config, setConfig] = React.useState<ConfigMap[T] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchConfig = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await configService.getConfig(configType)
      setConfig(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to fetch ${configType} configuration`
      )
    } finally {
      setLoading(false)
    }
  }, [configType])

  React.useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const updateConfig = React.useCallback(
    async (data: Partial<ConfigMap[T]>) => {
      try {
        setError(null)
        const updated = await configService.updateConfig(configType, data)
        setConfig(updated)
        return updated
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : `Failed to update ${configType} configuration`
        setError(message)
        throw err
      }
    },
    [configType]
  )

  return { config, loading, error, refetch: fetchConfig, updateConfig }
}

export function useGeneralConfig() {
  return useConfig("general")
}

export function useRentConfig() {
  return useConfig("rent")
}

export function useInterestConfig() {
  return useConfig("interest")
}

export function usePacketsConfig() {
  return useConfig("packets")
}

export function useChargesConfig() {
  return useConfig("charges")
}
