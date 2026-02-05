import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatIndianRupees } from "../../utils/amount-to-words"
import type { BillableAmad } from "../../types"

interface AmadSelectionTableProps {
  amads: BillableAmad[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  loading?: boolean
}

export function AmadSelectionTable({
  amads,
  selectedIds,
  onSelectionChange,
  loading = false,
}: AmadSelectionTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select amads that are fully dispatched
      const dispatchedIds = amads
        .filter((a) => a.is_fully_dispatched)
        .map((a) => a.id)
      onSelectionChange(dispatchedIds)
    } else {
      onSelectionChange([])
    }
  }

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id])
    } else {
      onSelectionChange(selectedIds.filter((sid) => sid !== id))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    })
  }

  // Calculate totals for selected items
  const selectedAmads = amads.filter((a) => selectedIds.includes(a.id))
  const totalBags = selectedAmads.reduce((sum, a) => sum + a.total_packets, 0)
  const totalWeight = selectedAmads.reduce((sum, a) => sum + a.weight_qtl, 0)
  const estimatedRent = selectedAmads.reduce(
    (sum, a) => sum + a.suggested_rent,
    0
  )

  const dispatchedAmads = amads.filter((a) => a.is_fully_dispatched)
  const allDispatchedSelected = dispatchedAmads.length > 0 &&
    dispatchedAmads.every((a) => selectedIds.includes(a.id))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        Loading billable amads...
      </div>
    )
  }

  if (amads.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        No billable amads found for this party.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allDispatchedSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all dispatched"
                />
              </TableHead>
              <TableHead>Amad#</TableHead>
              <TableHead>Arrival</TableHead>
              <TableHead>Commodity</TableHead>
              <TableHead className="text-right">Bags</TableHead>
              <TableHead className="text-right">Wt (Qtl)</TableHead>
              <TableHead className="text-right">Days</TableHead>
              <TableHead className="text-right">Est. Rent</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {amads.map((amad) => (
              <TableRow
                key={amad.id}
                className={
                  selectedIds.includes(amad.id)
                    ? "bg-muted/50"
                    : ""
                }
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(amad.id)}
                    onCheckedChange={(checked) =>
                      handleSelect(amad.id, checked as boolean)
                    }
                    disabled={!amad.is_fully_dispatched}
                    aria-label={`Select amad ${amad.amad_no}`}
                  />
                </TableCell>
                <TableCell className="font-mono font-medium">
                  {amad.amad_no}
                </TableCell>
                <TableCell>{formatDate(amad.date)}</TableCell>
                <TableCell>{amad.commodity_name}</TableCell>
                <TableCell className="text-right font-mono">
                  {amad.total_packets}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {amad.weight_qtl.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {amad.is_fully_dispatched ? amad.storage_days : "--"}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {amad.is_fully_dispatched
                    ? formatIndianRupees(amad.suggested_rent)
                    : "--"}
                </TableCell>
                <TableCell>
                  {amad.is_fully_dispatched ? (
                    <Badge variant="default">Dispatched</Badge>
                  ) : (
                    <Badge variant="secondary">In Stock</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {selectedIds.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="font-medium">
                  Selected: {selectedIds.length} Amads
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {totalBags}
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {totalWeight.toFixed(2)}
                </TableCell>
                <TableCell />
                <TableCell className="text-right font-mono font-medium">
                  {formatIndianRupees(estimatedRent)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-6 text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
          <span>
            Selected:{" "}
            <span className="font-medium text-foreground">
              {selectedIds.length} Amads
            </span>
          </span>
          <span>
            Total Bags:{" "}
            <span className="font-medium text-foreground">{totalBags}</span>
          </span>
          <span>
            Total Weight:{" "}
            <span className="font-medium text-foreground">
              {totalWeight.toFixed(2)} Qtl
            </span>
          </span>
          <span>
            Est. Rent:{" "}
            <span className="font-medium text-foreground">
              {formatIndianRupees(estimatedRent)}
            </span>
          </span>
        </div>
      )}
    </div>
  )
}
