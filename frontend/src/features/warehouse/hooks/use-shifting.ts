import * as React from "react"
import { shiftingService, type ShiftFilters } from "../api/shifting"
import type {
  ShiftHeader,
  ShiftHeaderDetail,
  CreateShiftHeaderRequest,
} from "../types/shifting"

export function useShiftHeaders(filters?: ShiftFilters) {
  const [headers, setHeaders] = React.useState<ShiftHeader[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchHeaders = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await shiftingService.getShiftHeaders(filters)
      setHeaders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch shift headers")
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.from_room_id, filters?.to_room_id, filters?.from_date, filters?.to_date])

  React.useEffect(() => {
    fetchHeaders()
  }, [fetchHeaders])

  return { headers, loading, error, refetch: fetchHeaders }
}

export function useShiftHeaderDetail(id: string | null) {
  const [header, setHeader] = React.useState<ShiftHeaderDetail | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchHeader = React.useCallback(async () => {
    if (!id) {
      setHeader(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await shiftingService.getShiftHeader(id)
      setHeader(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch shift header")
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    fetchHeader()
  }, [fetchHeader])

  return { header, loading, error, refetch: fetchHeader }
}

export function useCreateShiftHeader() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const createShiftHeader = React.useCallback(
    async (data: CreateShiftHeaderRequest): Promise<ShiftHeaderDetail | null> => {
      try {
        setLoading(true)
        setError(null)
        const result = await shiftingService.createShiftHeader(data)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create shift header"
        setError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { createShiftHeader, loading, error }
}
