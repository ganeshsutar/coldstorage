import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { Plus, Eye, CheckCircle, XCircle, MoreHorizontal } from "lucide-react"

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
import { useBardanaIssues, useConfirmBardanaIssue, useCancelBardanaIssue } from "../hooks"
import type { BardanaIssueHeader, BardanaStatus } from "../types"

const statusColors: Record<BardanaStatus, "default" | "secondary" | "destructive"> = {
  DRAFT: "secondary",
  CONFIRMED: "default",
  CANCELLED: "destructive",
}

export function BardanaIssueList() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const { data: issues = [], isLoading } = useBardanaIssues(
    statusFilter === "ALL" ? undefined : { status: statusFilter as BardanaStatus }
  )
  const confirmMutation = useConfirmBardanaIssue()
  const cancelMutation = useCancelBardanaIssue()
  const [cancelIssue, setCancelIssue] = React.useState<BardanaIssueHeader | null>(null)
  const [cancelReason, setCancelReason] = React.useState("")

  const handleConfirm = async (issue: BardanaIssueHeader) => {
    try {
      await confirmMutation.mutateAsync(issue.id)
    } catch {
      // Error handled by mutation
    }
  }

  const handleCancel = async () => {
    if (!cancelIssue || !cancelReason.trim()) return
    try {
      await cancelMutation.mutateAsync({ id: cancelIssue.id, reason: cancelReason })
    } catch {
      // Error handled by mutation
    } finally {
      setCancelIssue(null)
      setCancelReason("")
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bardana Issues</h2>
          <p className="text-muted-foreground">Manage bardana issued to parties</p>
        </div>
        <Button onClick={() => navigate({ to: "/app/bardana/issues/new" })}>
          <Plus className="mr-2 h-4 w-4" />
          New Issue
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Voucher No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Party</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Advance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : issues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No issues found.
                </TableCell>
              </TableRow>
            ) : (
              issues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell className="font-medium">{issue.voucher_no}</TableCell>
                  <TableCell>{formatDate(issue.date)}</TableCell>
                  <TableCell>{issue.party_name}</TableCell>
                  <TableCell className="text-right">{issue.total_qty}</TableCell>
                  <TableCell className="text-right font-mono">
                    {Number(issue.total_amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {issue.is_advance && (
                      <Badge variant="outline">Advance</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[issue.status]}>
                      {issue.status_display}
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
                            navigate({
                              to: "/app/bardana/issues/$id",
                              params: { id: issue.id },
                            })
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        {issue.status === "DRAFT" && (
                          <DropdownMenuItem onClick={() => handleConfirm(issue)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm
                          </DropdownMenuItem>
                        )}
                        {issue.status !== "CANCELLED" && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setCancelIssue(issue)}
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

      <AlertDialog open={!!cancelIssue} onOpenChange={() => setCancelIssue(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Issue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel issue {cancelIssue?.voucher_no}?
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
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={!cancelReason.trim() || cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
