import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { Plus, Eye, Printer, XCircle, MoreHorizontal, CheckCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { useReceipts } from "../../hooks/use-receipts"
import { receiptService } from "../../api/receipts"
import { formatIndianRupees } from "../../utils/amount-to-words"
import type { Receipt, BillStatus, PaymentMode } from "../../types"

const statusColors: Record<BillStatus, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  CONFIRMED: "default",
  PARTIAL_PAID: "outline",
  PAID: "default",
  CANCELLED: "destructive",
}

const paymentModeColors: Record<PaymentMode, "default" | "secondary" | "outline"> = {
  CASH: "default",
  CHEQUE: "secondary",
  BANK: "outline",
  UPI: "default",
}

const statusOptions = [
  { value: "ALL", label: "All Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" },
]

export function ReceiptList() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const { data: receipts = [], isLoading: loading, error, refetch } = useReceipts(
    statusFilter === "ALL" ? undefined : { status: statusFilter as BillStatus }
  )
  const [cancelReceipt, setCancelReceipt] = React.useState<Receipt | null>(null)
  const [cancelReason, setCancelReason] = React.useState("")
  const [cancelling, setCancelling] = React.useState(false)

  const handleCancel = async () => {
    if (!cancelReceipt || !cancelReason.trim()) return

    setCancelling(true)
    try {
      await receiptService.cancelReceipt(cancelReceipt.id, cancelReason)
      refetch()
    } catch {
      toast.error("Failed to cancel receipt")
    } finally {
      setCancelling(false)
      setCancelReceipt(null)
      setCancelReason("")
    }
  }

  const handleConfirm = async (receipt: Receipt) => {
    try {
      await receiptService.confirmReceipt(receipt.id)
      refetch()
    } catch {
      toast.error("Failed to confirm receipt")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-destructive">{error.message}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Receipts</h2>
          <p className="text-muted-foreground">
            Manage payment receipts
          </p>
        </div>
        <Button onClick={() => navigate({ to: "/app/billing/receipts/new" })}>
          <Plus className="mr-2 size-4" />
          New Receipt
        </Button>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          {statusOptions.map((option) => (
            <TabsTrigger key={option.value} value={option.value}>
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Party</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading receipts...
                </TableCell>
              </TableRow>
            ) : receipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No receipts found. Create your first receipt to get started.
                </TableCell>
              </TableRow>
            ) : (
              receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">{receipt.receipt_no}</TableCell>
                  <TableCell>{formatDate(receipt.receipt_date)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{receipt.party_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {receipt.party_code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {formatIndianRupees(receipt.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={paymentModeColors[receipt.payment_mode]}>
                      {receipt.payment_mode_display}
                    </Badge>
                    {receipt.payment_mode === "CHEQUE" && receipt.cheque_no && (
                      <div className="text-xs text-muted-foreground mt-1">
                        #{receipt.cheque_no}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[receipt.status]}>
                      {receipt.status_display}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Open menu">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate({
                              to: "/app/billing/receipts/$id",
                              params: { id: receipt.id },
                            })
                          }
                        >
                          <Eye className="mr-2 size-4" />
                          View
                        </DropdownMenuItem>
                        {receipt.status === "DRAFT" && (
                          <DropdownMenuItem onClick={() => handleConfirm(receipt)}>
                            <CheckCircle className="mr-2 size-4" />
                            Confirm
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Printer className="mr-2 size-4" />
                          Print
                        </DropdownMenuItem>
                        {receipt.status !== "CANCELLED" && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setCancelReceipt(receipt)}
                          >
                            <XCircle className="mr-2 size-4" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!cancelReceipt} onOpenChange={() => setCancelReceipt(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Receipt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel receipt {cancelReceipt?.receipt_no}? This will
              reverse all bill allocations.
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
