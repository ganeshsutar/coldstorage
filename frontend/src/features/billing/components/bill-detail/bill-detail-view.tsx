import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Receipt,
  Printer,
  MoreHorizontal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { InvoicePreviewCard } from "./invoice-preview-card"
import { GstBreakdownTable } from "./gst-breakdown-table"
import { useRentBillDetail } from "../../hooks/use-rent-bills"
import { rentBillService } from "../../api/rent-bills"
import { formatIndianRupees } from "../../utils/amount-to-words"
import type { BillStatus } from "../../types"

const statusColors: Record<BillStatus, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  CONFIRMED: "default",
  PARTIAL_PAID: "outline",
  PAID: "default",
  CANCELLED: "destructive",
}

interface BillDetailViewProps {
  billId: string
}

export function BillDetailView({ billId }: BillDetailViewProps) {
  const navigate = useNavigate()
  const { bill, loading, error, refetch } = useRentBillDetail(billId)
  const [showCancelDialog, setShowCancelDialog] = React.useState(false)
  const [cancelReason, setCancelReason] = React.useState("")
  const [actionLoading, setActionLoading] = React.useState(false)

  const handleBack = () => {
    navigate({ to: "/app/billing" })
  }

  const handleConfirm = async () => {
    if (!bill) return
    setActionLoading(true)
    try {
      await rentBillService.confirmRentBill(bill.id)
      refetch()
    } catch (err) {
      console.error("Failed to confirm bill:", err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!bill || !cancelReason.trim()) return
    setActionLoading(true)
    try {
      await rentBillService.cancelRentBill(bill.id, cancelReason)
      refetch()
      setShowCancelDialog(false)
      setCancelReason("")
    } catch (err) {
      console.error("Failed to cancel bill:", err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleNewReceipt = () => {
    if (!bill) return
    navigate({
      to: "/app/billing/receipts/new",
      search: { party_id: bill.party, bill_id: bill.id },
    })
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
            <Skeleton className="h-[600px]" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !bill) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Bill Not Found</h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-32 text-destructive">
            {error || "The requested bill could not be found."}
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
                {bill.bill_no}
              </h1>
              <Badge variant={statusColors[bill.status]}>
                {bill.status_display}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {formatDate(bill.bill_date)} | {bill.party_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {bill.status === "DRAFT" && (
            <Button onClick={handleConfirm} disabled={actionLoading}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm
            </Button>
          )}
          {bill.status !== "CANCELLED" && bill.status !== "PAID" && (
            <Button variant="outline" onClick={handleNewReceipt}>
              <Receipt className="mr-2 h-4 w-4" />
              New Receipt
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </DropdownMenuItem>
              {bill.status !== "CANCELLED" && bill.paid_amount === 0 && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Bill
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invoice Preview - Takes 2 columns */}
        <div className="lg:col-span-2">
          <InvoicePreviewCard bill={bill} onPrint={handlePrint} />
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
                <span className="text-muted-foreground">Taxable Amount</span>
                <span className="font-mono">
                  {formatIndianRupees(bill.taxable_amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total GST</span>
                <span className="font-mono">
                  {formatIndianRupees(bill.total_gst)}
                </span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2">
                <span>Net Amount</span>
                <span className="font-mono">
                  {formatIndianRupees(bill.net_amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>Paid</span>
                <span className="font-mono">
                  {formatIndianRupees(bill.paid_amount)}
                </span>
              </div>
              {bill.balance_amount > 0 && (
                <div className="flex justify-between font-medium text-destructive border-t pt-2">
                  <span>Balance</span>
                  <span className="font-mono">
                    {formatIndianRupees(bill.balance_amount)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* GST Breakdown */}
          <GstBreakdownTable bill={bill} />

          {/* Audit Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Audit Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(bill.created_at)}</span>
              </div>
              {bill.confirmed_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confirmed</span>
                  <span>{formatDate(bill.confirmed_at)}</span>
                </div>
              )}
              {bill.cancelled_at && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cancelled</span>
                    <span>{formatDate(bill.cancelled_at)}</span>
                  </div>
                  {bill.cancel_reason && (
                    <div>
                      <span className="text-muted-foreground">Reason: </span>
                      <span>{bill.cancel_reason}</span>
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
            <AlertDialogTitle>Cancel Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel bill {bill.bill_no}? This action
              cannot be undone.
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
