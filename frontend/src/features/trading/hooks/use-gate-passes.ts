import * as React from "react"
import { gatePassService } from "../api/gate-passes"
import type { GatePassFilters } from "../api/gate-passes"
import type { GatePass } from "../types"

export function useGatePasses(filters?: GatePassFilters) {
  const [gatePasses, setGatePasses] = React.useState<GatePass[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const filtersKey = JSON.stringify(filters ?? null)

  const fetchGatePasses = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const parsed = JSON.parse(filtersKey)
      const data = await gatePassService.getGatePasses(parsed ?? undefined)
      setGatePasses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch gate passes")
    } finally {
      setLoading(false)
    }
  }, [filtersKey])

  React.useEffect(() => {
    fetchGatePasses()
  }, [fetchGatePasses])

  return { gatePasses, loading, error, refetch: fetchGatePasses }
}

export function useGatePassDetail(id: string | null) {
  const [gatePass, setGatePass] = React.useState<GatePass | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchGatePass = React.useCallback(async () => {
    if (!id) {
      setGatePass(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await gatePassService.getGatePass(id)
      setGatePass(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch gate pass")
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    fetchGatePass()
  }, [fetchGatePass])

  return { gatePass, loading, error, refetch: fetchGatePass }
}
