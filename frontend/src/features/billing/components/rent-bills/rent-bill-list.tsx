import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { Plus, Eye, Receipt, Printer, XCircle, MoreHorizontal } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { useRentBills } from "../../hooks/use-rent-bills"
import { rentBillService } from "../../api/rent-bills"
import { formatIndianRupees } from "../../utils/amount-to-words"
import type { RentBillHeader, BillStatus } from "../../types"
import { BillingKpiCards } from "./kpi-cards"
import { BillWizardSheet } from "../wizard/bill-wizard-sheet"

const statusColors: Record<BillStatus, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  CONFIRMED: "default",
  PARTIAL_PAID: "outline",
  PAID: "default",
  CANCELLED: "destructive",
}

const statusOptions = [
  { value: "ALL", label: "All Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PARTIAL_PAID", label: "Partial Paid" },
  { value: "PAID", label: "Paid" },
  { value: "CANCELLED", label: "Cancelled" },
]

export function RentBillList() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const { data: bills = [], isLoading: loading, error, refetch } = useRentBills(
    statusFilter === "ALL" ? undefined : { status: statusFilter as BillStatus }
  )
  const [cancelBill, setCancelBill] = React.useState<RentBillHeader | null>(null)
  const [cancelReason, setCancelReason] = React.useState("")
  const [cancelling, setCancelling] = React.useState(false)
  const [wizardOpen, setWizardOpen] = React.useState(false)

  const handleCancel = async () => {
    if (!cancelBill || !cancelReason.trim()) return

    setCancelling(true)
    try {
      await rentBillService.cancelRentBill(cancelBill.id, cancelReason)
      refetch()
    } catch (err) {
      console.error("Failed to cancel bill:", err)
    } finally {
      setCancelling(false)
      setCancelBill(null)
      setCancelReason("")
    }
  }

  const handleConfirm = async (bill: RentBillHeader) => {
    try {
      await rentBillService.confirmRentBill(bill.id)
      refetch()
    } catch (err) {
      console.error("Failed to confirm bill:", err)
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
      <BillingKpiCards />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rent Bills</h2>
          <p className="text-muted-foreground">
            Manage rent bills and collections
          </p>
        </div>
        <Button onClick={() => setWizardOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Bill
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Party</TableHead>
              <TableHead className="text-right">Taxable</TableHead>
              <TableHead className="text-right">GST</TableHead>
              <TableHead className="text-right">Net Amount</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  Loading bills...
                </TableCell>
              </TableRow>
            ) : bills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No bills found. Create your first bill to get started.
                </TableCell>
              </TableRow>
            ) : (
              bills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.bill_no}</TableCell>
                  <TableCell>{formatDate(bill.bill_date)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{bill.party_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {bill.party_code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatIndianRupees(bill.taxable_amount)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatIndianRupees(bill.total_gst)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {formatIndianRupees(bill.net_amount)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {bill.balance_amount > 0 ? (
                      <span className="text-destructive">
                        {formatIndianRupees(bill.balance_amount)}
                      </span>
                    ) : (
                      <span className="text-green-600">Paid</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[bill.status]}>
                      {bill.status_display}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate({ to: "/app/billing/$id", params: { id: bill.id } })
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        {bill.status === "DRAFT" && (
                          <DropdownMenuItem onClick={() => handleConfirm(bill)}>
                            <Receipt className="mr-2 h-4 w-4" />
                            Confirm
                          </DropdownMenuItem>
                        )}
                        {bill.status !== "CANCELLED" && bill.status !== "PAID" && (
                          <DropdownMenuItem
                            onClick={() =>
                              navigate({
                                to: "/app/billing/receipts/new",
                                search: { party_id: bill.party, bill_id: bill.id },
                              })
                            }
                          >
                            <Receipt className="mr-2 h-4 w-4" />
                            New Receipt
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </DropdownMenuItem>
                        {bill.status !== "CANCELLED" && bill.paid_amount === 0 && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setCancelBill(bill)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
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

      <AlertDialog open={!!cancelBill} onOpenChange={() => setCancelBill(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel bill {cancelBill?.bill_no}? This action cannot be
              undone.
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

      <BillWizardSheet
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
