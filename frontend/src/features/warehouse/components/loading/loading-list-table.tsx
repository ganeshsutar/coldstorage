import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import type { Loading } from "../../types/loading"

interface LoadingListTableProps {
  loadings: Loading[]
  loading?: boolean
  onRowClick?: (loading: Loading) => void
}

export function LoadingListTable({
  loadings,
  loading: isLoading,
  onRowClick,
}: LoadingListTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (loadings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No loading records found
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
          <TableHead>Commodity</TableHead>
          <TableHead>Room</TableHead>
          <TableHead>Floor</TableHead>
          <TableHead>Rack</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loadings.map((item) => (
          <TableRow
            key={item.id}
            onClick={() => onRowClick?.(item)}
            className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
          >
            <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
            <TableCell className="font-medium">{item.amad_no}</TableCell>
            <TableCell>{item.party_name}</TableCell>
            <TableCell>{item.commodity_name}</TableCell>
            <TableCell>Room {item.room_number}</TableCell>
            <TableCell>Floor {item.floor_number}</TableCell>
            <TableCell>Rack {item.rack_number}</TableCell>
            <TableCell className="text-right font-mono">{item.quantity}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
