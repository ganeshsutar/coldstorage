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

import { useNextNumber } from "@/features/system"
import { advanceService } from "../../api/advances"
import { formatCurrency } from "../../utils"

export function AdvanceForm() {
  const navigate = useNavigate()
  const { nextNumber: nextAdvanceNo, loading: numberLoading } = useNextNumber("ADVANCE")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Form state
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0])
  const [expectedDate, setExpectedDate] = React.useState("")
  const [partyId, setPartyId] = React.useState("")
  const [bags, setBags] = React.useState(0)
  const [amount, setAmount] = React.useState(0)
  const [paymentMode, setPaymentMode] = React.useState("CASH")
  const [chequeNumber, setChequeNumber] = React.useState("")
  const [chequeDate, setChequeDate] = React.useState("")
  const [bankName, setBankName] = React.useState("")
  const [upiReference, setUpiReference] = React.useState("")
  const [bardanaVoucher, setBardanaVoucher] = React.useState("")
  const [narration, setNarration] = React.useState("")

  const handleSubmit = async () => {
    if (!partyId || !amount) {
      setError("Party and amount are required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await advanceService.createAdvance({
        date,
        expected_date: expectedDate || undefined,
        party_id: partyId,
        bags,
        amount,
        payment_mode: paymentMode as "CASH" | "CHEQUE" | "BANK" | "UPI",
        cheque_number: chequeNumber || undefined,
        cheque_date: chequeDate || undefined,
        bank_name: bankName || undefined,
        upi_reference: upiReference || undefined,
        bardana_voucher: bardanaVoucher || undefined,
        narration: narration || undefined,
      })
      navigate({ to: "/app/loans" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create advance")
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
          <h2 className="text-2xl font-bold tracking-tight">New Advance (Pesgi)</h2>
          <p className="text-muted-foreground">Create a pre-season advance</p>
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
            <CardTitle className="text-base">Advance Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Advance No</Label>
              <Input value={numberLoading ? "..." : nextAdvanceNo} readOnly className="bg-muted font-mono w-48" />
            </div>
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
                <Label htmlFor="expected_date">Expected Date</Label>
                <Input
                  id="expected_date"
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="party_id">Party ID *</Label>
                <Input
                  id="party_id"
                  value={partyId}
                  onChange={(e) => setPartyId(e.target.value)}
                  placeholder="Enter party ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bags">Expected Bags</Label>
                <Input
                  id="bags"
                  type="number"
                  min="0"
                  value={bags || ""}
                  onChange={(e) => setBags(parseInt(e.target.value) || 0)}
                  placeholder="Number of expected bags"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Amount & Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount || ""}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Advance amount"
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
                    placeholder="Cheque no."
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
                    placeholder="Bank name"
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
                  placeholder="Bank name"
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
                  placeholder="UPI transaction reference"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Additional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bardana_voucher">Bardana Voucher</Label>
                <Input
                  id="bardana_voucher"
                  value={bardanaVoucher}
                  onChange={(e) => setBardanaVoucher(e.target.value)}
                  placeholder="Bardana voucher reference"
                />
              </div>
            </div>
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
          {loading ? "Saving..." : "Save Advance"}
        </Button>
      </div>
    </div>
  )
}
