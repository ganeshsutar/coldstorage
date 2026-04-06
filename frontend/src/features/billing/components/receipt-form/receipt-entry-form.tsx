import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FormDatePicker } from "@/components/ui/form-date-picker"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useNextNumber } from "@/features/system"
import { PartySelectorWithBalance } from "../shared/party-selector-with-balance"
import { PaymentModeSelector } from "./payment-mode-selector"
import { ChequeDetailsPanel, type ChequeDetails } from "./cheque-details-panel"
import {
  BillAllocationTable,
  type BillAllocation,
} from "./bill-allocation-table"
import { useUnpaidBills } from "../../hooks/use-receipts"
import { usePartyOutstanding } from "../../hooks/use-billing-stats"
import { receiptService } from "../../api/receipts"
import { convertAmountToWords } from "../../utils/amount-to-words"
import type { PaymentMode, ReceiptCreateRequest } from "../../types"

const DEFAULT_CHEQUE_DETAILS: ChequeDetails = {
  cheque_no: "",
  cheque_date: new Date().toISOString().split("T")[0],
  bank_name: "",
  branch_name: "",
  is_pdc: false,
  is_cleared: false,
}

interface ReceiptEntryFormProps {
  initialPartyId?: string
  initialBillId?: string
  onSuccess?: (receiptId: string) => void
  onCancel?: () => void
}

export function ReceiptEntryForm({
  initialPartyId,
  initialBillId,
  onSuccess,
  onCancel,
}: ReceiptEntryFormProps) {
  const navigate = useNavigate()
  const { nextNumber: nextReceiptNo, loading: numberLoading } = useNextNumber("RECEIPT")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Form state
  const [partyId, setPartyId] = React.useState(initialPartyId || "")
  const [receiptDate, setReceiptDate] = React.useState(
    new Date().toISOString().split("T")[0]
  )
  const [amount, setAmount] = React.useState(0)
  const [paymentMode, setPaymentMode] = React.useState<PaymentMode>("CASH")
  const [chequeDetails, setChequeDetails] = React.useState<ChequeDetails>(
    DEFAULT_CHEQUE_DETAILS
  )
  const [narration, setNarration] = React.useState("")
  const [autoAdjust, setAutoAdjust] = React.useState(true)
  const [allocations, setAllocations] = React.useState<BillAllocation[]>([])

  // Data fetching
  const { data: bills = [], isLoading: billsLoading } = useUnpaidBills(partyId || null)
  const { data: outstanding } = usePartyOutstanding(partyId || null)

  // Set initial allocation for specific bill
  React.useEffect(() => {
    if (initialBillId && bills.length > 0) {
      const bill = bills.find((b: { id: string }) => b.id === initialBillId)
      if (bill) {
        setAmount(bill.balance_amount)
        setAutoAdjust(false)
        // Allocate to specific bill
        setAllocations(
          bills.map((b: { id: string; bill_no: string; bill_date: string; net_amount: number; balance_amount: number }) => ({
            bill_id: b.id,
            bill_no: b.bill_no,
            bill_date: b.bill_date,
            bill_amount: b.net_amount,
            balance_amount: b.balance_amount,
            allocated_amount: b.id === initialBillId ? b.balance_amount : 0,
          }))
        )
      }
    }
  }, [initialBillId, bills])

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      navigate({ to: "/app/billing/receipts" })
    }
  }

  const handleSubmit = async (andPrint: boolean = false) => {
    if (!partyId || amount <= 0) return

    setLoading(true)
    setError(null)

    try {
      const request: ReceiptCreateRequest = {
        receipt_date: receiptDate,
        party_id: partyId,
        amount,
        payment_mode: paymentMode,
        narration: narration || undefined,
        allocations: allocations
          .filter((a) => a.allocated_amount > 0)
          .map((a) => ({
            rent_bill_id: a.bill_id,
            allocated_amount: a.allocated_amount,
          })),
      }

      // Add cheque details if payment mode is CHEQUE
      if (paymentMode === "CHEQUE") {
        request.cheque_no = chequeDetails.cheque_no
        request.cheque_date = chequeDetails.cheque_date
        request.bank_name = chequeDetails.bank_name
        request.branch_name = chequeDetails.branch_name || undefined
        request.is_pdc = chequeDetails.is_pdc
      }

      // Add bank reference for BANK mode
      if (paymentMode === "BANK") {
        request.bank_ref_no = narration // Use narration as reference for now
      }

      // Add UPI reference for UPI mode
      if (paymentMode === "UPI") {
        request.upi_ref_no = narration // Use narration as reference for now
      }

      const result = await receiptService.createReceipt(request)

      if (andPrint) {
        // Navigate to receipt detail for printing
        navigate({ to: "/app/billing/receipts/$id", params: { id: result.id } })
      } else if (onSuccess) {
        onSuccess(result.id)
      } else {
        navigate({ to: "/app/billing/receipts" })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create receipt")
    } finally {
      setLoading(false)
    }
  }

  const isValid =
    partyId &&
    amount > 0 &&
    (paymentMode !== "CHEQUE" ||
      (chequeDetails.cheque_no && chequeDetails.bank_name))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" aria-label="Go back" onClick={handleCancel}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Receipt</h1>
          <p className="text-muted-foreground">
            Record payment received from party
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Receipt No:</span>
          <Input value={numberLoading ? "..." : nextReceiptNo} readOnly className="bg-muted font-mono w-40 h-9" />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Receipt Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Receipt Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Receipt Number</Label>
              <Input value="Auto-generated" disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receipt_date">Date</Label>
              <FormDatePicker
                id="receipt_date"
                value={receiptDate}
                onChange={(val) => setReceiptDate(val)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Party *</Label>
            <PartySelectorWithBalance
              value={partyId}
              onChange={(value) => {
                setPartyId(value)
                setAllocations([]) // Reset allocations when party changes
              }}
              placeholder="Select party..."
              showOutstanding={true}
              outstandingBillsCount={outstanding?.total_bills}
              outstandingAmount={outstanding?.outstanding_amount}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Mode */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Payment Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentModeSelector
            value={paymentMode}
            onChange={setPaymentMode}
          />
        </CardContent>
      </Card>

      {/* Cheque Details (conditional) */}
      {paymentMode === "CHEQUE" && (
        <ChequeDetailsPanel
          details={chequeDetails}
          onChange={setChequeDetails}
        />
      )}

      {/* Amount */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Amount</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Receipt Amount *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount || ""}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="Enter amount"
              className="text-lg font-mono"
            />
          </div>
          {amount > 0 && (
            <p className="text-sm text-muted-foreground">
              {convertAmountToWords(amount)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Bill Allocation */}
      {partyId && (
        <BillAllocationTable
          bills={bills}
          allocations={allocations}
          onAllocationsChange={setAllocations}
          totalAmount={amount}
          autoAdjust={autoAdjust}
          onAutoAdjustChange={setAutoAdjust}
          loading={billsLoading}
        />
      )}

      {/* Narration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Narration</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            placeholder="Enter narration or notes..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={loading || !isValid}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            disabled={loading || !isValid}
          >
            {loading ? "Saving..." : "Save & Print"}
          </Button>
        </div>
      </div>
    </div>
  )
}
