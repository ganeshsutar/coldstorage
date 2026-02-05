import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Truck, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

import { useSaudaDetail } from "../../hooks/use-saudas"
import { saudaService } from "../../api/saudas"
import { getDealStatusColor, getGatePassStatusColor, formatDate, formatCurrency, formatNumber, formatDealProgress } from "../../utils"

interface DealDetailViewProps {
  dealId: string
}

export function DealDetailView({ dealId }: DealDetailViewProps) {
  const navigate = useNavigate()
  const { sauda, loading, error, refetch } = useSaudaDetail(dealId)
  const [showCancelDialog, setShowCancelDialog] = React.useState(false)
  const [cancelReason, setCancelReason] = React.useState("")
  const [cancelling, setCancelling] = React.useState(false)

  const handleCancel = async () => {
    if (!sauda || !cancelReason.trim()) return

    setCancelling(true)
    try {
      await saudaService.cancelSauda(sauda.id, cancelReason)
      refetch()
    } catch (err) {
      console.error("Failed to cancel deal:", err)
    } finally {
      setCancelling(false)
      setShowCancelDialog(false)
      setCancelReason("")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-muted-foreground">Loading deal...</div>
      </div>
    )
  }

  if (error || !sauda) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-destructive">{error || "Deal not found"}</div>
      </div>
    )
  }

  const progress = formatDealProgress(sauda.dispatched_quantity, sauda.quantity)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/app/trading" })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{sauda.deal_no}</h1>
              <Badge variant={getDealStatusColor(sauda.status)}>
                {sauda.status_display}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {sauda.seller_name} → {sauda.buyer_name}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {sauda.status !== "CANCELLED" && sauda.status !== "DISPATCHED" && (
            <Button
              onClick={() => navigate({
                to: "/app/trading/gate-passes/new",
                search: { sauda_id: sauda.id },
              })}
            >
              <Truck className="mr-2 h-4 w-4" />
              Create Gate Pass
            </Button>
          )}
          {sauda.status !== "CANCELLED" && sauda.dispatched_quantity === 0 && (
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Seller</Label>
                  <p className="font-medium">{sauda.seller_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Buyer</Label>
                  <p className="font-medium">{sauda.buyer_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Commodity</Label>
                  <p className="font-medium">{sauda.commodity_name}</p>
                  {sauda.variety && (
                    <p className="text-sm text-muted-foreground">{sauda.variety}</p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Deal Date</Label>
                  <p className="font-medium">{formatDate(sauda.deal_date)}</p>
                </div>
              </div>

              {(sauda.delivery_location || sauda.payment_terms || sauda.remarks) && (
                <div className="pt-4 border-t space-y-3">
                  {sauda.delivery_location && (
                    <div>
                      <Label className="text-muted-foreground">Delivery Location</Label>
                      <p>{sauda.delivery_location}</p>
                    </div>
                  )}
                  {sauda.payment_terms && (
                    <div>
                      <Label className="text-muted-foreground">Payment Terms</Label>
                      <p>{sauda.payment_terms}</p>
                    </div>
                  )}
                  {sauda.remarks && (
                    <div>
                      <Label className="text-muted-foreground">Remarks</Label>
                      <p>{sauda.remarks}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gate Passes */}
          {sauda.gate_passes && sauda.gate_passes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Gate Passes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>GP No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Packets</TableHead>
                      <TableHead className="text-right">Weight</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sauda.gate_passes.map((gp) => (
                      <TableRow key={gp.id}>
                        <TableCell className="font-medium">{gp.gp_no}</TableCell>
                        <TableCell>{formatDate(gp.gp_date)}</TableCell>
                        <TableCell className="text-right font-mono">{gp.total_packets}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(gp.total_weight)} kg</TableCell>
                        <TableCell>{gp.vehicle_no || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={getGatePassStatusColor(gp.status)}>
                            {gp.status_display}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-mono">{formatNumber(sauda.quantity)} bags</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span className="font-mono">{formatCurrency(sauda.rate)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total Amount</span>
                <span className="font-mono">{formatCurrency(sauda.amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Dispatch Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dispatch Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dispatched</span>
                <span className="font-mono">{formatNumber(sauda.dispatched_quantity)} bags</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Balance</span>
                <span className="font-mono">{formatNumber(sauda.balance_quantity)} bags</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">{progress}% dispatched</p>
            </CardContent>
          </Card>

          {/* Due Date */}
          {(sauda.due_date || sauda.due_days > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Delivery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sauda.due_days > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Due Days</span>
                    <span>{sauda.due_days}</span>
                  </div>
                )}
                {sauda.due_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Due Date</span>
                    <span>{formatDate(sauda.due_date)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Audit */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(sauda.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span>{formatDate(sauda.updated_at)}</span>
              </div>
              {sauda.cancelled_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cancelled</span>
                  <span>{formatDate(sauda.cancelled_at)}</span>
                </div>
              )}
              {sauda.cancel_reason && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground">Reason: </span>
                  <span>{sauda.cancel_reason}</span>
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
            <AlertDialogTitle>Cancel Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel deal {sauda.deal_no}?
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
