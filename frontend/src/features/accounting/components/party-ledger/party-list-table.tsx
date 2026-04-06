import * as React from "react"
import { ChevronDownIcon, ChevronRightIcon, EyeIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
import { formatBalance } from "../../utils/format-currency"
import { ComponentBreakdown } from "./component-breakdown"
import { BalanceProgress } from "./balance-progress"

interface PartyListTableProps {
  parties: PartyAccount[]
  loading?: boolean
  onViewParty?: (party: PartyAccount) => void
}

function PartyRow({
  party,
  index,
  onView,
}: {
  party: PartyAccount
  index: number
  onView?: () => void
}) {
  const [expanded, setExpanded] = React.useState(false)
  const hasBreakdown = Object.values(party.component_balances ?? {}).some((v) => v !== 0)
  const balanceType = party.balance_nature === "DEBIT" ? "Dr" as const : "Cr" as const
  const balanceAmount = parseFloat(party.closing_balance) || 0
  const drLimit = party.dr_limit ?? 0

  return (
    <>
      <TableRow data-testid={`party-row-${index}`} className="group">
        <TableCell className="w-8">
          {hasBreakdown && (
            <Button
              variant="ghost"
              size="icon-xs"
              data-testid={`party-row-expand-${index}`}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronDownIcon className="size-4" />
              ) : (
                <ChevronRightIcon className="size-4" />
              )}
            </Button>
          )}
        </TableCell>
        <TableCell className="font-mono text-muted-foreground">
          {party.code}
        </TableCell>
        <TableCell className="font-medium">{party.name}</TableCell>
        <TableCell
          className={cn(
            "font-mono tabular-nums text-right",
            balanceType === "Dr" ? "text-status-danger-foreground" : "text-status-success-foreground"
          )}
        >
          {formatBalance(balanceAmount, balanceType)}
        </TableCell>
        <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
          {drLimit > 0
            ? drLimit.toLocaleString("en-IN")
            : "-"}
        </TableCell>
        <TableCell>
          <BalanceProgress
            balance={balanceAmount}
            creditLimit={drLimit}
          />
        </TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="icon-xs"
            data-testid={`party-row-view-${index}`}
            onClick={onView}
            className="opacity-0 group-hover:opacity-100"
          >
            <EyeIcon className="size-4" />
          </Button>
        </TableCell>
      </TableRow>
      {expanded && hasBreakdown && party.component_balances && (
        <TableRow data-testid={`party-row-breakdown-${index}`} className="bg-muted/30">
          <TableCell colSpan={7} className="py-2 pl-12">
            <ComponentBreakdown balances={party.component_balances} />
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export function PartyListTable({
  parties,
  loading,
  onViewParty,
}: PartyListTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (parties.length === 0) {
    return (
      <div data-testid="party-list-empty" className="text-center py-8 text-muted-foreground">
        No party accounts found
      </div>
    )
  }

  return (
    <Table data-testid="party-list-table">
      <TableHeader>
        <TableRow>
          <TableHead className="w-8" />
          <TableHead className="w-20">Code</TableHead>
          <TableHead>Party Name</TableHead>
          <TableHead className="text-right">Balance</TableHead>
          <TableHead className="text-right">Limit</TableHead>
          <TableHead className="w-24">Usage</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {parties.map((party, index) => (
          <PartyRow
            key={party.id}
            party={party}
            index={index}
            onView={() => onViewParty?.(party)}
          />
        ))}
      </TableBody>
    </Table>
  )
}
