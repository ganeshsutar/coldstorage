import * as React from "react"
import { gstRateService } from "../api/gst-rates"
import type { GstRate } from "../types"

export function useGstRates(isActive?: boolean) {
  const [gstRates, setGstRates] = React.useState<GstRate[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchGstRates = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await gstRateService.getGstRates(isActive)
      setGstRates(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch GST rates")
    } finally {
      setLoading(false)
    }
  }, [isActive])

  React.useEffect(() => {
    fetchGstRates()
  }, [fetchGstRates])

  return { gstRates, loading, error, refetch: fetchGstRates }
}

export function useDefaultGstRate() {
  const [gstRate, setGstRate] = React.useState<GstRate | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchDefaultRate = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await gstRateService.getDefaultGstRate()
      setGstRate(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch default GST rate")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchDefaultRate()
  }, [fetchDefaultRate])

  return { gstRate, loading, error, refetch: fetchDefaultRate }
}
