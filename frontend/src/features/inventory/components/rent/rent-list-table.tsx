import { EyeIcon } from "lucide-react"

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
import type { RentSummary } from "../../types/rent"

interface RentListTableProps {
  rents: RentSummary[]
  loading?: boolean
  onView?: (rent: RentSummary) => void
}

function formatWeight(kg: number): string {
  return `${kg.toLocaleString("en-IN", { maximumFractionDigits: 2 })} kg`
}

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function RentListTable({
  rents,
  loading,
  onView,
}: RentListTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (rents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" data-testid="nikasi-list-empty">
        No dispatch entries found
      </div>
    )
  }

  return (
    <Table data-testid="nikasi-list-table">
      <TableHeader>
        <TableRow>
          <TableHead className="w-28">Serial No</TableHead>
          <TableHead className="w-24">Date</TableHead>
          <TableHead>Party</TableHead>
          <TableHead className="w-24">Amad No</TableHead>
          <TableHead>Commodity</TableHead>
          <TableHead className="text-right">Packets</TableHead>
          <TableHead className="text-right">Weight</TableHead>
          <TableHead className="text-right">Days</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-20">Type</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rents.map((rent, index) => (
          <TableRow key={rent.id} className="group" data-testid={`nikasi-row-${index}`}>
            <TableCell className="font-mono">{rent.serial_no}</TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(rent.date)}
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">{rent.party_name}</span>
                <span className="text-xs text-muted-foreground">
                  {rent.party_code}
                </span>
              </div>
            </TableCell>
            <TableCell className="font-mono text-muted-foreground">
              {rent.amad_no}
            </TableCell>
            <TableCell>{rent.commodity_name}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {rent.packets.toLocaleString("en-IN")}
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {formatWeight(rent.weight)}
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {rent.storage_days}
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums font-medium">
              {formatCurrency(rent.total_amount)}
            </TableCell>
            <TableCell>
              <Badge variant={rent.nikasi_type === "SEEDHI" ? "default" : "secondary"}>
                {rent.nikasi_type}
              </Badge>
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onView?.(rent)}
                className="opacity-0 group-hover:opacity-100"
                title="View details"
                data-testid={`nikasi-row-view-${index}`}
              >
                <EyeIcon className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
