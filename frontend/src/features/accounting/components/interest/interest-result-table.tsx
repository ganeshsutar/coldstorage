import * as React from "react"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"

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
  TableFooter,
} from "@/components/ui/table"
import type { InterestCalculationResult, PartyInterestResult } from "../../types/interest"
import { formatIndianNumber } from "../../utils/format-currency"

interface InterestResultTableProps {
  result: InterestCalculationResult | null
}

const componentColors = {
  rent: "bg-status-info-muted text-status-info-foreground",
  loan: "bg-status-success-muted text-status-success-foreground",
  bardana: "bg-status-warning-muted text-status-warning-foreground",
  other: "bg-gray-100 text-gray-800",
}

const componentLabels = {
  rent: "Rent",
  loan: "Loan",
  bardana: "Bardana",
  other: "Other",
}

function PartyRow({ party, index }: { party: PartyInterestResult; index: number }) {
  const [expanded, setExpanded] = React.useState(false)
  const hasBreakdown = party.breakdown.length > 0

  return (
    <>
      <TableRow data-testid={`interest-result-row-${index}`} className="group">
        <TableCell className="w-8">
          {hasBreakdown && (
            <Button
              data-testid={`interest-result-expand-${index}`}
              variant="ghost"
              size="icon-xs"
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
        <TableCell className="font-medium">{party.party_name}</TableCell>
        <TableCell className="font-mono tabular-nums text-right">
          {formatIndianNumber(party.principal)}
        </TableCell>
        <TableCell className="text-center">{party.days}</TableCell>
        <TableCell className="text-center">{party.rate}%</TableCell>
        <TableCell className="font-mono tabular-nums text-right font-medium text-status-danger-foreground">
          {formatIndianNumber(party.interest)}
        </TableCell>
      </TableRow>
      {expanded && hasBreakdown && (
        <TableRow className="bg-muted/30">
          <TableCell colSpan={6} className="py-2 pl-12">
            <div className="flex flex-wrap gap-2">
              {party.breakdown.map((item) => (
                <Badge
                  key={item.component}
                  variant="secondary"
                  className={cn(
                    "font-normal",
                    componentColors[item.component]
                  )}
                >
                  {componentLabels[item.component]}:{" "}
                  <span className="font-mono ml-1">
                    {formatIndianNumber(item.interest)}
                  </span>
                </Badge>
              ))}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export function InterestResultTable({ result }: InterestResultTableProps) {
  if (!result || result.results.length === 0) {
    return (
      <div data-testid="interest-result-empty" className="text-center py-8 text-muted-foreground">
        No results to display. Click "Calculate Interest" to compute interest.
      </div>
    )
  }

  return (
    <Table data-testid="interest-result-table">
      <TableHeader>
        <TableRow>
          <TableHead className="w-8" />
          <TableHead>Party</TableHead>
          <TableHead className="text-right">Principal</TableHead>
          <TableHead className="text-center">Days</TableHead>
          <TableHead className="text-center">Rate</TableHead>
          <TableHead className="text-right">Interest</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {result.results.map((party, index) => (
          <PartyRow key={party.party_id} party={party} index={index} />
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2} className="font-medium">
            Total
          </TableCell>
          <TableCell data-testid="interest-result-total-principal" className="text-right font-mono tabular-nums">
            {formatIndianNumber(result.total_principal)}
          </TableCell>
          <TableCell colSpan={2} />
          <TableCell data-testid="interest-result-total-interest" className="text-right font-mono tabular-nums font-medium text-status-danger-foreground">
            {formatIndianNumber(result.total_interest)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
