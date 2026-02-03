import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { TemperatureReading } from "../../types/temperature"

interface TemperatureLogTableProps {
  readings: TemperatureReading[]
  loading?: boolean
}

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  NORMAL: "secondary",
  WARNING: "outline",
  CRITICAL: "destructive",
}

export function TemperatureLogTable({ readings, loading }: TemperatureLogTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (readings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No temperature readings found
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date/Time</TableHead>
          <TableHead>Room</TableHead>
          <TableHead>Floor</TableHead>
          <TableHead>Low Temp</TableHead>
          <TableHead>High Temp</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {readings.map((reading) => (
          <TableRow key={reading.id}>
            <TableCell>
              {new Date(reading.reading_datetime).toLocaleString()}
            </TableCell>
            <TableCell>Room {reading.room_number}</TableCell>
            <TableCell>
              {reading.floor_number ? `Floor ${reading.floor_number}` : "All"}
            </TableCell>
            <TableCell className="font-mono">{reading.low_temp}°C</TableCell>
            <TableCell className="font-mono">{reading.high_temp}°C</TableCell>
            <TableCell>
              <Badge variant={statusVariants[reading.status] ?? "default"}>
                {reading.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
