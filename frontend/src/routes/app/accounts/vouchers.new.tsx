import * as React from "react"
import { format } from "date-fns"
import { SaveIcon, PrinterIcon, XIcon, ArrowLeftIcon } from "lucide-react"
import { Link, useNavigate } from "@tanstack/react-router"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { DatePicker } from "@/components/ui/date-picker"
import {
  VoucherTypeSelector,
  DoubleEntryForm,
  PaymentDetails,
  AmountInWords,
} from "@/features/accounting/components/voucher"
import {
  useAccounts,
  vouchersService,
  type VoucherType,
  type VoucherLine,
  type PaymentDetails as PaymentDetailsType,
} from "@/features/accounting"
import { useNextNumber } from "@/features/system"

export function NewVoucherPage() {
  const navigate = useNavigate()
  const { accounts } = useAccounts()
  const [voucherType, setVoucherType] = React.useState<VoucherType>("CR")
  const voucherKey = `VOUCHER_${voucherType}` as const
  const { nextNumber: voucherNo } = useNextNumber(voucherKey)
  const [date, setDate] = React.useState<Date>(new Date())
  const [lines, setLines] = React.useState<VoucherLine[]>([
    { account_id: "", debit: null, credit: null },
    { account_id: "", debit: null, credit: null },
  ])
  const [narration, setNarration] = React.useState("")
  const [paymentDetails, setPaymentDetails] = React.useState<PaymentDetailsType>({
    mode: "cash",
  })
  const [saving, setSaving] = React.useState(false)

  const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0)
  const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0)
  const totalAmount = Math.max(totalDebit, totalCredit)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  const handleSave = async () => {
    if (!isBalanced || totalAmount === 0) return

    const validLines = lines.filter(
      (l) => l.account_id && (l.debit || l.credit)
    )
    if (validLines.length < 2) return

    try {
      setSaving(true)
      await vouchersService.createVoucher({
        voucher_type: voucherType,
        date: format(date, "yyyy-MM-dd"),
        lines: validLines,
        narration,
        payment_details: paymentDetails,
      })
      navigate({ to: "/app/accounts/vouchers" })
    } catch (error) {
      console.error("Failed to save voucher:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout activeNavItemId="vouchers">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild data-testid="new-voucher-back-button">
              <Link to="/app/accounts/vouchers">
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 data-testid="new-voucher-title" className="text-2xl font-semibold">New Voucher</h1>
              <p className="text-sm text-muted-foreground">
                Create accounting vouchers with double-entry bookkeeping
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <VoucherTypeSelector
                value={voucherType}
                onChange={setVoucherType}
              />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">Date:</Label>
                  <DatePicker
                    data-testid="new-voucher-date-picker"
                    date={date}
                    onDateChange={(d) => d && setDate(d)}
                    className="w-40"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">V#:</Label>
                  <Input
                    data-testid="new-voucher-number-input"
                    value={voucherNo}
                    readOnly
                    className="w-28 font-mono text-center bg-muted"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Separator />

            <DoubleEntryForm
              accounts={accounts}
              lines={lines}
              onChange={setLines}
            />

            <Separator />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="narration">Narration</Label>
                  <Input
                    id="narration"
                    data-testid="new-voucher-narration-input"
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                    placeholder="Enter transaction narration..."
                  />
                </div>

                <PaymentDetails
                  value={paymentDetails}
                  onChange={setPaymentDetails}
                />
              </div>

              <div className="flex flex-col justify-between">
                <AmountInWords amount={totalAmount} />

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" asChild data-testid="new-voucher-cancel-button">
                    <Link to="/app/accounts/vouchers">
                      <XIcon className="mr-2 h-4 w-4" />
                      Cancel
                    </Link>
                  </Button>
                  <Button
                    data-testid="new-voucher-save-button"
                    onClick={handleSave}
                    disabled={!isBalanced || totalAmount === 0 || saving}
                  >
                    <SaveIcon className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    data-testid="new-voucher-save-print-button"
                    variant="secondary"
                    disabled={!isBalanced || totalAmount === 0 || saving}
                  >
                    <PrinterIcon className="mr-2 h-4 w-4" />
                    Save & Print
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
