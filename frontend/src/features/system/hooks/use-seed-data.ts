import * as React from "react"
import { seedDataService } from "../api/seed-data"
import type { SeedDataResult, SeedDataStatus } from "../types"

export function useSeedData() {
  const [status, setStatus] = React.useState<SeedDataStatus | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [seeding, setSeeding] = React.useState(false)
  const [result, setResult] = React.useState<SeedDataResult | null>(null)

  const fetchStatus = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await seedDataService.getStatus()
      setStatus(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch seed data status"
      )
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const seedAll = React.useCallback(async () => {
    try {
      setSeeding(true)
      setError(null)
      setResult(null)
      const data = await seedDataService.seedAll()
      setResult(data)
      // Refresh status after seeding
      await fetchStatus()
      return data
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to seed data"
      setError(message)
      throw err
    } finally {
      setSeeding(false)
    }
  }, [fetchStatus])

  return { status, loading, error, seeding, result, seedAll, refetch: fetchStatus }
}
