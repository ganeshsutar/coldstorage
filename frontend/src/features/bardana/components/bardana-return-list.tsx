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
import { useBardanaReturns, useConfirmBardanaReturn, useCancelBardanaReturn } from "../hooks"
import type { BardanaReturnHeader, BardanaStatus } from "../types"

const statusColors: Record<BardanaStatus, "default" | "secondary" | "destructive"> = {
  DRAFT: "secondary",
  CONFIRMED: "default",
  CANCELLED: "destructive",
}

export function BardanaReturnList() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const { data: returns = [], isLoading } = useBardanaReturns(
    statusFilter === "ALL" ? undefined : { status: statusFilter as BardanaStatus }
  )
  const confirmMutation = useConfirmBardanaReturn()
  const cancelMutation = useCancelBardanaReturn()
  const [cancelReturn, setCancelReturn] = React.useState<BardanaReturnHeader | null>(null)
  const [cancelReason, setCancelReason] = React.useState("")

  const handleConfirm = async (ret: BardanaReturnHeader) => {
    try {
      await confirmMutation.mutateAsync(ret.id)
    } catch {
      // Error handled by mutation
    }
  }

  const handleCancel = async () => {
    if (!cancelReturn || !cancelReason.trim()) return
    try {
      await cancelMutation.mutateAsync({ id: cancelReturn.id, reason: cancelReason })
    } catch {
      // Error handled by mutation
    } finally {
      setCancelReturn(null)
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
          <h2 className="text-2xl font-bold tracking-tight">Bardana Returns</h2>
          <p className="text-muted-foreground">Manage bardana returned by parties</p>
        </div>
        <Button onClick={() => navigate({ to: "/app/bardana/returns/new" })}>
          <Plus className="mr-2 h-4 w-4" />
          New Return
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
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : returns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No returns found.
                </TableCell>
              </TableRow>
            ) : (
              returns.map((ret) => (
                <TableRow key={ret.id}>
                  <TableCell className="font-medium">{ret.voucher_no}</TableCell>
                  <TableCell>{formatDate(ret.date)}</TableCell>
                  <TableCell>{ret.party_name}</TableCell>
                  <TableCell className="text-right">{ret.total_qty}</TableCell>
                  <TableCell className="text-right font-mono">
                    {Number(ret.total_amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[ret.status]}>
                      {ret.status_display}
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
                              to: "/app/bardana/returns/$id",
                              params: { id: ret.id },
                            })
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        {ret.status === "DRAFT" && (
                          <DropdownMenuItem onClick={() => handleConfirm(ret)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm
                          </DropdownMenuItem>
                        )}
                        {ret.status !== "CANCELLED" && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setCancelReturn(ret)}
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

      <AlertDialog open={!!cancelReturn} onOpenChange={() => setCancelReturn(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Return</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel return {cancelReturn?.voucher_no}?
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
