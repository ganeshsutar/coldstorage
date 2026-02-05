import { ArrowRight } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import type { ShiftHeader } from "../../types/shifting"

interface ShiftingListTableProps {
  headers: ShiftHeader[]
  loading?: boolean
  onRowClick?: (header: ShiftHeader) => void
}

export function ShiftingListTable({
  headers,
  loading: isLoading,
  onRowClick,
}: ShiftingListTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (headers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No shifting records found
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Shift No</TableHead>
          <TableHead>From Room</TableHead>
          <TableHead></TableHead>
          <TableHead>To Room</TableHead>
          <TableHead className="text-right">Items</TableHead>
          <TableHead className="text-right">Total Qty</TableHead>
          <TableHead>Remarks</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {headers.map((header) => (
          <TableRow
            key={header.id}
            onClick={() => onRowClick?.(header)}
            className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
          >
            <TableCell>{new Date(header.date).toLocaleDateString()}</TableCell>
            <TableCell className="font-medium">{header.shift_no}</TableCell>
            <TableCell>Room {header.from_room_number}</TableCell>
            <TableCell>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </TableCell>
            <TableCell>Room {header.to_room_number}</TableCell>
            <TableCell className="text-right">{header.item_count}</TableCell>
            <TableCell className="text-right font-mono">{header.total_quantity}</TableCell>
            <TableCell className="max-w-[200px] truncate">
              {header.remarks ?? "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
