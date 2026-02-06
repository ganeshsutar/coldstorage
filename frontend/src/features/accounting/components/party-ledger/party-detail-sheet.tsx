import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import type { PartyAccount } from "../../types/account"
import { useLedger } from "../../hooks/use-accounts"
import { formatBalance, formatCurrency } from "../../utils/format-currency"
import { ComponentBreakdown } from "./component-breakdown"
import { BalanceProgress } from "./balance-progress"
import { cn } from "@/lib/utils"

interface PartyDetailSheetProps {
  party: PartyAccount | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PartyDetailSheet({
  party,
  open,
  onOpenChange,
}: PartyDetailSheetProps) {
  const { entries, loading } = useLedger(party?.id || null)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {party && (
          <>
            <SheetHeader>
              <div className="flex items-start justify-between">
                <div>
                  <SheetTitle className="text-xl">{party.name}</SheetTitle>
                  <SheetDescription className="font-mono">
                    {party.code}
                  </SheetDescription>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    party.balance_nature === "DEBIT"
                      ? "border-red-200 text-red-700"
                      : "border-green-200 text-green-700"
                  )}
                >
                  {formatBalance(
                    parseFloat(party.closing_balance) || 0,
                    party.balance_nature === "DEBIT" ? "Dr" : "Cr"
                  )}
                </Badge>
              </div>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Contact Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p>{party.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Village</p>
                    <p>{party.village || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Address</p>
                    <p>{party.address || "-"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Credit Limit
                </h3>
                <div className="flex items-center justify-between">
                  <span className="font-mono">
                    {formatCurrency(party.dr_limit ?? 0)}
                  </span>
                  <BalanceProgress
                    balance={parseFloat(party.closing_balance) || 0}
                    creditLimit={party.dr_limit ?? 0}
                  />
                </div>
              </div>

              <Separator />

              {party.component_balances && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Balance Breakdown
                </h3>
                <ComponentBreakdown balances={party.component_balances} />
              </div>
              )}

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Recent Transactions
                </h3>
                {loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : entries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No transactions found
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>V.No</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.slice(0, 10).map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-sm">
                            {entry.date}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {entry.voucher_no}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm text-red-600">
                            {entry.debit
                              ? entry.debit.toLocaleString("en-IN")
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm text-green-600">
                            {entry.credit
                              ? entry.credit.toLocaleString("en-IN")
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
