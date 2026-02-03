// Temperature types

export type TemperatureStatus = "NORMAL" | "WARNING" | "CRITICAL" | "OFFLINE"

export interface TemperatureThreshold {
  id: string
  organization: string
  room: string
  room_number: string
  room_name: string | null
  target_low: number
  target_high: number
  warning_deviation: number
  critical_deviation: number
  created_at: string
  updated_at: string
}

export interface CreateTemperatureThresholdRequest {
  room: string
  target_low: number
  target_high: number
  warning_deviation?: number
  critical_deviation?: number
}

export interface TemperatureReading {
  id: string
  room: string
  room_number: string
  floor_number: number | null
  reading_datetime: string
  low_temp: number
  high_temp: number
  status: TemperatureStatus
}

export interface TemperatureReadingDetail extends TemperatureReading {
  organization: string
  room_name: string | null
  created_by: string | null
  created_by_name: string | null
  created_at: string
}

export interface CreateTemperatureReadingRequest {
  room: string
  floor_number?: number
  reading_datetime: string
  low_temp: number
  high_temp: number
}

export interface TemperatureAlert {
  room_id: string
  room_number: string
  room_name: string | null
  status: TemperatureStatus
  latest_reading: TemperatureReading
  threshold: TemperatureThreshold | null
}

export interface LatestTemperature {
  room_id: string
  room_number: string
  room_name: string | null
  low_temp: number | null
  high_temp: number | null
  status: TemperatureStatus
  reading_datetime: string | null
}

export interface MeterReading {
  id: string
  room: string
  room_number: string
  date: string
  reading_value: number
  photo_url: string | null
  created_at: string
}

export interface MeterReadingDetail extends MeterReading {
  organization: string
  room_name: string | null
  notes: string | null
  created_by: string | null
  created_by_name: string | null
  updated_at: string
}

export interface CreateMeterReadingRequest {
  room: string
  date: string
  reading_value: number
  photo_url?: string
  notes?: string
}
