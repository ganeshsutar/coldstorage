import * as React from "react"
import {
  temperatureThresholdService,
  temperatureReadingService,
  meterReadingService,
  type TemperatureReadingFilters,
} from "../api/temperature"
import type {
  TemperatureThreshold,
  TemperatureReading,
  TemperatureAlert,
  LatestTemperature,
  MeterReading,
} from "../types/temperature"

// Temperature Threshold Hooks
export function useTemperatureThresholds(roomId?: string) {
  const [thresholds, setThresholds] = React.useState<TemperatureThreshold[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchThresholds = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await temperatureThresholdService.getThresholds(roomId)
      setThresholds(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch temperature thresholds")
    } finally {
      setLoading(false)
    }
  }, [roomId])

  React.useEffect(() => {
    fetchThresholds()
  }, [fetchThresholds])

  return { thresholds, loading, error, refetch: fetchThresholds }
}

// Temperature Reading Hooks
export function useTemperatureReadings(filters?: TemperatureReadingFilters) {
  const [readings, setReadings] = React.useState<TemperatureReading[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchReadings = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await temperatureReadingService.getReadings(filters)
      setReadings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch temperature readings")
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.room_id, filters?.status, filters?.from_date, filters?.to_date])

  React.useEffect(() => {
    fetchReadings()
  }, [fetchReadings])

  return { readings, loading, error, refetch: fetchReadings }
}

export function useTemperatureAlerts() {
  const [alerts, setAlerts] = React.useState<TemperatureAlert[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchAlerts = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await temperatureReadingService.getAlerts()
      setAlerts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch temperature alerts")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  return { alerts, loading, error, refetch: fetchAlerts }
}

export function useRoomTemperatureHistory(roomId: string | null, days?: number) {
  const [readings, setReadings] = React.useState<TemperatureReading[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchHistory = React.useCallback(async () => {
    if (!roomId) {
      setReadings([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await temperatureReadingService.getRoomHistory(roomId, days)
      setReadings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch temperature history")
    } finally {
      setLoading(false)
    }
  }, [roomId, days])

  React.useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { readings, loading, error, refetch: fetchHistory }
}

export function useLatestTemperatures() {
  const [temperatures, setTemperatures] = React.useState<LatestTemperature[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchTemperatures = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await temperatureReadingService.getLatestByRoom()
      setTemperatures(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch latest temperatures")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchTemperatures()
  }, [fetchTemperatures])

  return { temperatures, loading, error, refetch: fetchTemperatures }
}

// Meter Reading Hooks
export function useMeterReadings(filters?: {
  room_id?: string
  from_date?: string
  to_date?: string
}) {
  const [readings, setReadings] = React.useState<MeterReading[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchReadings = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await meterReadingService.getReadings(filters)
      setReadings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch meter readings")
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.room_id, filters?.from_date, filters?.to_date])

  React.useEffect(() => {
    fetchReadings()
  }, [fetchReadings])

  return { readings, loading, error, refetch: fetchReadings }
}

export function useRoomMeterHistory(roomId: string | null) {
  const [readings, setReadings] = React.useState<MeterReading[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchHistory = React.useCallback(async () => {
    if (!roomId) {
      setReadings([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await meterReadingService.getRoomHistory(roomId)
      setReadings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch meter reading history")
    } finally {
      setLoading(false)
    }
  }, [roomId])

  React.useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { readings, loading, error, refetch: fetchHistory }
}
