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
import { useBardanaIssueDetail, useConfirmBardanaIssue } from "../hooks"
import type { BardanaStatus } from "../types"

const statusColors: Record<BardanaStatus, "default" | "secondary" | "destructive"> = {
  DRAFT: "secondary",
  CONFIRMED: "default",
  CANCELLED: "destructive",
}

interface BardanaIssueDetailProps {
  issueId: string
}

export function BardanaIssueDetail({ issueId }: BardanaIssueDetailProps) {
  const navigate = useNavigate()
  const { data: issue, isLoading } = useBardanaIssueDetail(issueId)
  const confirmMutation = useConfirmBardanaIssue()

  if (isLoading || !issue) {
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
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/app/bardana/issues" })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">{issue.voucher_no}</h2>
          <p className="text-muted-foreground">Bardana Issue Details</p>
        </div>
        <Badge variant={statusColors[issue.status]}>{issue.status_display}</Badge>
        {issue.status === "DRAFT" && (
          <Button
            onClick={() => confirmMutation.mutateAsync(issue.id)}
            disabled={confirmMutation.isPending}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
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
              <span>{formatDate(issue.date)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Party</span>
              <span>{issue.party_name}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Qty</span>
              <span className="font-medium">{issue.total_qty}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-mono font-medium">
                {Number(issue.total_amount).toFixed(2)}
              </span>
            </div>
            {issue.reference_no && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference No</span>
                  <span>{issue.reference_no}</span>
                </div>
              </>
            )}
            {issue.remarks && (
              <>
                <Separator />
                <div>
                  <span className="text-muted-foreground">Remarks</span>
                  <p className="mt-1">{issue.remarks}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {issue.is_advance && (
          <Card>
            <CardHeader>
              <CardTitle>Advance Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Rate</span>
                <span>{issue.interest_rate_pm}% p.m.</span>
              </div>
              {issue.expected_arrival_date && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Arrival</span>
                    <span>{formatDate(issue.expected_arrival_date)}</span>
                  </div>
                </>
              )}
              {issue.expected_bags && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Bags</span>
                    <span>{issue.expected_bags}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {issue.status === "CANCELLED" && issue.cancel_reason && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="h-4 w-4" />
                Cancelled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{issue.cancel_reason}</p>
              {issue.cancelled_at && (
                <p className="text-sm text-muted-foreground mt-2">
                  Cancelled on {formatDate(issue.cancelled_at)}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {issue.items && issue.items.length > 0 && (
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {issue.items.map((item) => (
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
