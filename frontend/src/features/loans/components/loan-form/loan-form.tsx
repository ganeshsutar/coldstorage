import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { loanService } from "../../api/loans"
import { useCollateralAmads } from "../../hooks/use-loans"
import { formatCurrency, formatNumber } from "../../utils"

export function LoanForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Form state
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0])
  const [partyId, setPartyId] = React.useState("")
  const [selectedAmadId, setSelectedAmadId] = React.useState("")
  const [amount, setAmount] = React.useState(0)
  const [interestRate, setInterestRate] = React.useState(1.5)
  const [paymentMode, setPaymentMode] = React.useState("CASH")
  const [chequeNumber, setChequeNumber] = React.useState("")
  const [chequeDate, setChequeDate] = React.useState("")
  const [bankName, setBankName] = React.useState("")
  const [upiReference, setUpiReference] = React.useState("")
  const [narration, setNarration] = React.useState("")

  const { amads, loading: amadsLoading } = useCollateralAmads(partyId || null)

  const handleSubmit = async () => {
    if (!partyId || !selectedAmadId || !amount) {
      setError("Party, collateral amad, and amount are required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await loanService.createLoan({
        date,
        party_id: partyId,
        amad_id: selectedAmadId,
        amount,
        interest_rate: interestRate,
        payment_mode: paymentMode as "CASH" | "CHEQUE" | "BANK" | "UPI",
        cheque_number: chequeNumber || undefined,
        cheque_date: chequeDate || undefined,
        bank_name: bankName || undefined,
        upi_reference: upiReference || undefined,
        narration: narration || undefined,
      })
      navigate({ to: "/app/loans" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create loan")
    } finally {
      setLoading(false)
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
          <h2 className="text-2xl font-bold tracking-tight">New Loan (Karz)</h2>
          <p className="text-muted-foreground">Create a loan against stored goods</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Loan Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest_rate">Interest Rate (% monthly)</Label>
                <Input
                  id="interest_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={interestRate || ""}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                  className="font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Party</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="party_id">Party ID *</Label>
              <Input
                id="party_id"
                value={partyId}
                onChange={(e) => {
                  setPartyId(e.target.value)
                  setSelectedAmadId("")
                }}
                placeholder="Enter party ID"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Collateral Selection</CardTitle>
          </CardHeader>
          <CardContent>
            {!partyId ? (
              <p className="text-muted-foreground text-sm">Enter a party ID to see available amads.</p>
            ) : amadsLoading ? (
              <p className="text-muted-foreground text-sm">Loading amads...</p>
            ) : amads.length === 0 ? (
              <p className="text-muted-foreground text-sm">No eligible amads found for this party.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Select</TableHead>
                      <TableHead>Amad No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Commodity</TableHead>
                      <TableHead className="text-right">Packets</TableHead>
                      <TableHead className="text-right">Weight</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {amads.map((amad) => (
                      <TableRow
                        key={amad.id}
                        className={selectedAmadId === amad.id ? "bg-accent" : "cursor-pointer hover:bg-muted/50"}
                        onClick={() => setSelectedAmadId(amad.id)}
                      >
                        <TableCell>
                          <input
                            type="radio"
                            name="amad"
                            checked={selectedAmadId === amad.id}
                            onChange={() => setSelectedAmadId(amad.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{amad.amad_no}</TableCell>
                        <TableCell>{new Date(amad.date).toLocaleDateString("en-IN")}</TableCell>
                        <TableCell>{amad.commodity_name}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(amad.remaining_packets)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(amad.remaining_weight)} kg
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Loan Amount & Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="amount">Loan Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount || ""}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Loan amount"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Total</Label>
                <div className="p-2 border rounded-md bg-muted text-lg font-mono font-medium">
                  {formatCurrency(amount)}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_mode">Payment Mode</Label>
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="BANK">Bank Transfer</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {paymentMode === "CHEQUE" && (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cheque_number">Cheque Number</Label>
                  <Input
                    id="cheque_number"
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cheque_date">Cheque Date</Label>
                  <Input
                    id="cheque_date"
                    type="date"
                    value={chequeDate}
                    onChange={(e) => setChequeDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {paymentMode === "BANK" && (
              <div className="space-y-2">
                <Label htmlFor="bank_name_transfer">Bank Name</Label>
                <Input
                  id="bank_name_transfer"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>
            )}

            {paymentMode === "UPI" && (
              <div className="space-y-2">
                <Label htmlFor="upi_reference">UPI Reference</Label>
                <Input
                  id="upi_reference"
                  value={upiReference}
                  onChange={(e) => setUpiReference(e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Additional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="narration">Narration</Label>
              <Textarea
                id="narration"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="Add any notes..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/app/loans" })}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save Loan"}
        </Button>
      </div>
    </div>
  )
}
