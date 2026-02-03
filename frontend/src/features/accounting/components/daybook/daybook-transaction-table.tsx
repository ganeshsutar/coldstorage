import { cn } from "@/lib/utils"
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
import type { DaybookTransaction } from "../../types/daybook"
import { formatIndianNumber } from "../../utils/format-currency"

interface DaybookTransactionTableProps {
  transactions: DaybookTransaction[]
  loading?: boolean
}

const voucherTypeColors = {
  CR: "bg-green-100 text-green-800",
  DR: "bg-red-100 text-red-800",
  JV: "bg-blue-100 text-blue-800",
  CV: "bg-purple-100 text-purple-800",
  BH: "bg-orange-100 text-orange-800",
}

export function DaybookTransactionTable({
  transactions,
  loading,
}: DaybookTransactionTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions for this date
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-24">V.No</TableHead>
          <TableHead className="w-16">Type</TableHead>
          <TableHead>Debit A/C</TableHead>
          <TableHead>Credit A/C</TableHead>
          <TableHead className="text-right w-32">Amount</TableHead>
          <TableHead className="w-20">Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((txn) => (
          <TableRow key={txn.id}>
            <TableCell className="font-mono">{txn.voucher_no}</TableCell>
            <TableCell>
              <Badge
                variant="secondary"
                className={cn(
                  "font-normal",
                  voucherTypeColors[txn.voucher_type]
                )}
              >
                {txn.voucher_type}
              </Badge>
            </TableCell>
            <TableCell className="truncate max-w-[200px]">
              {txn.debit_account}
            </TableCell>
            <TableCell className="truncate max-w-[200px]">
              {txn.credit_account}
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {formatIndianNumber(txn.amount)}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {txn.time}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
