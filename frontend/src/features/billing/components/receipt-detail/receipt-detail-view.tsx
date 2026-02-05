import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Printer,
  MoreHorizontal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Skeleton } from "@/components/ui/skeleton"
import { useReceiptDetail } from "../../hooks/use-receipts"
import { receiptService } from "../../api/receipts"
import {
  formatIndianRupees,
  convertAmountToWords,
} from "../../utils/amount-to-words"
import type { BillStatus, PaymentMode } from "../../types"

const statusColors: Record<BillStatus, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  CONFIRMED: "default",
  PARTIAL_PAID: "outline",
  PAID: "default",
  CANCELLED: "destructive",
}

const paymentModeColors: Record<PaymentMode, "default" | "secondary" | "outline"> = {
  CASH: "default",
  CHEQUE: "outline",
  BANK: "secondary",
  UPI: "secondary",
}

interface ReceiptDetailViewProps {
  receiptId: string
}

export function ReceiptDetailView({ receiptId }: ReceiptDetailViewProps) {
  const navigate = useNavigate()
  const { data: receipt, isLoading: loading, error, refetch } = useReceiptDetail(receiptId)
  const [showCancelDialog, setShowCancelDialog] = React.useState(false)
  const [cancelReason, setCancelReason] = React.useState("")
  const [actionLoading, setActionLoading] = React.useState(false)

  const handleBack = () => {
    navigate({ to: "/app/billing/receipts" })
  }

  const handleConfirm = async () => {
    if (!receipt) return
    setActionLoading(true)
    try {
      await receiptService.confirmReceipt(receipt.id)
      refetch()
    } catch (err) {
      console.error("Failed to confirm receipt:", err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!receipt || !cancelReason.trim()) return
    setActionLoading(true)
    try {
      await receiptService.cancelReceipt(receipt.id, cancelReason)
      refetch()
      setShowCancelDialog(false)
      setCancelReason("")
    } catch (err) {
      console.error("Failed to cancel receipt:", err)
    } finally {
      setActionLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-[400px]" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !receipt) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Receipt Not Found</h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-32 text-destructive">
            {error?.message || "The requested receipt could not be found."}
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {receipt.receipt_no}
              </h1>
              <Badge variant={statusColors[receipt.status]}>
                {receipt.status_display}
              </Badge>
              <Badge variant={paymentModeColors[receipt.payment_mode]}>
                {receipt.payment_mode_display}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {formatDate(receipt.receipt_date)} | {receipt.party_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {receipt.status === "DRAFT" && (
            <Button onClick={handleConfirm} disabled={actionLoading}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm
            </Button>
          )}
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {receipt.status !== "CANCELLED" && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Receipt
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Receipt Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Receipt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-white space-y-6 print:border-0 print:p-0">
                {/* Header */}
                <div className="text-center border-b pb-4">
                  <h2 className="text-xl font-bold">RECEIPT</h2>
                </div>

                {/* Company & Receipt Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Cold Storage XYZ</p>
                    <p className="text-sm text-muted-foreground">
                      Address, City
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Receipt #:</span>{" "}
                      <span className="font-mono font-semibold">
                        {receipt.receipt_no}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Date:</span>{" "}
                      <span className="font-medium">
                        {formatDate(receipt.receipt_date)}
                      </span>
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Received From */}
                <div>
                  <p className="text-sm text-muted-foreground">Received from:</p>
                  <p className="font-semibold text-lg">{receipt.party_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Party Code: {receipt.party_code}
                  </p>
                </div>

                <Separator />

                {/* Amount */}
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-1">Amount</p>
                  <p className="text-3xl font-bold font-mono">
                    {formatIndianRupees(receipt.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ({convertAmountToWords(receipt.amount)})
                  </p>
                </div>

                <Separator />

                {/* Payment Details */}
                <div>
                  <p className="text-sm text-muted-foreground">Payment Mode:</p>
                  <p className="font-medium">{receipt.payment_mode_display}</p>

                  {receipt.payment_mode === "CHEQUE" && (
                    <div className="mt-2 text-sm space-y-1">
                      {receipt.cheque_no && (
                        <p>Cheque No: {receipt.cheque_no}</p>
                      )}
                      {receipt.bank_name && <p>Bank: {receipt.bank_name}</p>}
                      {receipt.cheque_date && (
                        <p>Cheque Date: {formatDate(receipt.cheque_date)}</p>
                      )}
                      {receipt.is_pdc && (
                        <Badge variant="outline" className="mt-1">
                          Post-dated Cheque
                        </Badge>
                      )}
                    </div>
                  )}

                  {receipt.bank_ref_no && (
                    <p className="text-sm mt-1">
                      Reference: {receipt.bank_ref_no}
                    </p>
                  )}
                  {receipt.upi_ref_no && (
                    <p className="text-sm mt-1">UPI Ref: {receipt.upi_ref_no}</p>
                  )}
                </div>

                {/* Allocations */}
                {receipt.allocations && receipt.allocations.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Against:
                      </p>
                      <ul className="space-y-1">
                        {receipt.allocations.map((alloc) => (
                          <li
                            key={alloc.id}
                            className="flex justify-between text-sm"
                          >
                            <span>Bill #{alloc.bill_no}</span>
                            <span className="font-mono">
                              {formatIndianRupees(alloc.allocated_amount)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {/* Narration */}
                {receipt.narration && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Narration:</p>
                      <p className="text-sm">{receipt.narration}</p>
                    </div>
                  </>
                )}

                {/* Signature */}
                <div className="pt-8">
                  <div className="text-right">
                    <div className="border-t inline-block pt-2 px-8">
                      <p className="text-sm text-muted-foreground">
                        Authorized Signature
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-mono font-medium">
                  {formatIndianRupees(receipt.amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Mode</span>
                <span>{receipt.payment_mode_display}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={statusColors[receipt.status]}>
                  {receipt.status_display}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Audit Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Audit Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(receipt.created_at)}</span>
              </div>
              {receipt.confirmed_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confirmed</span>
                  <span>{formatDate(receipt.confirmed_at)}</span>
                </div>
              )}
              {receipt.cancelled_at && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cancelled</span>
                    <span>{formatDate(receipt.cancelled_at)}</span>
                  </div>
                  {receipt.cancel_reason && (
                    <div>
                      <span className="text-muted-foreground">Reason: </span>
                      <span>{receipt.cancel_reason}</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Receipt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel receipt {receipt.receipt_no}? This
              action cannot be undone.
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
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={actionLoading || !cancelReason.trim()}
            >
              {actionLoading ? "Cancelling..." : "Confirm Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
