import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { Plus, XCircle, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useStaffLoans, useCancelStaffLoan } from "../../hooks"
import { getStaffLoanStatusColor, formatCurrency, formatDate } from "../../utils"
import type { StaffLoan } from "../../types"

export function StaffLoanList() {
  const navigate = useNavigate()
  const { data: loans, isLoading } = useStaffLoans()
  const cancelLoan = useCancelStaffLoan()

  const [cancelItem, setCancelItem] = React.useState<StaffLoan | null>(null)
  const [cancelReason, setCancelReason] = React.useState("")

  const handleCancel = async () => {
    if (!cancelItem || !cancelReason.trim()) return
    try {
      await cancelLoan.mutateAsync({ id: cancelItem.id, reason: cancelReason })
    } catch {
      toast.error("Failed to cancel loan")
    } finally {
      setCancelItem(null)
      setCancelReason("")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => navigate({ to: "/app/payroll/staff-loans/new" })}>
          <Plus className="mr-2 size-4" />
          New Staff Loan
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loan No</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">EMI</TableHead>
              <TableHead className="text-right">Repaid</TableHead>
              <TableHead className="w-[120px]">Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  Loading loans...
                </TableCell>
              </TableRow>
            ) : !loans?.length ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No staff loans found.
                </TableCell>
              </TableRow>
            ) : (
              loans.map((loan) => {
                const progress =
                  loan.loan_amount > 0
                    ? Math.round((loan.repaid_amount / loan.loan_amount) * 100)
                    : 0
                return (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium font-mono">{loan.loan_no}</TableCell>
                    <TableCell>{loan.employee_name}</TableCell>
                    <TableCell>{formatDate(loan.loan_date)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(loan.loan_amount)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(loan.emi)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(loan.repaid_amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="h-2" />
                        <span className="text-xs text-muted-foreground w-8">{progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStaffLoanStatusColor(loan.status)}>
                        {loan.status_display}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {loan.status === "ACTIVE" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Open menu">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setCancelItem(loan)}
                            >
                              <XCircle className="mr-2 size-4" />
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!cancelItem} onOpenChange={() => setCancelItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Staff Loan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel loan {cancelItem?.loan_no}? This action cannot be
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
            <AlertDialogCancel disabled={cancelLoan.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelLoan.isPending || !cancelReason.trim()}
            >
              {cancelLoan.isPending ? "Cancelling..." : "Confirm Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
