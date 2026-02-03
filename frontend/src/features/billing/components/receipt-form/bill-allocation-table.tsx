import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { formatIndianRupees } from "../../utils/amount-to-words"
import type { RentBillHeader } from "../../types"

export interface BillAllocation {
  bill_id: string
  bill_no: string
  bill_date: string
  bill_amount: number
  balance_amount: number
  allocated_amount: number
}

interface BillAllocationTableProps {
  bills: RentBillHeader[]
  allocations: BillAllocation[]
  onAllocationsChange: (allocations: BillAllocation[]) => void
  totalAmount: number
  autoAdjust: boolean
  onAutoAdjustChange: (value: boolean) => void
  loading?: boolean
}

export function BillAllocationTable({
  bills,
  allocations,
  onAllocationsChange,
  totalAmount,
  autoAdjust,
  onAutoAdjustChange,
  loading = false,
}: BillAllocationTableProps) {
  // Use refs to avoid stale closures in effects
  const onAllocationsChangeRef = React.useRef(onAllocationsChange)
  const allocationsRef = React.useRef(allocations)

  React.useEffect(() => {
    onAllocationsChangeRef.current = onAllocationsChange
  }, [onAllocationsChange])

  React.useEffect(() => {
    allocationsRef.current = allocations
  }, [allocations])

  // Initialize allocations from bills
  React.useEffect(() => {
    if (bills.length > 0 && allocationsRef.current.length === 0) {
      const newAllocations = bills.map((bill) => ({
        bill_id: bill.id,
        bill_no: bill.bill_no,
        bill_date: bill.bill_date,
        bill_amount: bill.net_amount,
        balance_amount: bill.balance_amount,
        allocated_amount: 0,
      }))
      onAllocationsChangeRef.current(newAllocations)
    }
  }, [bills])

  // Auto-adjust allocations when enabled
  React.useEffect(() => {
    if (autoAdjust && totalAmount > 0) {
      let remaining = totalAmount
      const newAllocations = allocationsRef.current.map((alloc) => {
        if (remaining <= 0) {
          return { ...alloc, allocated_amount: 0 }
        }
        const toAllocate = Math.min(remaining, alloc.balance_amount)
        remaining -= toAllocate
        return { ...alloc, allocated_amount: toAllocate }
      })
      onAllocationsChangeRef.current(newAllocations)
    }
  }, [autoAdjust, totalAmount])

  const handleAllocationChange = (billId: string, amount: number) => {
    const newAllocations = allocations.map((alloc) =>
      alloc.bill_id === billId
        ? {
            ...alloc,
            allocated_amount: Math.min(amount, alloc.balance_amount),
          }
        : alloc
    )
    onAllocationsChange(newAllocations)
  }

  const handleSelectBill = (billId: string, selected: boolean) => {
    const bill = allocations.find((a) => a.bill_id === billId)
    if (!bill) return

    const newAllocations = allocations.map((alloc) =>
      alloc.bill_id === billId
        ? {
            ...alloc,
            allocated_amount: selected ? alloc.balance_amount : 0,
          }
        : alloc
    )
    onAllocationsChange(newAllocations)
  }

  const totalAllocated = allocations.reduce(
    (sum, a) => sum + a.allocated_amount,
    0
  )
  const unallocated = totalAmount - totalAllocated

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
          Loading unpaid bills...
        </CardContent>
      </Card>
    )
  }

  if (bills.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
          No unpaid bills found for this party.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Bill Adjustment</CardTitle>
          <div className="flex items-center gap-2">
            <Switch
              id="auto-adjust"
              checked={autoAdjust}
              onCheckedChange={onAutoAdjustChange}
            />
            <Label htmlFor="auto-adjust" className="text-sm font-normal">
              Auto-adjust against oldest bills
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Bill#</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right w-[140px]">Adjust</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.map((alloc) => (
                <TableRow
                  key={alloc.bill_id}
                  className={alloc.allocated_amount > 0 ? "bg-muted/50" : ""}
                >
                  <TableCell>
                    <Checkbox
                      checked={alloc.allocated_amount > 0}
                      onCheckedChange={(checked) =>
                        handleSelectBill(alloc.bill_id, checked as boolean)
                      }
                      disabled={autoAdjust}
                    />
                  </TableCell>
                  <TableCell className="font-mono">{alloc.bill_no}</TableCell>
                  <TableCell>{formatDate(alloc.bill_date)}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatIndianRupees(alloc.bill_amount)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-green-600">
                    {formatIndianRupees(
                      alloc.bill_amount - alloc.balance_amount
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatIndianRupees(alloc.balance_amount)}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      max={alloc.balance_amount}
                      value={alloc.allocated_amount || ""}
                      onChange={(e) =>
                        handleAllocationChange(
                          alloc.bill_id,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled={autoAdjust}
                      className="h-8 text-right font-mono"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6} className="font-medium">
                  Total Adjustment
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {formatIndianRupees(totalAllocated)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm">
          <div className="flex items-center gap-6">
            <span>
              Receipt Amount:{" "}
              <span className="font-medium font-mono">
                {formatIndianRupees(totalAmount)}
              </span>
            </span>
            <span>
              Allocated:{" "}
              <span className="font-medium font-mono text-green-600">
                {formatIndianRupees(totalAllocated)}
              </span>
            </span>
          </div>
          {unallocated !== 0 && (
            <span
              className={
                unallocated > 0 ? "text-amber-600" : "text-destructive"
              }
            >
              {unallocated > 0 ? "Unallocated: " : "Over-allocated: "}
              <span className="font-medium font-mono">
                {formatIndianRupees(Math.abs(unallocated))}
              </span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
