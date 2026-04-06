import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft, XCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"

import { useLoanDetail } from "../../hooks/use-loans"
import { loanService } from "../../api/loans"
import { getLoanStatusColor, formatDate, formatCurrency, formatInterestRate } from "../../utils"

interface LoanDetailViewProps {
  loanId: string
}

export function LoanDetailView({ loanId }: LoanDetailViewProps) {
  const navigate = useNavigate()
  const { loan, loading, error, refetch } = useLoanDetail(loanId)
  const [showCancelDialog, setShowCancelDialog] = React.useState(false)
  const [cancelReason, setCancelReason] = React.useState("")
  const [cancelling, setCancelling] = React.useState(false)

  const handleCancel = async () => {
    if (!loan || !cancelReason.trim()) return

    setCancelling(true)
    try {
      await loanService.cancelLoan(loan.id, cancelReason)
      refetch()
    } catch {
      toast.error("Failed to cancel loan")
    } finally {
      setCancelling(false)
      setShowCancelDialog(false)
      setCancelReason("")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-muted-foreground">Loading loan...</div>
      </div>
    )
  }

  if (error || !loan) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-destructive">{error || "Loan not found"}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Go back"
            onClick={() => navigate({ to: "/app/loans" })}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{loan.loan_no}</h1>
              <Badge variant={getLoanStatusColor(loan.status)}>
                {loan.status_display}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Loan to {loan.party_name}
            </p>
          </div>
        </div>

        {loan.status === "ACTIVE" && (
          <Button
            variant="outline"
            onClick={() => setShowCancelDialog(true)}
          >
            <XCircle className="mr-2 size-4" />
            Cancel
          </Button>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Loan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Party</Label>
                  <p className="font-medium">{loan.party_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">{formatDate(loan.date)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Collateral Amad</Label>
                  <p className="font-medium">{loan.amad_no}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Interest Rate</Label>
                  <p className="font-medium">{formatInterestRate(loan.interest_rate)} per month</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">Payment Mode</Label>
                    <p className="font-medium">{loan.payment_mode_display}</p>
                  </div>
                  {loan.cheque_number && (
                    <div>
                      <Label className="text-muted-foreground">Cheque No.</Label>
                      <p className="font-medium">{loan.cheque_number}</p>
                    </div>
                  )}
                  {loan.bank_name && (
                    <div>
                      <Label className="text-muted-foreground">Bank</Label>
                      <p className="font-medium">{loan.bank_name}</p>
                    </div>
                  )}
                  {loan.upi_reference && (
                    <div>
                      <Label className="text-muted-foreground">UPI Reference</Label>
                      <p className="font-medium">{loan.upi_reference}</p>
                    </div>
                  )}
                </div>
              </div>

              {loan.narration && (
                <div className="pt-4 border-t">
                  <Label className="text-muted-foreground">Narration</Label>
                  <p>{loan.narration}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loan Amount</span>
                <span className="font-mono">{formatCurrency(loan.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Repaid</span>
                <span className="font-mono">{formatCurrency(loan.repaid_amount)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Balance</span>
                <span className="font-mono">{formatCurrency(loan.balance_amount)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Accrued Interest</span>
                <span className="font-mono">{formatCurrency(loan.accrued_interest)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(loan.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span>{formatDate(loan.updated_at)}</span>
              </div>
              {loan.cancelled_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cancelled</span>
                  <span>{formatDate(loan.cancelled_at)}</span>
                </div>
              )}
              {loan.cancel_reason && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground">Reason: </span>
                  <span>{loan.cancel_reason}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Loan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel loan {loan.loan_no}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter cancellation reason..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling || !cancelReason.trim()}
            >
              {cancelling ? "Cancelling..." : "Confirm Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
