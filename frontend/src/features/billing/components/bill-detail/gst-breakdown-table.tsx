import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

interface GstBreakdownTableProps {
  bill: RentBillHeader
}

export function GstBreakdownTable({ bill }: GstBreakdownTableProps) {
  const isIntra = bill.gst_type === "INTRA"

  // Group breakups by HSN code if available
  const breakups = bill.breakups || []

  // If no breakups, create a single summary row
  const summaryRow = {
    hsn_code: "996721",
    description: "Cold Storage Services",
    taxable_amount: bill.taxable_amount,
    cgst_amount: bill.cgst_amount,
    sgst_amount: bill.sgst_amount,
    igst_amount: bill.igst_amount,
  }

  const rows = breakups.length > 0
    ? breakups.map((b) => ({
        hsn_code: b.hsn_code || "996721",
        description: b.component_display || b.description || "Services",
        taxable_amount: b.amount,
        cgst_amount: isIntra ? (b.amount * bill.cgst_rate) / 100 : 0,
        sgst_amount: isIntra ? (b.amount * bill.sgst_rate) / 100 : 0,
        igst_amount: !isIntra ? (b.amount * bill.igst_rate) / 100 : 0,
      }))
    : [summaryRow]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">GST Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>HSN Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Taxable</TableHead>
                {isIntra ? (
                  <>
                    <TableHead className="text-right">
                      CGST @ {bill.cgst_rate}%
                    </TableHead>
                    <TableHead className="text-right">
                      SGST @ {bill.sgst_rate}%
                    </TableHead>
                  </>
                ) : (
                  <TableHead className="text-right">
                    IGST @ {bill.igst_rate}%
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono">{row.hsn_code}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatIndianRupees(row.taxable_amount)}
                  </TableCell>
                  {isIntra ? (
                    <>
                      <TableCell className="text-right font-mono">
                        {formatIndianRupees(row.cgst_amount)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatIndianRupees(row.sgst_amount)}
                      </TableCell>
                    </>
                  ) : (
                    <TableCell className="text-right font-mono">
                      {formatIndianRupees(row.igst_amount)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-medium">
                  Total
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {formatIndianRupees(bill.taxable_amount)}
                </TableCell>
                {isIntra ? (
                  <>
                    <TableCell className="text-right font-mono font-medium">
                      {formatIndianRupees(bill.cgst_amount)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatIndianRupees(bill.sgst_amount)}
                    </TableCell>
                  </>
                ) : (
                  <TableCell className="text-right font-mono font-medium">
                    {formatIndianRupees(bill.igst_amount)}
                  </TableCell>
                )}
              </TableRow>
            </TableFooter>
          </Table>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Total Tax: {formatIndianRupees(bill.total_gst)} ({bill.gst_type_display})
        </p>
      </CardContent>
    </Card>
  )
}
