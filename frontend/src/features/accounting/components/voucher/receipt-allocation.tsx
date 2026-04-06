import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import type { ReceiptAllocationItem } from "../../types/voucher"
import { formatIndianNumber } from "../../utils/format-currency"

interface ReceiptAllocationProps {
  items: ReceiptAllocationItem[]
  totalAmount: number
  onChange: (items: ReceiptAllocationItem[]) => void
}

const headLabels = {
  rent: "Rent",
  loan: "Loan",
  bardana: "Bardana",
  interest: "Interest",
  other: "Other",
}

const headColors = {
  rent: "text-status-info-foreground",
  loan: "text-status-success-foreground",
  bardana: "text-status-warning-foreground",
  interest: "text-status-danger-foreground",
  other: "text-gray-600",
}

export function ReceiptAllocation({
  items,
  totalAmount,
  onChange,
}: ReceiptAllocationProps) {
  const handleAllocateChange = (index: number, value: string) => {
    const numValue = value ? parseFloat(value) : 0
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      allocate: Math.min(numValue, newItems[index].outstanding),
      remaining: Math.max(0, newItems[index].outstanding - numValue),
    }
    onChange(newItems)
  }

  const totalAllocated = items.reduce((sum, item) => sum + item.allocate, 0)
  const remaining = totalAmount - totalAllocated

  const itemsWithOutstanding = items.filter((item) => item.outstanding > 0)

  if (itemsWithOutstanding.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No outstanding amounts to allocate
      </p>
    )
  }

  return (
    <div data-slot="receipt-allocation" className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Head</TableHead>
            <TableHead className="text-right">Outstanding</TableHead>
            <TableHead className="text-right">Allocate</TableHead>
            <TableHead className="text-right">Remaining</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {itemsWithOutstanding.map((item, index) => (
            <TableRow key={item.head}>
              <TableCell
                className={cn("font-medium", headColors[item.head])}
              >
                {headLabels[item.head]}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatIndianNumber(item.outstanding)}
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={item.allocate || ""}
                  onChange={(e) => handleAllocateChange(index, e.target.value)}
                  placeholder="0"
                  className="text-right font-mono w-32 ml-auto"
                  max={item.outstanding}
                />
              </TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">
                {formatIndianNumber(item.remaining)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2} className="font-medium">
              Total Allocated
            </TableCell>
            <TableCell className="text-right font-mono font-medium">
              {formatIndianNumber(totalAllocated)}
            </TableCell>
            <TableCell className="text-right font-mono text-muted-foreground">
              {remaining > 0 && `+${formatIndianNumber(remaining)} unallocated`}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
