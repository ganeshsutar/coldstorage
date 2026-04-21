import * as React from "react"
import { amadService, type AmadFilters } from "../api/amad"
import type {
  Amad,
  AmadSummary,
  StockSummary,
  PartyStock,
  CommodityStock,
  RoomStock,
  TodaySummary,
  DashboardData,
} from "../types/amad"

export function useAmads(filters?: AmadFilters) {
  const [amads, setAmads] = React.useState<AmadSummary[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchAmads = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await amadService.getAmads(filters)
      setAmads(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch amads")
    } finally {
      setLoading(false)
    }
  }, [filters])

  React.useEffect(() => {
    fetchAmads()
  }, [fetchAmads])

  return { amads, loading, error, refetch: fetchAmads }
}

export function useAmadDetail(id: string | null) {
  const [amad, setAmad] = React.useState<Amad | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchAmad = React.useCallback(async () => {
    if (!id) {
      setAmad(null)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await amadService.getAmad(id)
      setAmad(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch amad")
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    fetchAmad()
  }, [fetchAmad])

  return { amad, loading, error, refetch: fetchAmad }
}

export function useStockSummary() {
  const [summary, setSummary] = React.useState<StockSummary | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchSummary = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await amadService.getSummary()
      setSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stock summary")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return { summary, loading, error, refetch: fetchSummary }
}

export function usePartyStock(partyId: string | null) {
  const [stock, setStock] = React.useState<PartyStock | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchStock = React.useCallback(async () => {
    if (!partyId) {
      setStock(null)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await amadService.getPartyStock(partyId)
      setStock(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch party stock")
    } finally {
      setLoading(false)
    }
  }, [partyId])

  React.useEffect(() => {
    fetchStock()
  }, [fetchStock])

  return { stock, loading, error, refetch: fetchStock }
}

export function useDueForNikasi(days: number = 180) {
  const [amads, setAmads] = React.useState<AmadSummary[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchAmads = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await amadService.getDueForNikasi(days)
      setAmads(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch amads due for nikasi")
    } finally {
      setLoading(false)
    }
  }, [days])

  React.useEffect(() => {
    fetchAmads()
  }, [fetchAmads])

  return { amads, loading, error, refetch: fetchAmads }
}

export function useCommodityStock() {
  const [stock, setStock] = React.useState<CommodityStock[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchStock = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await amadService.getCommodityStock()
      setStock(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch commodity stock")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchStock()
  }, [fetchStock])

  return { stock, loading, error, refetch: fetchStock }
}

export function useRoomStock() {
  const [stock, setStock] = React.useState<RoomStock[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchStock = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await amadService.getRoomStock()
      setStock(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch room stock")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchStock()
  }, [fetchStock])

  return { stock, loading, error, refetch: fetchStock }
}

export function useTodaySummary(date?: string) {
  const [summary, setSummary] = React.useState<TodaySummary | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchSummary = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await amadService.getTodaySummary(date)
      setSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch today's summary")
    } finally {
      setLoading(false)
    }
  }, [date])

  React.useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return { summary, loading, error, refetch: fetchSummary }
}

export function useDashboard() {
  const [data, setData] = React.useState<DashboardData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchDashboard = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await amadService.getDashboard()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard data")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return { data, loading, error, refetch: fetchDashboard }
}
