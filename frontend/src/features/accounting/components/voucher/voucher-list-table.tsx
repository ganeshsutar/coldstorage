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
import type { Voucher } from "../../types/voucher"
import { formatIndianNumber } from "../../utils/format-currency"

interface VoucherListTableProps {
  vouchers: Voucher[]
  loading?: boolean
}

const voucherTypeColors = {
  CR: "bg-status-success-muted text-status-success-foreground",
  DR: "bg-status-danger-muted text-status-danger-foreground",
  JV: "bg-status-info-muted text-status-info-foreground",
  CV: "bg-purple-100 text-purple-800",
  BH: "bg-status-warning-muted text-status-warning-foreground",
}

function getDebitAccount(voucher: Voucher): string {
  const debitLine = voucher.lines.find((l) => l.debit && l.debit > 0)
  return debitLine?.account_name || "-"
}

function getCreditAccount(voucher: Voucher): string {
  const creditLine = voucher.lines.find((l) => l.credit && l.credit > 0)
  return creditLine?.account_name || "-"
}

export function VoucherListTable({
  vouchers,
  loading,
}: VoucherListTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (vouchers.length === 0) {
    return (
      <div data-testid="voucher-list-empty" className="text-center py-8 text-muted-foreground">
        No vouchers found
      </div>
    )
  }

  return (
    <Table data-testid="voucher-list-table">
      <TableHeader>
        <TableRow>
          <TableHead className="w-24">V.No</TableHead>
          <TableHead className="w-16">Type</TableHead>
          <TableHead className="w-28">Date</TableHead>
          <TableHead>Debit A/C</TableHead>
          <TableHead>Credit A/C</TableHead>
          <TableHead className="text-right w-32">Amount</TableHead>
          <TableHead>Narration</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vouchers.map((voucher, index) => (
          <TableRow key={voucher.id} data-testid={`voucher-row-${index}`}>
            <TableCell className="font-mono">{voucher.voucher_no}</TableCell>
            <TableCell>
              <Badge
                variant="secondary"
                className={cn(
                  "font-normal",
                  voucherTypeColors[voucher.voucher_type]
                )}
              >
                {voucher.voucher_type}
              </Badge>
            </TableCell>
            <TableCell>{voucher.date}</TableCell>
            <TableCell className="truncate max-w-[200px]">
              {getDebitAccount(voucher)}
            </TableCell>
            <TableCell className="truncate max-w-[200px]">
              {getCreditAccount(voucher)}
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {formatIndianNumber(voucher.total_debit)}
            </TableCell>
            <TableCell className="truncate max-w-[200px] text-muted-foreground">
              {voucher.narration || "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
