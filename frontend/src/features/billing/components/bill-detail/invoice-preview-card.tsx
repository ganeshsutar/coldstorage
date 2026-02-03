import * as React from "react"
import { Printer, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  formatIndianRupees,
  convertAmountToWords,
} from "../../utils/amount-to-words"
import type { RentBillHeader } from "../../types"

interface InvoicePreviewCardProps {
  bill: RentBillHeader
  onPrint?: () => void
  onDownload?: () => void
}

export function InvoicePreviewCard({
  bill,
  onPrint,
  onDownload,
}: InvoicePreviewCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <CardTitle className="text-base">Invoice</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-6 bg-white space-y-6 print:border-0 print:p-0">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h2 className="text-xl font-bold">KIRAAYA BILL</h2>
            <p className="text-sm text-muted-foreground">(Rent Invoice)</p>
          </div>

          {/* Company & Bill Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Cold Storage XYZ</p>
              <p className="text-sm text-muted-foreground">
                Address Line 1, City
              </p>
              <p className="text-sm text-muted-foreground">
                Ph: 1234567890
              </p>
              <p className="text-sm text-muted-foreground">
                GSTIN: 09XXXXX1234XXXXX
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm">
                <span className="text-muted-foreground">Bill No:</span>{" "}
                <span className="font-mono font-semibold">{bill.bill_no}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Date:</span>{" "}
                <span className="font-medium">{formatDate(bill.bill_date)}</span>
              </p>
            </div>
          </div>

          <Separator />

          {/* Bill To */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Bill To:</p>
              <p className="font-semibold">{bill.party_name}</p>
              <p className="text-sm text-muted-foreground">
                Party Code: {bill.party_code}
              </p>
              {bill.party_gstin && (
                <p className="text-sm text-muted-foreground">
                  GSTIN: {bill.party_gstin}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div>
            <p className="font-medium mb-3">Particulars</p>

            {/* Storage Rent */}
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Storage Rent (HSN: 996721)
              </p>
              {bill.items && bill.items.length > 0 ? (
                <div className="space-y-1 pl-4">
                  {bill.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        Amad #{item.amad_no}: {item.total_packets} bags ×{" "}
                        {item.billable_days} days @ {formatIndianRupees(item.rate_per_qtl)}/qtl
                      </span>
                      <span className="font-mono">
                        {formatIndianRupees(item.rent_amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-medium pt-1 border-t">
                    <span>Sub-total</span>
                    <span className="font-mono">
                      {formatIndianRupees(bill.rent_amount)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between text-sm pl-4">
                  <span>Storage Rent</span>
                  <span className="font-mono">
                    {formatIndianRupees(bill.rent_amount)}
                  </span>
                </div>
              )}
            </div>

            {/* Additional Charges */}
            {bill.loading_charges > 0 && (
              <div className="flex justify-between text-sm">
                <span>Loading Charges</span>
                <span className="font-mono">
                  {formatIndianRupees(bill.loading_charges)}
                </span>
              </div>
            )}
            {bill.unloading_charges > 0 && (
              <div className="flex justify-between text-sm">
                <span>Unloading Charges</span>
                <span className="font-mono">
                  {formatIndianRupees(bill.unloading_charges)}
                </span>
              </div>
            )}
            {bill.dala_charges > 0 && (
              <div className="flex justify-between text-sm">
                <span>Dala Charges</span>
                <span className="font-mono">
                  {formatIndianRupees(bill.dala_charges)}
                </span>
              </div>
            )}
            {bill.katai_charges > 0 && (
              <div className="flex justify-between text-sm">
                <span>Katai Charges</span>
                <span className="font-mono">
                  {formatIndianRupees(bill.katai_charges)}
                </span>
              </div>
            )}
            {bill.insurance_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Insurance</span>
                <span className="font-mono">
                  {formatIndianRupees(bill.insurance_amount)}
                </span>
              </div>
            )}
            {bill.reload_charges > 0 && (
              <div className="flex justify-between text-sm">
                <span>Reload Charges</span>
                <span className="font-mono">
                  {formatIndianRupees(bill.reload_charges)}
                </span>
              </div>
            )}
            {bill.dump_charges > 0 && (
              <div className="flex justify-between text-sm">
                <span>Dump Charges</span>
                <span className="font-mono">
                  {formatIndianRupees(bill.dump_charges)}
                </span>
              </div>
            )}
            {bill.other_charges > 0 && (
              <div className="flex justify-between text-sm">
                <span>Other Charges</span>
                <span className="font-mono">
                  {formatIndianRupees(bill.other_charges)}
                </span>
              </div>
            )}
            {bill.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span className="font-mono">
                  -{formatIndianRupees(bill.discount_amount)}
                </span>
              </div>
            )}

            <Separator className="my-3" />

            {/* Totals */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Taxable Amount</span>
                <span className="font-mono">
                  {formatIndianRupees(bill.taxable_amount)}
                </span>
              </div>
              {bill.gst_type === "INTRA" ? (
                <>
                  {bill.cgst_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>CGST @ {bill.cgst_rate}%</span>
                      <span className="font-mono">
                        {formatIndianRupees(bill.cgst_amount)}
                      </span>
                    </div>
                  )}
                  {bill.sgst_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>SGST @ {bill.sgst_rate}%</span>
                      <span className="font-mono">
                        {formatIndianRupees(bill.sgst_amount)}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                bill.igst_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>IGST @ {bill.igst_rate}%</span>
                    <span className="font-mono">
                      {formatIndianRupees(bill.igst_amount)}
                    </span>
                  </div>
                )
              )}
              {bill.round_off !== 0 && (
                <div className="flex justify-between text-sm">
                  <span>Round Off</span>
                  <span className="font-mono">
                    {bill.round_off > 0 ? "+" : ""}
                    {formatIndianRupees(bill.round_off)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>TOTAL</span>
                <span className="font-mono">
                  {formatIndianRupees(bill.net_amount)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Amount in Words */}
          <div>
            <p className="text-sm text-muted-foreground">Amount in Words:</p>
            <p className="font-medium">
              {convertAmountToWords(bill.net_amount)}
            </p>
          </div>

          {/* Payment Status */}
          {bill.paid_amount > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Paid Amount</span>
                <span className="font-mono text-green-600">
                  {formatIndianRupees(bill.paid_amount)}
                </span>
              </div>
              {bill.balance_amount > 0 && (
                <div className="flex justify-between text-sm font-medium">
                  <span>Balance Due</span>
                  <span className="font-mono text-destructive">
                    {formatIndianRupees(bill.balance_amount)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Bank Details */}
          <div className="text-sm">
            <p className="text-muted-foreground">Bank Details:</p>
            <p>Bank: HDFC Bank | A/C: 1234567890</p>
            <p>IFSC: HDFC0001234 | Branch: Main</p>
          </div>

          {/* Terms */}
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Terms & Conditions:</p>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>Payment due within 15 days</li>
              <li>Interest @ 1.5% per month on overdue payments</li>
            </ol>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8">
            <div className="text-center">
              <div className="border-t pt-2">
                <p className="text-sm text-muted-foreground">
                  Receiver Signature
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t pt-2">
                <p className="text-sm text-muted-foreground">
                  Authorized Signature
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
