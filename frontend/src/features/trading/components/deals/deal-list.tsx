import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { Plus, Eye, Truck, Scissors, XCircle, MoreHorizontal } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useSaudas } from "../../hooks/use-saudas"
import { useGatePasses } from "../../hooks/use-gate-passes"
import { useKatais } from "../../hooks/use-katais"
import { saudaService } from "../../api/saudas"
import { getDealStatusColor, getGatePassStatusColor, formatDate, formatCurrency, formatNumber } from "../../utils"
import type { Sauda, DealStatus } from "../../types"
import { TradingKpiCards } from "./kpi-cards"
import { GatePassForm } from "../gate-pass-form/gate-pass-form"
import { GradingForm } from "../grading-form/grading-form"

export function DealList() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = React.useState("open")
  const [cancelDeal, setCancelDeal] = React.useState<Sauda | null>(null)
  const [cancelReason, setCancelReason] = React.useState("")
  const [cancelling, setCancelling] = React.useState(false)
  const [showGatePassDialog, setShowGatePassDialog] = React.useState(false)
  const [showGradingDialog, setShowGradingDialog] = React.useState(false)

  const statusFilterMap: Record<string, DealStatus | undefined> = {
    open: "OPEN",
    partial: "PARTIAL",
    completed: "COMPLETED",
    gate_passes: undefined,
    grading: undefined,
  }

  const { saudas, loading: saudasLoading, refetch: refetchSaudas } = useSaudas(
    statusFilterMap[activeTab] ? { status: statusFilterMap[activeTab] } : undefined
  )
  const { gatePasses, loading: gpLoading, refetch: refetchGatePasses } = useGatePasses()
  const { katais, loading: kataisLoading, refetch: refetchKatais } = useKatais()

  const handleCancel = async () => {
    if (!cancelDeal || !cancelReason.trim()) return

    setCancelling(true)
    try {
      await saudaService.cancelSauda(cancelDeal.id, cancelReason)
      refetchSaudas()
    } catch {
      toast.error("Failed to cancel deal")
    } finally {
      setCancelling(false)
      setCancelDeal(null)
      setCancelReason("")
    }
  }

  return (
    <div className="space-y-6">
      <TradingKpiCards />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Trading & Sales</h2>
          <p className="text-muted-foreground">
            Manage deals, gate passes, and grading
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowGatePassDialog(true)}>
            <Truck className="mr-2 size-4" />
            New Gate Pass
          </Button>
          <Button variant="outline" onClick={() => setShowGradingDialog(true)}>
            <Scissors className="mr-2 size-4" />
            New Grading
          </Button>
          <Button onClick={() => navigate({ to: "/app/trading/deals/new" })}>
            <Plus className="mr-2 size-4" />
            New Deal
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="partial">Partial</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="gate_passes">Gate Passes</TabsTrigger>
          <TabsTrigger value="grading">Grading</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="mt-4">
          <DealsTable
            deals={saudas}
            loading={saudasLoading}
            onView={(id) => navigate({ to: "/app/trading/deals/$id", params: { id } })}
            onCreateGP={(deal) => navigate({ to: "/app/trading/gate-passes/new", search: { sauda_id: deal.id } })}
            onCancel={(deal) => setCancelDeal(deal)}
          />
        </TabsContent>

        <TabsContent value="partial" className="mt-4">
          <DealsTable
            deals={saudas}
            loading={saudasLoading}
            onView={(id) => navigate({ to: "/app/trading/deals/$id", params: { id } })}
            onCreateGP={(deal) => navigate({ to: "/app/trading/gate-passes/new", search: { sauda_id: deal.id } })}
            onCancel={(deal) => setCancelDeal(deal)}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <DealsTable
            deals={saudas}
            loading={saudasLoading}
            onView={(id) => navigate({ to: "/app/trading/deals/$id", params: { id } })}
          />
        </TabsContent>

        <TabsContent value="gate_passes" className="mt-4">
          <GatePassesTable
            gatePasses={gatePasses}
            loading={gpLoading}
          />
        </TabsContent>

        <TabsContent value="grading" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => navigate({ to: "/app/trading/grading/new" })}>
              <Plus className="mr-2 size-4" />
              New Grading
            </Button>
          </div>
          <GradingTable katais={katais} loading={kataisLoading} />
        </TabsContent>
      </Tabs>

      <Dialog open={showGatePassDialog} onOpenChange={setShowGatePassDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Gate Pass</DialogTitle>
          </DialogHeader>
          <GatePassForm
            onSuccess={() => {
              setShowGatePassDialog(false)
              refetchSaudas()
              refetchGatePasses()
            }}
            onCancel={() => setShowGatePassDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showGradingDialog} onOpenChange={setShowGradingDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Grading (Katai)</DialogTitle>
          </DialogHeader>
          <GradingForm
            onSuccess={() => {
              setShowGradingDialog(false)
              refetchSaudas()
              refetchKatais()
            }}
            onCancel={() => setShowGradingDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!cancelDeal} onOpenChange={() => setCancelDeal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel deal {cancelDeal?.deal_no}? This action cannot be
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
    </div>
  )
}

function DealsTable({
  deals,
  loading,
  onView,
  onCreateGP,
  onCancel,
}: {
  deals: Sauda[]
  loading: boolean
  onView: (id: string) => void
  onCreateGP?: (deal: Sauda) => void
  onCancel?: (deal: Sauda) => void
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Deal No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Commodity</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Rate</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center">
                Loading deals...
              </TableCell>
            </TableRow>
          ) : deals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-muted-foreground">
                No deals found.
              </TableCell>
            </TableRow>
          ) : (
            deals.map((deal) => (
              <TableRow key={deal.id}>
                <TableCell className="font-medium">{deal.deal_no}</TableCell>
                <TableCell>{formatDate(deal.deal_date)}</TableCell>
                <TableCell>{deal.seller_name}</TableCell>
                <TableCell>{deal.buyer_name}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{deal.commodity_name}</div>
                    {deal.variety && (
                      <div className="text-sm text-muted-foreground">{deal.variety}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(deal.quantity)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(deal.rate)}
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {formatCurrency(deal.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant={getDealStatusColor(deal.status)}>
                    {deal.status_display}
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
                      <DropdownMenuItem onClick={() => onView(deal.id)}>
                        <Eye className="mr-2 size-4" />
                        View
                      </DropdownMenuItem>
                      {onCreateGP && deal.status !== "CANCELLED" && deal.status !== "DISPATCHED" && (
                        <DropdownMenuItem onClick={() => onCreateGP(deal)}>
                          <Truck className="mr-2 size-4" />
                          Create Gate Pass
                        </DropdownMenuItem>
                      )}
                      {onCancel && deal.status !== "CANCELLED" && deal.dispatched_quantity === 0 && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onCancel(deal)}
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

function GatePassesTable({
  gatePasses,
  loading,
}: {
  gatePasses: import("../../types").GatePass[]
  loading: boolean
}) {
  const navigate = useNavigate()

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => navigate({ to: "/app/trading/gate-passes/new" })}>
          <Plus className="mr-2 size-4" />
          New Gate Pass
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>GP No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Deal</TableHead>
              <TableHead className="text-right">Packets</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading gate passes...
                </TableCell>
              </TableRow>
            ) : gatePasses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No gate passes found.
                </TableCell>
              </TableRow>
            ) : (
              gatePasses.map((gp) => (
                <TableRow key={gp.id}>
                  <TableCell className="font-medium">{gp.gp_no}</TableCell>
                  <TableCell>{formatDate(gp.gp_date)}</TableCell>
                  <TableCell>{gp.seller_name}</TableCell>
                  <TableCell>{gp.buyer_name}</TableCell>
                  <TableCell>{gp.sauda_deal_no || "-"}</TableCell>
                  <TableCell className="text-right font-mono">{gp.total_packets}</TableCell>
                  <TableCell>{gp.vehicle_no || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={getGatePassStatusColor(gp.status)}>
                      {gp.status_display}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function GradingTable({
  katais,
  loading,
}: {
  katais: import("../../types").Katai[]
  loading: boolean
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Katai No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Amad</TableHead>
            <TableHead className="text-right">Bags Graded</TableHead>
            <TableHead className="text-right">Charges</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Loading grading records...
              </TableCell>
            </TableRow>
          ) : katais.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No grading records found.
              </TableCell>
            </TableRow>
          ) : (
            katais.map((katai) => (
              <TableRow key={katai.id}>
                <TableCell className="font-medium">{katai.katai_no}</TableCell>
                <TableCell>{formatDate(katai.katai_date)}</TableCell>
                <TableCell>{katai.party_name}</TableCell>
                <TableCell>{katai.amad_no}</TableCell>
                <TableCell className="text-right font-mono">{katai.bags_graded}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(katai.total_charges)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
