import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { Plus, Eye, XCircle, MoreHorizontal } from "lucide-react"
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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

import { useAdvances } from "../../hooks/use-advances"
import { useLoans } from "../../hooks/use-loans"
import { advanceService } from "../../api/advances"
import { loanService } from "../../api/loans"
import {
  getAdvanceStatusColor,
  getLoanStatusColor,
  formatDate,
  formatCurrency,
  formatNumber,
  formatInterestRate,
} from "../../utils"
import type { Advance, Loan } from "../../types"
import { LoanKpiCards } from "../dashboard/kpi-cards"

export function LoanDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = React.useState("advances")
  const [cancelItem, setCancelItem] = React.useState<{ type: "advance" | "loan"; item: Advance | Loan } | null>(null)
  const [cancelReason, setCancelReason] = React.useState("")
  const [cancelling, setCancelling] = React.useState(false)

  const { advances, loading: advancesLoading, refetch: refetchAdvances } = useAdvances()
  const { loans, loading: loansLoading, refetch: refetchLoans } = useLoans()

  const handleCancel = async () => {
    if (!cancelItem || !cancelReason.trim()) return

    setCancelling(true)
    try {
      if (cancelItem.type === "advance") {
        await advanceService.cancelAdvance(cancelItem.item.id, cancelReason)
        refetchAdvances()
      } else {
        await loanService.cancelLoan(cancelItem.item.id, cancelReason)
        refetchLoans()
      }
    } catch {
      toast.error("Failed to cancel")
    } finally {
      setCancelling(false)
      setCancelItem(null)
      setCancelReason("")
    }
  }

  const cancelLabel = cancelItem?.type === "advance"
    ? `advance ${(cancelItem.item as Advance).advance_no}`
    : `loan ${(cancelItem?.item as Loan)?.loan_no}`

  return (
    <div className="space-y-6">
      <LoanKpiCards />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Loans & Advances</h2>
          <p className="text-muted-foreground">
            Manage advances (Pesgi) and loans against goods (Karz)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate({ to: "/app/loans/loans/new" })}>
            <Plus className="mr-2 size-4" />
            New Loan
          </Button>
          <Button onClick={() => navigate({ to: "/app/loans/advances/new" })}>
            <Plus className="mr-2 size-4" />
            New Advance
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="advances">Advances</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="advances" className="mt-4">
          <AdvancesTable
            advances={advances}
            loading={advancesLoading}
            onView={(id) => navigate({ to: "/app/loans/advances/$id", params: { id } })}
            onCancel={(advance) => setCancelItem({ type: "advance", item: advance })}
          />
        </TabsContent>

        <TabsContent value="loans" className="mt-4">
          <LoansTable
            loans={loans}
            loading={loansLoading}
            onView={(id) => navigate({ to: "/app/loans/loans/$id", params: { id } })}
            onCancel={(loan) => setCancelItem({ type: "loan", item: loan })}
          />
        </TabsContent>

        <TabsContent value="ledger" className="mt-4">
          <div className="flex justify-center py-8 text-muted-foreground">
            <Button variant="outline" onClick={() => navigate({ to: "/app/loans/ledger" })}>
              Open Full Ledger View
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!cancelItem} onOpenChange={() => setCancelItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel {cancelItem?.type === "advance" ? "Advance" : "Loan"}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel {cancelLabel}? This action cannot be undone.
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

function AdvancesTable({
  advances,
  loading,
  onView,
  onCancel,
}: {
  advances: Advance[]
  loading: boolean
  onView: (id: string) => void
  onCancel: (advance: Advance) => void
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Advance No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Party</TableHead>
            <TableHead className="text-right">Bags</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                Loading advances...
              </TableCell>
            </TableRow>
          ) : advances.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No advances found.
              </TableCell>
            </TableRow>
          ) : (
            advances.map((advance) => (
              <TableRow key={advance.id}>
                <TableCell className="font-medium">{advance.advance_no}</TableCell>
                <TableCell>{formatDate(advance.date)}</TableCell>
                <TableCell>{advance.party_name}</TableCell>
                <TableCell className="text-right font-mono">{formatNumber(advance.bags)}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(advance.amount)}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(advance.balance_amount)}</TableCell>
                <TableCell>
                  <Badge variant={getAdvanceStatusColor(advance.status)}>
                    {advance.status_display}
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
                      <DropdownMenuItem onClick={() => onView(advance.id)}>
                        <Eye className="mr-2 size-4" />
                        View
                      </DropdownMenuItem>
                      {advance.status === "ACTIVE" && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onCancel(advance)}
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
  )
}

function LoansTable({
  loans,
  loading,
  onView,
  onCancel,
}: {
  loans: Loan[]
  loading: boolean
  onView: (id: string) => void
  onCancel: (loan: Loan) => void
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Loan No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Amad</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Rate</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center">
                Loading loans...
              </TableCell>
            </TableRow>
          ) : loans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground">
                No loans found.
              </TableCell>
            </TableRow>
          ) : (
            loans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell className="font-medium">{loan.loan_no}</TableCell>
                <TableCell>{formatDate(loan.date)}</TableCell>
                <TableCell>{loan.party_name}</TableCell>
                <TableCell>{loan.amad_no}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(loan.amount)}</TableCell>
                <TableCell className="text-right font-mono">{formatInterestRate(loan.interest_rate)}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(loan.balance_amount)}</TableCell>
                <TableCell>
                  <Badge variant={getLoanStatusColor(loan.status)}>
                    {loan.status_display}
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
                      <DropdownMenuItem onClick={() => onView(loan.id)}>
                        <Eye className="mr-2 size-4" />
                        View
                      </DropdownMenuItem>
                      {loan.status === "ACTIVE" && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onCancel(loan)}
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
  )
}
