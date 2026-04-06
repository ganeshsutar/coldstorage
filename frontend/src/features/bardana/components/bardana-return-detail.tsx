import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { useBardanaReturnDetail, useConfirmBardanaReturn } from "../hooks"
import type { BardanaStatus, BardanaCondition } from "../types"

const statusColors: Record<BardanaStatus, "default" | "secondary" | "destructive"> = {
  DRAFT: "secondary",
  CONFIRMED: "default",
  CANCELLED: "destructive",
}

const conditionColors: Record<BardanaCondition, "default" | "secondary" | "destructive"> = {
  GOOD: "default",
  FAIR: "secondary",
  DAMAGED: "destructive",
}

interface BardanaReturnDetailProps {
  returnId: string
}

export function BardanaReturnDetail({ returnId }: BardanaReturnDetailProps) {
  const navigate = useNavigate()
  const { data: ret, isLoading } = useBardanaReturnDetail(returnId)
  const confirmMutation = useConfirmBardanaReturn()

  if (isLoading || !ret) {
    return <div className="text-center py-12">Loading...</div>
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Go back"
          onClick={() => navigate({ to: "/app/bardana/returns" })}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">{ret.voucher_no}</h2>
          <p className="text-muted-foreground">Bardana Return Details</p>
        </div>
        <Badge variant={statusColors[ret.status]}>{ret.status_display}</Badge>
        {ret.status === "DRAFT" && (
          <Button
            onClick={() => confirmMutation.mutateAsync(ret.id)}
            disabled={confirmMutation.isPending}
          >
            <CheckCircle className="mr-2 size-4" />
            {confirmMutation.isPending ? "Confirming..." : "Confirm"}
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{formatDate(ret.date)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Party</span>
              <span>{ret.party_name}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Qty</span>
              <span className="font-medium">{ret.total_qty}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-mono font-medium">
                {Number(ret.total_amount).toFixed(2)}
              </span>
            </div>
            {ret.remarks && (
              <>
                <Separator />
                <div>
                  <span className="text-muted-foreground">Remarks</span>
                  <p className="mt-1">{ret.remarks}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {ret.status === "CANCELLED" && ret.cancel_reason && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="size-4" />
                Cancelled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{ret.cancel_reason}</p>
              {ret.cancelled_at && (
                <p className="text-sm text-muted-foreground mt-2">
                  Cancelled on {formatDate(ret.cancelled_at)}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {ret.items && ret.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Condition</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ret.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{item.bardana_type_name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({item.bardana_type_code})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{item.qty}</TableCell>
                    <TableCell className="text-right font-mono">
                      {Number(item.rate).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {Number(item.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={conditionColors[item.condition]}>
                        {item.condition_display}
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
  )
}
