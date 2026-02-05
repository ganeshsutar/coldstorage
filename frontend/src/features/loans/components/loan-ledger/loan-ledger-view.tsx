import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useLoanLedger } from "../../hooks/use-loan-ledger"
import { formatDate, formatCurrency } from "../../utils"

export function LoanLedgerView() {
  const navigate = useNavigate()
  const [partyId, setPartyId] = React.useState("")
  const [searchPartyId, setSearchPartyId] = React.useState<string | null>(null)

  const { ledger, loading, error } = useLoanLedger(searchPartyId)

  const handleSearch = () => {
    if (partyId.trim()) {
      setSearchPartyId(partyId.trim())
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/app/loans" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Loan Ledger</h2>
          <p className="text-muted-foreground">View party-wise loan transaction history</p>
        </div>
      </div>

      {/* Party Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="party_id">Party ID</Label>
              <Input
                id="party_id"
                value={partyId}
                onChange={(e) => setPartyId(e.target.value)}
                placeholder="Enter party ID to view ledger"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={!partyId.trim()}>
              View Ledger
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading ledger...</div>
        </div>
      )}

      {ledger && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Debit (Given)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {formatCurrency(ledger.total_dr)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Credit (Received)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {formatCurrency(ledger.total_cr)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Outstanding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {formatCurrency(ledger.outstanding)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Party Info */}
          <div className="text-sm text-muted-foreground">
            Showing ledger for: <span className="font-medium text-foreground">{ledger.party_name}</span>
          </div>

          {/* Transaction History */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Narration</TableHead>
                  <TableHead>Amad</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No entries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  ledger.entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-muted-foreground">
                        {entry.serial_number}
                      </TableCell>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>
                        <Badge variant={entry.entry_type === "DR" ? "default" : "secondary"}>
                          {entry.entry_type_display}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {entry.narration || "-"}
                      </TableCell>
                      <TableCell>{entry.amad_no || "-"}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(entry.amount)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatCurrency(entry.running_balance)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
