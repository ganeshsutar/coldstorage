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
import type { Unloading } from "../../types/unloading"

interface UnloadingListTableProps {
  unloadings: Unloading[]
  loading?: boolean
  onRowClick?: (unloading: Unloading) => void
}

const billTypeLabels: Record<string, string> = {
  RENT: "Rent Bill",
  TRANSFER: "Transfer",
  DAMAGE: "Damage",
  OTHER: "Other",
}

export function UnloadingListTable({
  unloadings,
  loading: isLoading,
  onRowClick,
}: UnloadingListTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (unloadings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No unloading records found
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Amad No</TableHead>
          <TableHead>Party</TableHead>
          <TableHead>Rent No</TableHead>
          <TableHead>Room</TableHead>
          <TableHead>Floor</TableHead>
          <TableHead>Rack</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead>Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {unloadings.map((item) => (
          <TableRow
            key={item.id}
            onClick={() => onRowClick?.(item)}
            className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
          >
            <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
            <TableCell className="font-medium">{item.amad_no}</TableCell>
            <TableCell>{item.party_name}</TableCell>
            <TableCell>{item.rent_serial_no ?? "-"}</TableCell>
            <TableCell>Room {item.room_number}</TableCell>
            <TableCell>Floor {item.floor_number}</TableCell>
            <TableCell>Rack {item.rack_number}</TableCell>
            <TableCell className="text-right font-mono">{item.quantity}</TableCell>
            <TableCell>
              <Badge variant="secondary">
                {billTypeLabels[item.bill_type] ?? item.bill_type}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
