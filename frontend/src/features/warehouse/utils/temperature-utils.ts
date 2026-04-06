import type { TemperatureReading } from "../types/temperature"

export type TemperatureTrend = "rising" | "falling" | "stable" | "unknown"

/**
 * Analyzes temperature readings to determine the trend direction.
 * Requires at least 2 readings to calculate a trend.
 *
 * @param readings - Array of temperature readings, should be sorted by date (oldest first)
 * @param thresholdDegrees - Minimum change to consider as rising/falling (default: 0.5°C)
 */
export function getTemperatureTrend(
  readings: TemperatureReading[],
  thresholdDegrees: number = 0.5
): TemperatureTrend {
  if (readings.length < 2) return "unknown"

  // Get recent readings (last 5 or all if fewer)
  const recentReadings = readings.slice(-5)

  // Calculate average temperature for each reading
  const avgTemps = recentReadings.map((r) => (r.low_temp + r.high_temp) / 2)

  // Compare first and last average temperatures
  const firstAvg = avgTemps[0]
  const lastAvg = avgTemps[avgTemps.length - 1]
  const diff = lastAvg - firstAvg

  if (Math.abs(diff) < thresholdDegrees) {
    return "stable"
  }
  return diff > 0 ? "rising" : "falling"
}

export interface DailyStats {
  date: string
  minTemp: number
  maxTemp: number
  avgTemp: number
}

/**
 * Aggregates temperature readings into daily statistics.
 *
 * @param readings - Array of temperature readings
 * @returns Array of daily stats objects sorted by date ascending
 */
export function getDailyStats(readings: TemperatureReading[]): DailyStats[] {
  if (readings.length === 0) return []

  // Group readings by date
  const byDate = new Map<string, TemperatureReading[]>()

  for (const reading of readings) {
    const date = reading.reading_datetime.split("T")[0]
    if (!byDate.has(date)) {
      byDate.set(date, [])
    }
    byDate.get(date)?.push(reading)
  }

  // Calculate stats for each date
  const stats: DailyStats[] = []

  for (const [date, dayReadings] of byDate) {
    let minTemp = Infinity
    let maxTemp = -Infinity
    let sumTemp = 0
    let count = 0

    for (const reading of dayReadings) {
      minTemp = Math.min(minTemp, reading.low_temp)
      maxTemp = Math.max(maxTemp, reading.high_temp)
      sumTemp += (reading.low_temp + reading.high_temp) / 2
      count++
    }

    stats.push({
      date,
      minTemp,
      maxTemp,
      avgTemp: count > 0 ? sumTemp / count : 0,
    })
  }

  // Sort by date ascending
  stats.sort((a, b) => a.date.localeCompare(b.date))

  return stats
}

/**
 * Formats a temperature value for display.
 *
 * @param value - Temperature value in Celsius, or null
 * @param precision - Number of decimal places (default: 1)
 */
export function formatTemperature(
  value: number | null,
  precision: number = 1
): string {
  if (value === null || value === undefined) return "--"
  return `${value.toFixed(precision)}°C`
}

/**
 * Gets the appropriate color class for a temperature trend.
 */
export function getTrendColorClass(trend: TemperatureTrend): string {
  switch (trend) {
    case "rising":
      return "text-status-danger-foreground"
    case "falling":
      return "text-status-info-foreground"
    case "stable":
      return "text-status-success-foreground"
    default:
      return "text-muted-foreground"
  }
}

/**
 * Gets the trend arrow/icon character.
 */
export function getTrendIcon(trend: TemperatureTrend): string {
  switch (trend) {
    case "rising":
      return "↑"
    case "falling":
      return "↓"
    case "stable":
      return "→"
    default:
      return "-"
  }
}
