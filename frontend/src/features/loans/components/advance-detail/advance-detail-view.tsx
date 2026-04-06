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

import { useAdvanceDetail } from "../../hooks/use-advances"
import { advanceService } from "../../api/advances"
import { getAdvanceStatusColor, formatDate, formatCurrency, formatNumber } from "../../utils"

interface AdvanceDetailViewProps {
  advanceId: string
}

export function AdvanceDetailView({ advanceId }: AdvanceDetailViewProps) {
  const navigate = useNavigate()
  const { advance, loading, error, refetch } = useAdvanceDetail(advanceId)
  const [showCancelDialog, setShowCancelDialog] = React.useState(false)
  const [cancelReason, setCancelReason] = React.useState("")
  const [cancelling, setCancelling] = React.useState(false)

  const handleCancel = async () => {
    if (!advance || !cancelReason.trim()) return

    setCancelling(true)
    try {
      await advanceService.cancelAdvance(advance.id, cancelReason)
      refetch()
    } catch {
      toast.error("Failed to cancel advance")
    } finally {
      setCancelling(false)
      setShowCancelDialog(false)
      setCancelReason("")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-muted-foreground">Loading advance...</div>
      </div>
    )
  }

  if (error || !advance) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-destructive">{error || "Advance not found"}</div>
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
              <h1 className="text-2xl font-bold">{advance.advance_no}</h1>
              <Badge variant={getAdvanceStatusColor(advance.status)}>
                {advance.status_display}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Advance to {advance.party_name}
            </p>
          </div>
        </div>

        {advance.status === "ACTIVE" && (
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
              <CardTitle className="text-base">Advance Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Party</Label>
                  <p className="font-medium">{advance.party_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">{formatDate(advance.date)}</p>
                </div>
                {advance.expected_date && (
                  <div>
                    <Label className="text-muted-foreground">Expected Date</Label>
                    <p className="font-medium">{formatDate(advance.expected_date)}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Expected Bags</Label>
                  <p className="font-medium">{formatNumber(advance.bags)}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">Payment Mode</Label>
                    <p className="font-medium">{advance.payment_mode_display}</p>
                  </div>
                  {advance.cheque_number && (
                    <div>
                      <Label className="text-muted-foreground">Cheque No.</Label>
                      <p className="font-medium">{advance.cheque_number}</p>
                    </div>
                  )}
                  {advance.bank_name && (
                    <div>
                      <Label className="text-muted-foreground">Bank</Label>
                      <p className="font-medium">{advance.bank_name}</p>
                    </div>
                  )}
                  {advance.upi_reference && (
                    <div>
                      <Label className="text-muted-foreground">UPI Reference</Label>
                      <p className="font-medium">{advance.upi_reference}</p>
                    </div>
                  )}
                </div>
              </div>

              {(advance.bardana_voucher || advance.narration) && (
                <div className="pt-4 border-t space-y-3">
                  {advance.bardana_voucher && (
                    <div>
                      <Label className="text-muted-foreground">Bardana Voucher</Label>
                      <p>{advance.bardana_voucher}</p>
                    </div>
                  )}
                  {advance.narration && (
                    <div>
                      <Label className="text-muted-foreground">Narration</Label>
                      <p>{advance.narration}</p>
                    </div>
                  )}
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
                <span className="text-muted-foreground">Amount</span>
                <span className="font-mono">{formatCurrency(advance.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Adjusted</span>
                <span className="font-mono">{formatCurrency(advance.adjusted_amount)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Balance</span>
                <span className="font-mono">{formatCurrency(advance.balance_amount)}</span>
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
                <span>{formatDate(advance.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span>{formatDate(advance.updated_at)}</span>
              </div>
              {advance.cancelled_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cancelled</span>
                  <span>{formatDate(advance.cancelled_at)}</span>
                </div>
              )}
              {advance.cancel_reason && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground">Reason: </span>
                  <span>{advance.cancel_reason}</span>
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
            <AlertDialogTitle>Cancel Advance</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel advance {advance.advance_no}?
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
