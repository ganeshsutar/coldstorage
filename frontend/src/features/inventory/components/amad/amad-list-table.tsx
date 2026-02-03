import { EyeIcon, TruckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import type { AmadSummary } from "../../types/amad"

interface AmadListTableProps {
  amads: AmadSummary[]
  loading?: boolean
  onView?: (amad: AmadSummary) => void
  onDispatch?: (amad: AmadSummary) => void
}

function formatWeight(kg: number): string {
  return `${kg.toLocaleString("en-IN", { maximumFractionDigits: 2 })} kg`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function AmadListTable({
  amads,
  loading,
  onView,
  onDispatch,
}: AmadListTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (amads.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No amad entries found
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-28">Amad No</TableHead>
          <TableHead className="w-24">Date</TableHead>
          <TableHead>Party</TableHead>
          <TableHead>Commodity</TableHead>
          <TableHead className="w-16">Room</TableHead>
          <TableHead className="text-right">Packets</TableHead>
          <TableHead className="text-right">Weight</TableHead>
          <TableHead className="text-right">Remaining</TableHead>
          <TableHead className="w-24">Status</TableHead>
          <TableHead className="w-20" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {amads.map((amad) => (
          <TableRow key={amad.id} className="group">
            <TableCell className="font-mono">{amad.amad_no}</TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(amad.date)}
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">{amad.party_name}</span>
                <span className="text-xs text-muted-foreground">
                  {amad.party_code}
                </span>
              </div>
            </TableCell>
            <TableCell>{amad.commodity_name}</TableCell>
            <TableCell className="text-center">
              {amad.room_number || "-"}
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {amad.total_packets.toLocaleString("en-IN")}
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {formatWeight(amad.total_weight)}
            </TableCell>
            <TableCell
              className={cn(
                "text-right font-mono tabular-nums",
                amad.remaining_packets === 0
                  ? "text-muted-foreground"
                  : amad.remaining_packets < amad.total_packets
                    ? "text-amber-600"
                    : ""
              )}
            >
              {amad.remaining_packets.toLocaleString("en-IN")} / {formatWeight(amad.remaining_weight)}
            </TableCell>
            <TableCell>
              {amad.is_fully_dispatched ? (
                <Badge variant="secondary">Completed</Badge>
              ) : (
                <Badge variant="default">Active</Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onView?.(amad)}
                  title="View details"
                >
                  <EyeIcon className="h-4 w-4" />
                </Button>
                {!amad.is_fully_dispatched && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDispatch?.(amad)}
                    title="Dispatch"
                  >
                    <TruckIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
